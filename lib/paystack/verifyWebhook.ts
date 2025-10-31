import crypto from "crypto";

const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET;

export function verifyPaystackWebhook(
  signature: string,
  body: string
): boolean {
  if (!PAYSTACK_WEBHOOK_SECRET) {
    throw new Error("PAYSTACK_WEBHOOK_SECRET is not configured");
  }

  const hash = crypto
    .createHmac("sha512", PAYSTACK_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  return hash === signature;
}

export interface PaystackWebhookEvent {
  event: string;
  data: {
    reference: string;
    amount: number;
    customer: {
      email: string;
    };
    metadata?: Record<string, any>;
    [key: string]: any;
  };
}

