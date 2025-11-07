import Navbar from "@/components/Navbar";
import DriverDashboard from "@/components/driver/DriverDashboard";
import { getAllOrders } from "@/lib/firebase/orders";

export const dynamic = "force-dynamic";

export default async function DriverPage() {
  const allOrders = await getAllOrders();

  // Filter orders: only show pay_now orders that are paid, show all pay_on_delivery orders
  const orders = allOrders.filter(
    (order) =>
      order.paymentMethod === "pay_on_delivery" ||
      (order.paymentMethod === "pay_now" && order.paymentStatus === "paid")
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <DriverDashboard orders={orders} />
      </main>
    </div>
  );
}

