"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import PaymentMethodSelector from "./PaymentMethodSelector";
import PaystackButton from "./PaystackButton";

type PaymentMethod = "pay_now" | "pay_on_delivery" | null;

export default function CheckoutForm() {
  const router = useRouter();
  const { cartItems, getTotalPrice } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paystackData, setPaystackData] = useState<{
    accessCode: string;
    reference: string;
    orderId: string;
  } | null>(null);
  const [showDeliverySummary, setShowDeliverySummary] = useState(false);

  const totalAmount = getTotalPrice();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !address) {
      setError("Please fill in all required fields");
      return;
    }

    if (!paymentMethod) {
      setError("Please select a payment method");
      return;
    }

    setIsSubmitting(true);

    try {
      if (paymentMethod === "pay_now") {
        // Create Paystack transaction
        const response = await fetch("/api/paystack/create-transaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: cartItems.map((item) => ({
              productId: item.productId,
              qty: item.quantity,
              price: item.price,
            })),
            name,
            email,
            address,
            totalAmount,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create transaction");
        }

        const data = await response.json();
        setPaystackData({
          accessCode: data.accessCode,
          reference: data.reference,
          orderId: data.orderId,
        });
      } else {
        // Show summary page for pay on delivery
        setShowDeliverySummary(true);
        setIsSubmitting(false);
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaystackSuccess = async (_reference: string) => {
    // Redirect is handled in PaystackButton; cart clears on success page
  };

  const handleConfirmDeliveryOrder = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Create Pay on Delivery invoice
      const response = await fetch("/api/paystack/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.productId,
            qty: item.quantity,
            price: item.price,
          })),
          name,
          email,
          address,
          totalAmount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create invoice");
      }

      const data = await response.json();
      router.push(
        `/payment-success?orderId=${data.orderId}&method=pay_on_delivery`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  };

  if (paystackData && paymentMethod === "pay_now") {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            {cartItems.map((item) => (
              <div key={item.productId} className="flex justify-between text-foreground">
                <span>
                  {item.name} x{item.quantity}
                </span>
                <span>₦{((item.price * item.quantity) / 100).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex justify-between text-xl font-bold text-foreground">
            <span>Total:</span>
            <span>₦{(totalAmount / 100).toLocaleString()}</span>
          </div>
        </div>
        <PaystackButton
          accessCode={paystackData.accessCode}
          orderId={paystackData.orderId}
          email={email}
          amount={totalAmount}
          reference={paystackData.reference}
          onSuccess={handlePaystackSuccess}
          onClose={() => setPaystackData(null)}
        />
      </div>
    );
  }

  if (showDeliverySummary && paymentMethod === "pay_on_delivery") {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Review Your Order</h2>
          
          <div className="mb-6 space-y-2">
            <h3 className="font-semibold text-foreground">Customer Information</h3>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <p><span className="font-medium">Name:</span> {name}</p>
              <p><span className="font-medium">Email:</span> {email}</p>
              <p><span className="font-medium">Delivery Address:</span> {address}</p>
            </div>
          </div>

          <div className="border-t pt-4 mb-4">
            <h3 className="font-semibold text-foreground mb-2">Order Items</h3>
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex justify-between text-foreground">
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span>₦{((item.price * item.quantity) / 100).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 flex justify-between text-xl font-bold text-foreground">
            <span>Total:</span>
            <span>₦{(totalAmount / 100).toLocaleString()}</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => setShowDeliverySummary(false)}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-foreground rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-semibold"
          >
            Back
          </button>
          <button
            onClick={handleConfirmDeliveryOrder}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-foreground text-background rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-semibold text-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-background"></div>
                Processing...
              </span>
            ) : (
              "Confirm Order"
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 space-y-4">
        <h2 className="text-xl font-semibold text-foreground mb-4">Customer Information</h2>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-800 text-foreground focus:ring-2 focus:ring-foreground focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-800 text-foreground focus:ring-2 focus:ring-foreground focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6">
        <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6">
        <label htmlFor="address" className="block text-sm font-medium text-foreground mb-2">
          Delivery Address *
        </label>
        <textarea
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-800 text-foreground focus:ring-2 focus:ring-foreground focus:border-transparent"
          placeholder="Enter your full delivery address"
        />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Order Summary</h2>
        <div className="space-y-2 mb-4">
          {cartItems.map((item) => (
            <div key={item.productId} className="flex justify-between text-foreground">
              <span>
                {item.name} x{item.quantity}
              </span>
              <span>₦{((item.price * item.quantity) / 100).toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-4 flex justify-between text-xl font-bold text-foreground">
          <span>Total:</span>
          <span>₦{(totalAmount / 100).toLocaleString()}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-foreground text-background rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-semibold text-lg"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-background"></div>
            Processing...
          </span>
        ) : paymentMethod === "pay_now" ? (
          "Continue to Payment"
        ) : (
          "Place Order"
        )}
      </button>
    </form>
  );
}
