import Link from "next/link";
import { notFound } from "next/navigation";

import Navbar from "@/components/Navbar";
import DriverOrderActions from "@/components/driver/DriverOrderActions";
import { getOrderById } from "@/lib/firebase/orders";

interface DriverOrderPageProps {
  params: Promise<{ orderId: string }>;
}

export const dynamic = "force-dynamic";

export default async function DriverOrderPage({ params }: DriverOrderPageProps) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  const statusLabel =
    order.deliveryStatus === "delivered"
      ? "Delivered"
      : order.paymentStatus === "paid"
      ? "Paid"
      : "Pending";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Link href="/driver" className="text-sm text-foreground/70 hover:text-foreground">
          ← Back to orders
        </Link>

        <section className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-6 space-y-4">
            <h1 className="text-2xl font-semibold text-foreground">Order {order.id}</h1>
            <div className="rounded-lg border border-yellow-300 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-4 text-sm text-yellow-900 dark:text-yellow-200">
              <strong>Before starting the transaction</strong>, confirm that the code the customer has matches the one shown here. Do not proceed if the codes differ.
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-sm text-foreground">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Customer</p>
                <p className="font-medium">{order.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Payment Type</p>
                <p className="font-medium">
                  {order.paymentMethod === "pay_now" ? "Pay Now" : "Pay on Delivery"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Amount</p>
                <p className="font-medium">₦{(order.totalAmount / 100).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Status</p>
                <p className="font-medium">{statusLabel}</p>
              </div>
              {order.address && (
                <div className="sm:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Delivery Address</p>
                  <p className="font-medium">{order.address}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <DriverOrderActions order={order} />
      </main>
    </div>
  );
}

