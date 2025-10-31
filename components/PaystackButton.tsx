"use client";

import { useEffect, useRef } from "react";
import { getPublicKey } from "@/lib/paystack";

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        ref: string;
        onClose: () => void;
        callback: (response: { reference: string }) => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

interface PaystackButtonProps {
  accessCode: string;
  email: string;
  amount: number;
  reference: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
  disabled?: boolean;
}

export default function PaystackButton({
  accessCode,
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

  const handlePayment = () => {
    if (!window.PaystackPop) {
      alert("Paystack is loading, please wait...");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: getPublicKey(),
      email,
      amount: amount * 100, // Convert to kobo
      ref: reference,
      onClose: () => {
        onClose();
      },
      callback: (response) => {
        onSuccess(response.reference);
      },
    });

    handler.openIframe();
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || !window.PaystackPop}
      className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
    >
      {window.PaystackPop ? "Pay Now" : "Loading..."}
    </button>
  );
}

