"use client";

import { useEffect, useRef } from "react";
import { getPublicKey } from "@/lib/paystack";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

interface PaystackButtonProps {
  accessCode: string;
  orderId: string;
  email: string;
  amount: number;
  reference: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
  disabled?: boolean;
}

export default function PaystackButton({
  accessCode,
  orderId,
  email,
  amount,
  reference,
  onSuccess,
  onClose,
  disabled,
}: PaystackButtonProps) {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (!scriptLoaded.current) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      document.body.appendChild(script);
      scriptLoaded.current = true;
    }
  }, []);

  const handlePayment = async () => {
    try {
      const { default: PaystackPop } = await import("@paystack/inline-js");
      const popup = new PaystackPop();
      popup.resumeTransaction(
        accessCode,
        {
          onSuccess: (response: { reference: string }) => {
            // We intentionally redirect here; success page will clear the cart
            window.location.href = `/payment-success?orderId=${orderId}&method=pay_now&reference=${response.reference}`;
            onSuccess(response.reference);
          },
          onCancel: () => {
            onClose();
          },
        }
      );
    } catch (e) {
      alert("Unable to load Paystack. Please try again.");
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled}
      className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
    >
      Pay Now
    </button>
  );
}
