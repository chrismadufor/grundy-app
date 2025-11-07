import { Order } from "@/types";
import { firestoreHelpers } from "./firestore";

type MaybeTimestamp = {
  toDate: () => Date;
};

function maybeToDate(value: unknown): Date | undefined {
  if (value instanceof Date) {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as MaybeTimestamp).toDate === "function"
  ) {
    return (value as MaybeTimestamp).toDate();
  }

  return undefined;
}

function normalizeOrderDates(order: Order): Order {
  return {
    ...order,
    createdAt: maybeToDate(order.createdAt) ?? new Date(),
    deliveredAt: maybeToDate(order.deliveredAt),
    deliveryStatus: order.deliveryStatus ?? "pending",
  };
}

export async function createOrder(
  orderData: Omit<Order, "id" | "createdAt" | "deliveryStatus" | "deliveredAt"> & {
    deliveryStatus?: Order["deliveryStatus"];
  }
): Promise<string> {
  try {
    const orderId = await firestoreHelpers.addDocument<Order>("orders", {
      ...orderData,
      createdAt: new Date(),
      deliveryStatus: orderData.deliveryStatus ?? "pending",
    });
    return orderId;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    const orders = await firestoreHelpers.getAllDocuments<Order>("orders");
    return orders
      .map((order) => normalizeOrderDates(order))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const order = await firestoreHelpers.getDocument<Order>("orders", id);
    return order ? normalizeOrderDates(order) : null;
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

export async function markOrderDelivered(
  orderId: string,
  options: { markPaid?: boolean; reference?: string } = {}
): Promise<void> {
  try {
    await firestoreHelpers.updateDocument("orders", orderId, {
      deliveryStatus: "delivered",
      deliveredAt: new Date(),
      ...(options.markPaid ? { paymentStatus: "paid", paystackRef: options.reference } : {}),
    });
  } catch (error) {
    console.error("Error marking order delivered:", error);
    throw error;
  }
}

