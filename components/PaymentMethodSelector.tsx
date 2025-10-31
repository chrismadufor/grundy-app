"use client";

interface PaymentMethodSelectorProps {
  value: "pay_now" | "pay_on_delivery" | null;
  onChange: (method: "pay_now" | "pay_on_delivery") => void;
}

export default function PaymentMethodSelector({
  value,
  onChange,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-lg font-semibold text-foreground block">
        Payment Method
      </label>
      <div className="space-y-2">
        <label
          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
            value === "pay_now"
              ? "border-foreground bg-foreground/10"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="pay_now"
            checked={value === "pay_now"}
            onChange={() => onChange("pay_now")}
            className="mr-3 h-4 w-4 text-foreground focus:ring-foreground"
          />
          <div className="flex-1">
            <span className="font-medium text-foreground">Pay Now</span>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Pay immediately with card, bank transfer, or mobile money
            </p>
          </div>
        </label>
        <label
          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
            value === "pay_on_delivery"
              ? "border-foreground bg-foreground/10"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="pay_on_delivery"
            checked={value === "pay_on_delivery"}
            onChange={() => onChange("pay_on_delivery")}
            className="mr-3 h-4 w-4 text-foreground focus:ring-foreground"
          />
          <div className="flex-1">
            <span className="font-medium text-foreground">Pay on Delivery</span>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Pay when your order is delivered
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}

