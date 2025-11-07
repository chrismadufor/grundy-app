import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import {
  getOrderById,
  markOrderDelivered,
  updateOrderPaymentStatus,
} from "@/lib/firebase/orders";

interface RouteParams {
  orderId: string;
}

type VerificationType = "redemption" | "pos" | "transfer";

export async function PATCH(request: NextRequest, { params }: { params: Promise<RouteParams> }) {
  try {
    const { orderId } = await params;
    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.deliveryStatus === "delivered") {
      return NextResponse.json({ error: "Order already delivered" }, { status: 409 });
    }

    const body = await request.json();
    const verificationType = body?.verificationType as VerificationType | undefined;
    const verificationCode = typeof body?.verificationCode === "string" ? body.verificationCode : "";
    const markPaid = Boolean(body?.markPaid);
    const transferReference = typeof body?.transferReference === "string" ? body.transferReference : undefined;

    if (!verificationType || !verificationCode) {
      return NextResponse.json({ error: "Verification details are required" }, { status: 400 });
    }

    switch (verificationType) {
      case "redemption": {
        if (order.paymentMethod !== "pay_now") {
          return NextResponse.json({ error: "Invalid verification method" }, { status: 400 });
        }
        if (verificationCode !== order.redemptionCode) {
          return NextResponse.json({ error: "Redemption code mismatch" }, { status: 403 });
        }
        if (order.paymentStatus !== "paid") {
          return NextResponse.json({ error: "Payment not confirmed yet" }, { status: 409 });
        }
        break;
      }
      case "pos": {
        if (order.paymentMethod !== "pay_on_delivery") {
          return NextResponse.json({ error: "POS verification not allowed" }, { status: 400 });
        }
        const expected = order.deliveryPosCode ?? order.offlineReference;
        if (!expected || verificationCode !== expected) {
          return NextResponse.json({ error: "POS delivery code mismatch" }, { status: 403 });
        }
        break;
      }
      case "transfer": {
        if (order.paymentMethod !== "pay_on_delivery") {
          return NextResponse.json({ error: "Transfer verification not allowed" }, { status: 400 });
        }
        if (!order.deliveryTransferCode || verificationCode !== order.deliveryTransferCode) {
          return NextResponse.json({ error: "Transfer delivery code mismatch" }, { status: 403 });
        }
        if (!transferReference) {
          return NextResponse.json({ error: "Paystack reference missing" }, { status: 400 });
        }
        break;
      }
      default:
        return NextResponse.json({ error: "Unsupported verification type" }, { status: 400 });
    }

    if (markPaid && order.paymentStatus !== "paid") {
      await updateOrderPaymentStatus(orderId, "paid", transferReference ?? order.paystackRef);
    }

    await markOrderDelivered(orderId, { markPaid: false, reference: transferReference });

    revalidatePath("/driver");
    revalidatePath(`/driver/${orderId}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to mark order delivered", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update order" },
      { status: 500 }
    );
  }
}

