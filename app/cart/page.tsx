"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import CartItem from "@/components/CartItem";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function CartPage() {
  const { cartItems, getTotalPrice, getTotalItems } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h2 className="mt-4 text-2xl font-semibold text-foreground">
              Your cart is empty
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Start shopping to add items to your cart
            </p>
            <Link
              href="/"
              className="mt-6 inline-block px-6 py-3 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Shopping Cart</h1>
        <div className="space-y-4 mb-8">
          {cartItems.map((item) => (
            <CartItem key={item.productId} item={item} />
          ))}
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 sticky bottom-0">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-foreground">
              Total ({getTotalItems()} {getTotalItems() === 1 ? "item" : "items"}):
            </span>
            <span className="text-2xl font-bold text-foreground">
              ₦{(getTotalPrice() / 100).toLocaleString()}
            </span>
          </div>
          <Link
            href="/checkout"
            className="w-full block text-center py-3 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity font-semibold text-lg"
          >
            Proceed to Checkout
          </Link>
        </div>
      </main>
    </div>
  );
}

