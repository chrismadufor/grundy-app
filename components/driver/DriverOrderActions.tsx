"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Order } from "@/types";

interface DriverOrderActionsProps {
  order: Order;
}

type VerificationType = "redemption" | "pos" | "transfer";

export default function DriverOrderActions({ order }: DriverOrderActionsProps) {
  const router = useRouter();

  const [redemptionInput, setRedemptionInput] = useState("");
  const [posInput, setPosInput] = useState("");
  const [transferInput, setTransferInput] = useState("");

  const [posModalOpen, setPosModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  const [posProcessing, setPosProcessing] = useState(false);
  const [transferProcessing, setTransferProcessing] = useState(false);

  const [posVerified, setPosVerified] = useState(false);
  const [transferVerified, setTransferVerified] = useState(false);
  const [transferReference, setTransferReference] = useState<string | null>(null);

  const [isDelivering, setIsDelivering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const expectedPosCode = order.deliveryPosCode ?? order.offlineReference ?? null;
  const expectedTransferCode = order.deliveryTransferCode ?? null;

  const canDeliver = useMemo(() => {
    if (order.deliveryStatus === "delivered") {
      return false;
    }

    if (order.paymentMethod === "pay_now") {
      return (
        redemptionInput.trim().toUpperCase() === order.redemptionCode.toUpperCase() &&
        order.paymentStatus === "paid"
      );
    }

    // Pay on delivery - payment must be verified AND status must be paid
    return (posVerified || transferVerified) && order.paymentStatus === "paid";
  }, [order, redemptionInput, posVerified, transferVerified]);

  const resetState = useCallback(() => {
    setError(null);
    setInfo(null);
  }, []);

  const handlePosConfirm = useCallback(async () => {
    resetState();

    if (!expectedPosCode) {
      setError("No POS delivery code is available for this order.");
      return;
    }

    if (posInput.trim() !== expectedPosCode) {
      setError("Provided POS delivery code does not match the customer's code.");
      return;
    }

    setPosProcessing(true);

    try {
      // Simulate transaction processing
      await new Promise((resolve) => setTimeout(resolve, 2250));

      // Update payment status in backend
      const response = await fetch(`/api/orders/${order.id}/payment-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethod: "pos",
          verificationCode: expectedPosCode,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Failed to update payment status");
      }

      setPosVerified(true);
      setInfo("Transaction completed successfully. Payment status updated. You can now mark the order as delivered.");
      setPosModalOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update payment status");
    } finally {
      setPosProcessing(false);
    }
  }, [expectedPosCode, posInput, resetState, order.id, router]);

  const handleTransferConfirm = useCallback(async () => {
    resetState();

    if (!expectedTransferCode) {
      setError("No transfer delivery code is available. Contact support.");
      return;
    }

    if (transferInput.trim() !== expectedTransferCode) {
      setError("Provided transfer delivery code does not match the customer's code.");
      return;
    }

    try {
      setTransferProcessing(true);
      const { default: PaystackPop } = await import("@paystack/inline-js");
      const popup = new PaystackPop();

      let paymentReference: string | null = null;

      await new Promise<void>((resolve, reject) => {
        popup.resumeTransaction(expectedTransferCode, {
          onSuccess: (response: { reference: string }) => {
            paymentReference = response.reference;
            setTransferReference(response.reference);
            resolve();
          },
          onCancel: () => {
            reject(new Error("cancelled"));
          },
        });
      });

      // Update payment status in backend after successful Paystack transaction
      if (paymentReference) {
        const response = await fetch(`/api/orders/${order.id}/payment-status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentMethod: "transfer",
            verificationCode: expectedTransferCode,
            transferReference: paymentReference,
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload?.error || "Failed to update payment status");
        }
      }

      setTransferVerified(true);
      setInfo("Transaction completed successfully. Payment status updated. You can now mark the order as delivered.");
      setTransferModalOpen(false);
      router.refresh();
    } catch (err) {
      if ((err as Error).message !== "cancelled") {
        setError(err instanceof Error ? err.message : "Unable to complete Paystack transfer. Please try again.");
      } else {
        setInfo("Transfer flow cancelled.");
      }
    } finally {
      setTransferProcessing(false);
    }
  }, [expectedTransferCode, resetState, transferInput, order.id, router]);

  const determineVerification = useCallback((): {
    type: VerificationType;
    code: string;
    reference?: string;
    markPaid: boolean;
  } | null => {
    if (order.paymentMethod === "pay_now") {
      return {
        type: "redemption",
        code: order.redemptionCode,
        markPaid: false,
      };
    }

    if (transferVerified && expectedTransferCode) {
      return {
        type: "transfer",
        code: expectedTransferCode,
        reference: transferReference ?? undefined,
        markPaid: true,
      };
    }

    if (posVerified && expectedPosCode) {
      return {
        type: "pos",
        code: expectedPosCode,
        markPaid: true,
      };
    }

    return null;
  }, [expectedPosCode, expectedTransferCode, order, posVerified, transferReference, transferVerified]);

  const markAsDelivered = useCallback(async () => {
    resetState();
    const verification = determineVerification();

    if (!verification) {
      setError("No verified payment method. Complete payment before delivering.");
      return;
    }

    setIsDelivering(true);

    try {
      const response = await fetch(`/api/orders/${order.id}/deliver`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verificationType: verification.type,
          verificationCode: verification.code,
          markPaid: verification.markPaid,
          transferReference: verification.reference,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Failed to update order status.");
      }

      setInfo("Order marked as delivered.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsDelivering(false);
    }
  }, [determineVerification, order.id, resetState, router]);

  return (
    <section className="space-y-6">
      {error && (
        <div className="rounded-md border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-800 dark:text-red-200">
          {error}
        </div>
      )}
      {info && (
        <div className="rounded-md border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/30 px-4 py-3 text-sm text-green-800 dark:text-green-200">
          {info}
        </div>
      )}

      {order.paymentMethod === "pay_now" ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Complete Delivery</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Ask the customer for their redemption code. Enter it exactly as shown to complete handover.
          </p>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Redemption Code</label>
            <input
              value={redemptionInput}
              onChange={(event) => setRedemptionInput(event.target.value.toUpperCase())}
              placeholder="Enter redemption code"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-950 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/40"
            />
            <p className="text-xs text-gray-500">
              The customer&apos;s code must match: <span className="font-mono">{order.redemptionCode}</span>
            </p>
          </div>

          <button
            onClick={markAsDelivered}
            disabled={!canDeliver || isDelivering}
            className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isDelivering ? <InlineSpinner label="Updating" /> : "Mark as Delivered"}
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Collect Payment</h2>
          
          {order.paymentStatus === "paid" ? (
            <div className="rounded-lg border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-200 mb-1">Payment Confirmed</h3>
                  <p className="text-sm text-green-800 dark:text-green-300">
                    Payment has been successfully processed. You can now proceed to mark this order as delivered.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Choose how the customer will pay. Confirm the correct delivery code before processing.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <button
                  onClick={() => {
                    resetState();
                    setPosModalOpen(true);
                  }}
                  className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-zinc-950 px-4 py-6 text-left hover:border-foreground/50"
                >
                  <h3 className="text-lg font-semibold text-foreground">Pay with Terminal</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Process payment via POS terminal. Requires the POS delivery code.
                  </p>
                </button>

                <button
                  onClick={() => {
                    resetState();
                    setTransferModalOpen(true);
                  }}
                  className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-zinc-950 px-4 py-6 text-left hover:border-foreground/50"
                >
                  <h3 className="text-lg font-semibold text-foreground">Pay with Transfer</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Resume Paystack transfer using the delivery transfer code.
                  </p>
                </button>
              </div>
            </>
          )}

          <button
            onClick={markAsDelivered}
            disabled={!canDeliver || isDelivering}
            className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isDelivering ? <InlineSpinner label="Updating" /> : "Mark as Delivered"}
          </button>
        </div>
      )}

      {posModalOpen && (
        <Modal title="Confirm POS Payment" onClose={() => setPosModalOpen(false)}>
          <div className="space-y-4 text-sm text-foreground">
            <p>
              Ask the customer for their POS delivery code. It must match
              <span className="ml-2 font-mono">{expectedPosCode ?? "Unavailable"}</span>
            </p>
            <input
              value={posInput}
              onChange={(event) => setPosInput(event.target.value)}
              placeholder="Enter POS delivery code"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-950 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-foreground/40"
            />

            <button
              onClick={handlePosConfirm}
              disabled={posProcessing}
              className="inline-flex items-center rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {posProcessing ? <InlineSpinner label="Processing" /> : posVerified ? "Payment Successful" : "Confirm Payment"}
            </button>
          </div>
        </Modal>
      )}

      {transferModalOpen && (
        <Modal title="Confirm Transfer Payment" onClose={() => setTransferModalOpen(false)}>
          <div className="space-y-4 text-sm text-foreground">
            <p>
              Collect the transfer delivery code and resume the Paystack transaction.
              <span className="ml-2 font-mono">{expectedTransferCode ?? "Unavailable"}</span>
            </p>
            <input
              value={transferInput}
              onChange={(event) => setTransferInput(event.target.value)}
              placeholder="Enter transfer delivery code"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-950 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-foreground/40"
            />

            <button
              onClick={handleTransferConfirm}
              disabled={transferProcessing}
              className="inline-flex items-center rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {transferProcessing ? (
                <InlineSpinner label="Opening" />
              ) : transferVerified ? (
                "Payment Successful"
              ) : (
                "Resume Paystack Checkout"
              )}
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}

function InlineSpinner({ label }: { label: string }) {
  return (
    <span className="flex items-center">
      <svg className="mr-2 h-4 w-4 animate-spin text-background" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      {label}
    </span>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-zinc-950 shadow-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-foreground">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

