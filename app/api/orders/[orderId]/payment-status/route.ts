import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getOrderById, updateOrderPaymentStatus } from "@/lib/firebase/orders";

interface RouteParams {
  orderId: string;
}

type PaymentMethod = "pos" | "transfer";

export async function PATCH(request: NextRequest, { params }: { params: Promise<RouteParams> }) {
  try {
    const { orderId } = await params;
    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentMethod !== "pay_on_delivery") {
      return NextResponse.json({ error: "Payment status update only allowed for pay on delivery orders" }, { status: 400 });
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json({ error: "Order already paid" }, { status: 409 });
    }

    const body = await request.json();
    const paymentMethod = body?.paymentMethod as PaymentMethod | undefined;
    const verificationCode = typeof body?.verificationCode === "string" ? body.verificationCode : "";
    const transferReference = typeof body?.transferReference === "string" ? body.transferReference : undefined;

    if (!paymentMethod || !verificationCode) {
      return NextResponse.json({ error: "Payment method and verification code are required" }, { status: 400 });
    }

    // Verify the code matches
    if (paymentMethod === "pos") {
      const expected = order.deliveryPosCode ?? order.offlineReference;
      if (!expected || verificationCode !== expected) {
        return NextResponse.json({ error: "POS delivery code mismatch" }, { status: 403 });
      }
    } else if (paymentMethod === "transfer") {
      if (!order.deliveryTransferCode || verificationCode !== order.deliveryTransferCode) {
        return NextResponse.json({ error: "Transfer delivery code mismatch" }, { status: 403 });
      }
      if (!transferReference) {
        return NextResponse.json({ error: "Paystack reference is required for transfer payments" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    // Update payment status
    await updateOrderPaymentStatus(orderId, "paid", transferReference ?? order.paystackRef);

    revalidatePath("/driver");
    revalidatePath(`/driver/${orderId}`);

    return NextResponse.json({ ok: true, paymentStatus: "paid" });
  } catch (error) {
    console.error("Failed to update payment status", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update payment status" },
      { status: 500 }
    );
  }
}

