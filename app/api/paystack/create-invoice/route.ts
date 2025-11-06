import { NextRequest, NextResponse } from "next/server";
import { createInvoice, createTransaction, createOrGetCustomerCode } from "@/lib/paystack";
import { createOrder } from "@/lib/firebase/orders";
import { generateUniqueRedemptionCode } from "@/lib/utils/redemptionCode";
import { firestoreHelpers } from "@/lib/firebase/firestore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, name, email, address, totalAmount } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items are required" },
        { status: 400 }
      );
    }

    if (!name || !email || !address || !totalAmount) {
      return NextResponse.json(
        { error: "Name, email, address, and totalAmount are required" },
        { status: 400 }
      );
    }

    // Generate unique redemption code
    const redemptionCode = await generateUniqueRedemptionCode(async (code) => {
      const orders = await firestoreHelpers.queryDocuments(
        "orders",
        "redemptionCode",
        "==",
        code
      );
      return orders.length > 0;
    });

    // Ensure Paystack customer exists and get customer code
    const customerCode = await createOrGetCustomerCode(email, name);

    // Create Paystack invoice / payment request and capture offline reference
    const invoiceResponse = await createInvoice({
      email,
      amount: Math.round(totalAmount), // already in kobo
      customerCode,
      metadata: {
        orderName: name,
        address,
        redemptionCode,
      },
    });

    if (!invoiceResponse.status || !invoiceResponse.data) {
      throw new Error("Failed to create Paystack invoice");
    }

    const pr: any = (invoiceResponse as any).data?.invoice || (invoiceResponse as any).data;
    const offlineReference = pr?.offline_reference || pr?.offlineReference || undefined;

    // Also create a Paystack transaction to get access_code for transfer delivery payment
    let deliveryTransferCode: string | undefined;
    try {
      const transaction = await createTransaction({
        email,
        amount: Math.round(totalAmount), // already in kobo
        reference: `ORDER_POD_${Date.now()}`,
        metadata: {
          orderName: name,
          address,
          redemptionCode,
          paymentMethod: "pay_on_delivery",
        },
      });

      if (transaction.status && transaction.data) {
        deliveryTransferCode = transaction.data.access_code;
      }
    } catch (error) {
      console.error("Failed to create transaction for pay_on_delivery:", error);
      // Continue even if transaction creation fails - order still created
    }

    // Create order in Firestore with offline reference and transfer code
    const orderId = await createOrder({
      items,
      name,
      email,
      address,
      paymentMethod: "pay_on_delivery",
      paymentStatus: "pending",
      totalAmount,
      offlineReference,
      deliveryPosCode: offlineReference,
      deliveryTransferCode,
      redemptionCode,
    });

    return NextResponse.json({
      orderId,
      redemptionCode,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create invoice",
      },
      { status: 500 }
    );
  }
}

