"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import DriverStatusBadge from "./DriverStatusBadge";
import { Order } from "@/types";

interface DriverDashboardProps {
  orders: Order[];
}

export default function DriverDashboard({ orders }: DriverDashboardProps) {
  const [query, setQuery] = useState("");

  const filteredOrders = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return orders;
    }

    return orders.filter((order) => {
      const status =
        order.deliveryStatus === "delivered"
          ? "delivered"
          : order.paymentStatus === "paid"
          ? "paid"
          : "pending";

      return (
        order.id.toLowerCase().includes(term) ||
        order.name.toLowerCase().includes(term) ||
        status.includes(term)
      );
    });
  }, [orders, query]);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-foreground">Welcome, Driver</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Review your assigned deliveries, confirm payments, and mark orders as delivered.
        </p>
        <div className="max-w-md">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search orders by ID, customer, or status"
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/40"
          />
        </div>
      </header>

      <section className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-zinc-950/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Order ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Payment Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {filteredOrders.map((order) => {
              const status =
                order.deliveryStatus === "delivered"
                  ? "Delivered"
                  : order.paymentStatus === "paid"
                  ? "Paid"
                  : "Pending";

              return (
                <tr key={order.id} className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/40">
                  <td className="px-4 py-3 font-mono text-sm text-foreground">{order.id}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{order.name}</td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    ₦{(order.totalAmount / 100).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {order.paymentMethod === "pay_now" ? "Pay Now" : "Pay on Delivery"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <DriverStatusBadge status={status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/driver/${order.id}`} className="text-foreground font-medium hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                  No orders match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

