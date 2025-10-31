import { NextRequest, NextResponse } from "next/server";
import { createInvoice } from "@/lib/paystack";
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

    // Create Paystack invoice
    const invoiceResponse = await createInvoice({
      email,
      amount: Math.round(totalAmount * 100), // Convert to kobo
      metadata: {
        orderName: name,
        address,
        redemptionCode,
      },
    });

    if (!invoiceResponse.status || !invoiceResponse.data) {
      throw new Error("Failed to create Paystack invoice");
    }

    const invoice = invoiceResponse.data.invoice;
    const offlineReference = invoice.offline_reference;

    // Create order in Firestore
    const orderId = await createOrder({
      items,
      name,
      email,
      address,
      paymentMethod: "pay_on_delivery",
      paymentStatus: "pending",
      totalAmount,
      offlineReference,
      redemptionCode,
    });

    return NextResponse.json({
      orderId,
      redemptionCode,
      offlineReference,
      invoiceNumber: invoice.invoice_number,
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

