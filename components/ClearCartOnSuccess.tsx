"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";

export default function ClearCartOnSuccess({ orderId }: { orderId?: string }) {
  const { clearCart } = useCart();
  const hasCleared = useRef(false);

  useEffect(() => {
    if (orderId && !hasCleared.current) {
      hasCleared.current = true;
      try {
        clearCart();
      } catch {}
    } 
  }, [orderId, clearCart]);

  return null;
}
