"use client";

import Image from "next/image";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative w-full h-96 md:h-[500px] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          <Image
            src={product.imageUrl || "/placeholder-product.jpg"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="flex flex-col">
          {product.storeName && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {product.storeName}
            </p>
          )}
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {product.name}
          </h1>
          <p className="text-3xl font-bold text-foreground mb-6">
            ₦{product.price.toLocaleString()}
          </p>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Description
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <label htmlFor="quantity" className="text-foreground font-medium">
              Quantity:
            </label>
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                -
              </button>
              <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 text-center border-0 focus:ring-0 bg-transparent text-foreground"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                +
              </button>
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            className="w-full py-3 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity font-semibold text-lg"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

