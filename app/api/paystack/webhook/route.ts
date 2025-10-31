import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackWebhook, PaystackWebhookEvent } from "@/lib/paystack/verifyWebhook";
import { updateOrderPaymentStatus } from "@/lib/firebase/orders";
import { firestoreHelpers } from "@/lib/firebase/firestore";

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-paystack-signature");
    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 401 }
      );
    }

    const body = await request.text();
    
    // Verify webhook signature
    const isValid = verifyPaystackWebhook(signature, body);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const event: PaystackWebhookEvent = JSON.parse(body);

    // Handle payment.success event
    if (event.event === "charge.success") {
      const reference = event.data.reference;
      
      // Find order by Paystack reference
      const orders = await firestoreHelpers.queryDocuments(
        "orders",
        "paystackRef",
        "==",
        reference
      );

      if (orders.length > 0) {
        const order = orders[0];
        await updateOrderPaymentStatus(order.id, "paid", reference);
      } else {
        // Try to find by metadata orderId if available
        const orderId = event.data.metadata?.orderId;
        if (orderId) {
          await updateOrderPaymentStatus(orderId, "paid", reference);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Webhook processing failed",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Paystack webhook endpoint" });
}

