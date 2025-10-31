const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
const PAYSTACK_API_URL = "https://api.paystack.co";

export interface CreateTransactionRequest {
  email: string;
  amount: number; // in kobo (smallest currency unit)
  reference?: string;
  metadata?: Record<string, any>;
}

export interface CreateTransactionResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface CreateInvoiceRequest {
  email: string;
  amount: number; // in kobo
  due_date?: string;
  metadata?: Record<string, any>;
}

export interface CreateInvoiceResponse {
  status: boolean;
  message: string;
  data: {
    invoice: {
      id: number;
      domain: string;
      amount: number;
      currency: string;
      due_date: string;
      has_invoice: boolean;
      invoice_number: string;
      description: string;
      pdf: string;
      line_items: any[];
      tax: any[];
      customer: any;
      request_code: string;
      status: string;
      paid: boolean;
      paid_at: string | null;
      created_at: string;
      sent: boolean;
      offline_reference: string;
    };
  };
}

export async function createTransaction(
  data: CreateTransactionRequest
): Promise<CreateTransactionResponse> {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  const response = await fetch(`${PAYSTACK_API_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create transaction");
  }

  return response.json();
}

export async function createInvoice(
  data: CreateInvoiceRequest
): Promise<CreateInvoiceResponse> {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  const response = await fetch(`${PAYSTACK_API_URL}/paymentrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customer: data.email,
      amount: data.amount,
      currency: "NGN",
      due_date: data.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: data.metadata,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create invoice");
  }

  return response.json();
}

export function getPublicKey(): string {
  if (!PAYSTACK_PUBLIC_KEY) {
    throw new Error("NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not configured");
  }
  return PAYSTACK_PUBLIC_KEY;
}

