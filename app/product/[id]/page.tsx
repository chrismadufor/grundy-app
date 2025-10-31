import { getProductById } from "@/lib/firebase/products";
import ProductDetail from "@/components/ProductDetail";
import Navbar from "@/components/Navbar";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Navbar />
      <ProductDetail product={product} />
    </div>
  );
}
