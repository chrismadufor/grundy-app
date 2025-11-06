import OrderConfirmation from "@/components/OrderConfirmation";
import { getOrderById, updateOrderPaymentStatus } from "@/lib/firebase/orders";
import Navbar from "@/components/Navbar";
import { verifyTransaction } from "@/lib/paystack";
import ClearCartOnSuccess from "@/components/ClearCartOnSuccess";

interface PageProps {
  searchParams: Promise<{ orderId?: string; method?: string; reference?: string }>;
}

export default async function PaymentSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const orderId = params?.orderId;
  const reference = params?.reference;

  let order = null as any;
  let error: string | null = null;

  if (!orderId) {
    error = "Missing order id";
  } else {
    try {
      if (reference) {
        try {
          const verify = await verifyTransaction(reference);
          if (verify?.status && verify?.data?.status === "success") {
            await updateOrderPaymentStatus(orderId, "paid", verify.data.reference);
          }
        } catch (e) {
          // swallow verify errors for now; page will still render order
        }
      }
      order = await getOrderById(orderId);
      if (!order) error = "Order not found";
    } catch (e) {
      error = "Failed to load order";
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-foreground text-center">Thank you for your purchase</h1>
        {error ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : (
          order && (
            <>
              <ClearCartOnSuccess orderId={order.id} />
              <OrderConfirmation order={order} />
            </>
          )
        )}
      </main>
    </div>
  );
}

