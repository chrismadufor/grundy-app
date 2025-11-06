"use client";

import { Order } from "@/types";
import Link from "next/link";

interface OrderConfirmationProps {
  order: Order;
}

export default function OrderConfirmation({ order }: OrderConfirmationProps) {
  const isPayOnDelivery = order.paymentMethod === "pay_on_delivery";
  const posCode = order.offlineReference || order.deliveryPosCode;

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
          Thank you for your purchase. Your order details are below.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 space-y-6">
        {!isPayOnDelivery && (
          <div className="text-center py-4 bg-foreground/10 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Redemption Code</p>
            <p className="text-3xl font-bold text-foreground font-mono tracking-wider">
              {order.redemptionCode}
            </p>
          </div>
        )}

        {!isPayOnDelivery && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-2">Delivery Instruction</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              At the point of delivery, the rider will ask for your <strong>redemption code</strong> to hand over your package. Keep this code safe and only share it with the verified delivery rider.
            </p>
          </div>
        )}

        {isPayOnDelivery && (posCode || order.deliveryTransferCode) && (
          <div className="space-y-4">
            <h2 className="font-semibold text-foreground text-lg">Delivery Payment Codes</h2>
            <div className="space-y-3">
              {posCode && (
                <div className="text-center py-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">For POS delivery payment</p>
                  <p className="text-2xl font-bold text-foreground font-mono tracking-wider">
                    {posCode}
                  </p>
                </div>
              )}
              {order.deliveryTransferCode && (
                <div className="text-center py-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">For transfer delivery payment</p>
                  <p className="text-2xl font-bold text-foreground font-mono tracking-wider">
                    {order.deliveryTransferCode}
                  </p>
                </div>
              )}
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">Important Instructions</h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                <li>If the delivery rider has a POS terminal, they will ask for your <strong>POS delivery code</strong> to process payment.</li>
                <li>If the rider does not have a POS terminal, they will ask for your <strong>transfer delivery code</strong> to initiate a transfer payment.</li>
                <li><strong>Keep these codes secure</strong> - only share them with the verified delivery rider at the point of delivery.</li>
                <li>Do not share these codes with anyone else or post them publicly.</li>
              </ul>
            </div>
          </div>
        )}

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
                  <span>₦{((item.price * item.qty) / 100).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 flex justify-between text-xl font-bold text-foreground">
            <span>Total:</span>
            <span>₦{(order.totalAmount / 100).toLocaleString()}</span>
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

