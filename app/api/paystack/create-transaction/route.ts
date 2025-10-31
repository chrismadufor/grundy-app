import { NextRequest, NextResponse } from "next/server";
import { createTransaction } from "@/lib/paystack";
import { createOrder } from "@/lib/firebase/orders";
import { generateUniqueRedemptionCode } from "@/lib/utils/redemptionCode";
import { firestoreHelpers } from "@/lib/firebase/firestore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, name, email, totalAmount } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items are required" },
        { status: 400 }
      );
    }

    if (!name || !email || !totalAmount) {
      return NextResponse.json(
        { error: "Name, email, and totalAmount are required" },
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

    // Create order in Firestore first
    const orderId = await createOrder({
      items,
      name,
      email,
      paymentMethod: "pay_now",
      paymentStatus: "pending",
      totalAmount,
      redemptionCode,
    });

    // Create Paystack transaction
    const transaction = await createTransaction({
      email,
      amount: Math.round(totalAmount * 100), // Convert to kobo
      reference: `ORDER_${orderId}_${Date.now()}`,
      metadata: {
        orderId,
        redemptionCode,
        name,
      },
    });

    if (!transaction.status || !transaction.data) {
      throw new Error("Failed to create Paystack transaction");
    }

    // Update order with Paystack reference
    await firestoreHelpers.updateDocument("orders", orderId, {
      paystackRef: transaction.data.reference,
    });

    return NextResponse.json({
      accessCode: transaction.data.access_code,
      reference: transaction.data.reference,
      orderId,
      redemptionCode,
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create transaction",
      },
      { status: 500 }
    );
  }
}

