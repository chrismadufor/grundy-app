import { getAllProducts } from "@/lib/firebase/products";
import ProductCard from "@/components/ProductCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import Navbar from "@/components/Navbar";
import SeedButton from "@/components/SeedButton";
import { Product } from "@/types";

export default async function Home() {
  let products: Product[] = [];
  let error: string | null = null;

  try {
    products = await getAllProducts();
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load products";
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">All Products</h1>
        {error ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Please check your Firebase configuration.
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 space-y-6">
            <p className="text-gray-600 dark:text-gray-400">
              No products available. Click the button below to seed sample products.
            </p>
            <div className="flex justify-center">
              <SeedButton />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
