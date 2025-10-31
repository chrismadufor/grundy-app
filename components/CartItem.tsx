"use client";

import Image from "next/image";
import Link from "next/link";
import { CartItem as CartItemType } from "@/types";
import { useCart } from "@/context/CartContext";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex gap-4 p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-md">
      <Link href={`/product/${item.productId}`} className="shrink-0">
        <div className="relative w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
          <Image
            src={item.imageUrl || "/placeholder-product.jpg"}
            alt={item.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>
      </Link>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/product/${item.productId}`}>
            <h3 className="font-semibold text-foreground hover:underline">
              {item.name}
            </h3>
          </Link>
          <p className="text-lg font-bold text-foreground mt-1">
            ₦{item.price.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
            <button
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              -
            </button>
            <span className="px-4 py-1 text-foreground">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              +
            </button>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-foreground">
              ₦{(item.price * item.quantity).toLocaleString()}
            </p>
            <button
              onClick={() => removeFromCart(item.productId)}
              className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 mt-1"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

