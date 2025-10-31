export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  storeName?: string;
  createdAt?: Date;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export interface Order {
  id: string;
  items: Array<{
    productId: string;
    qty: number;
    price: number;
  }>;
  name: string;
  email: string;
  address?: string;
  paymentMethod: "pay_now" | "pay_on_delivery";
  paymentStatus: "pending" | "paid";
  totalAmount: number;
  paystackRef?: string;
  offlineReference?: string;
  redemptionCode: string;
  createdAt: Date;
}

