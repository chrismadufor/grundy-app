import { Product } from "@/types";
import { firestoreHelpers } from "./firestore";

export async function getAllProducts(): Promise<Product[]> {
  try {
    const products = await firestoreHelpers.getAllDocuments<Product>("products");
    // Convert Firestore timestamps to dates
    return products.map((product) => ({
      ...product,
      createdAt: product.createdAt
        ? (product.createdAt as any).toDate
          ? (product.createdAt as any).toDate()
          : product.createdAt
        : undefined,
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const product = await firestoreHelpers.getDocument<Product>("products", id);
    if (product && product.createdAt && (product.createdAt as any).toDate) {
      product.createdAt = (product.createdAt as any).toDate();
    }
    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
}

