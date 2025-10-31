"use client";

import { Order } from "@/types";
import Link from "next/link";

interface OrderConfirmationProps {
  order: Order;
}

export default function OrderConfirmation({ order }: OrderConfirmationProps) {
  const isPayOnDelivery = order.paymentMethod === "pay_on_delivery";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <svg
            className="w-8 h-8 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {isPayOnDelivery ? "Order Placed Successfully!" : "Payment Successful!"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isPayOnDelivery
            ? "Your order has been received. Please use the redemption code below when making payment."
            : "Thank you for your purchase. Your order has been confirmed."}
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 space-y-6">
        <div className="text-center py-4 bg-foreground/10 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Redemption Code</p>
          <p className="text-3xl font-bold text-foreground font-mono tracking-wider">
            {order.redemptionCode}
          </p>
        </div>

        <div className="border-t pt-6 space-y-4">
          <div>
            <h2 className="font-semibold text-foreground mb-2">Order Details</h2>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p>
                <span className="font-medium">Order ID:</span> {order.id}
              </p>
              <p>
                <span className="font-medium">Customer:</span> {order.name}
              </p>
              <p>
                <span className="font-medium">Email:</span> {order.email}
              </p>
              {order.address && (
                <p>
                  <span className="font-medium">Delivery Address:</span> {order.address}
                </p>
              )}
              <p>
                <span className="font-medium">Payment Method:</span>{" "}
                {order.paymentMethod === "pay_now" ? "Pay Now" : "Pay on Delivery"}
              </p>
              <p>
                <span className="font-medium">Payment Status:</span>{" "}
                <span
                  className={
                    order.paymentStatus === "paid"
                      ? "text-green-600 dark:text-green-400 font-semibold"
                      : "text-yellow-600 dark:text-yellow-400 font-semibold"
                  }
                >
                  {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                </span>
              </p>
              {order.offlineReference && (
                <p>
                  <span className="font-medium">Offline Reference:</span>{" "}
                  <span className="font-mono">{order.offlineReference}</span>
                </p>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-foreground mb-2">Order Items</h2>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between text-sm text-foreground py-2 border-b border-gray-200 dark:border-gray-700"
                >
                  <span>
                    Item {index + 1} (Qty: {item.qty})
                  </span>
                  <span>₦{(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 flex justify-between text-xl font-bold text-foreground">
            <span>Total:</span>
            <span>₦{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity font-medium"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

