const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
const PAYSTACK_API_URL = "https://api.paystack.co";

export interface CreateTransactionRequest {
  email: string;
  amount: number; // in kobo (smallest currency unit)
  reference?: string;
  metadata?: Record<string, any>;
  channels?: string[]; // Payment channels (e.g., ["bank_transfer"])
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

  const requestBody: Record<string, unknown> = {
    email: data.email,
    amount: data.amount,
    ...(data.reference && { reference: data.reference }),
    ...(data.metadata && { metadata: data.metadata }),
    ...(data.channels && { channels: data.channels }),
  };

  const response = await fetch(`${PAYSTACK_API_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create transaction");
  }

  return response.json();
}

export async function createInvoice(
  data: CreateInvoiceRequest & { customerCode?: string }
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
      // Paystack now expects a customer code for payment requests; fallback to email for older behavior
      customer: data.customerCode || data.email,
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

export interface VerifyTransactionResponse {
  status: boolean;
  message: string;
  data?: {
    status: string; // success | failed | abandoned
    reference: string;
    amount: number;
    paid_at?: string;
    [key: string]: any;
  };
}

export async function verifyTransaction(reference: string): Promise<VerifyTransactionResponse> {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  const response = await fetch(`${PAYSTACK_API_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to verify transaction");
  }

  return response.json();
}

// Helpers for customers
interface PaystackCustomer {
  customer_code: string;
  email: string;
  [key: string]: any;
}

export async function createCustomer(email: string, name?: string): Promise<PaystackCustomer> {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }
  const body: Record<string, any> = { email };
  if (name) body.first_name = name;

  const res = await fetch(`${PAYSTACK_API_URL}/customer`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || "Failed to create customer");
  }
  return json?.data as PaystackCustomer;
}

export async function findCustomerByEmail(email: string): Promise<PaystackCustomer | null> {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }
  // Paystack supports filtering by email via query param on List Customers
  const res = await fetch(`${PAYSTACK_API_URL}/customer?email=${encodeURIComponent(email)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return null;
  }
  // Some responses return an array in data, others may return a single; normalize
  const data = json?.data;
  if (Array.isArray(data)) {
    return (data.find((c: any) => c.email?.toLowerCase() === email.toLowerCase()) || null) as PaystackCustomer | null;
  }
  if (data && data.email?.toLowerCase() === email.toLowerCase()) {
    return data as PaystackCustomer;
  }
  return null;
}

export async function createOrGetCustomerCode(email: string, name?: string): Promise<string> {
  // Try find existing
  const existing = await findCustomerByEmail(email).catch(() => null);
  if (existing?.customer_code) return existing.customer_code;
  // Create new customer
  const created = await createCustomer(email, name);
  return created.customer_code;
}

export function getPublicKey(): string {
  if (!PAYSTACK_PUBLIC_KEY) {
    throw new Error("NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not configured");
    }
  return PAYSTACK_PUBLIC_KEY;
}

