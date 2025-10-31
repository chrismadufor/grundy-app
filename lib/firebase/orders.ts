import { Order } from "@/types";
import { firestoreHelpers } from "./firestore";

export async function createOrder(orderData: Omit<Order, "id" | "createdAt">): Promise<string> {
  try {
    const orderId = await firestoreHelpers.addDocument<Order>("orders", {
      ...orderData,
      createdAt: new Date(),
    });
    return orderId;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const order = await firestoreHelpers.getDocument<Order>("orders", id);
    if (order && order.createdAt && (order.createdAt as any).toDate) {
      order.createdAt = (order.createdAt as any).toDate();
    }
    return order;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
}

export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: "pending" | "paid",
  paystackRef?: string
): Promise<void> {
  try {
    await firestoreHelpers.updateDocument("orders", orderId, {
      paymentStatus,
      ...(paystackRef && { paystackRef }),
    });
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
}

