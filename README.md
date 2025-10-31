# Grundy Stores - E-Commerce MVP

A modern e-commerce application built with Next.js, Firebase, and Paystack integration.

## Features

- 🛍️ **Product Browsing**: View all products from Firestore
- 📦 **Shopping Cart**: Add items, adjust quantities, and remove items
- 💳 **Payment Integration**: Support for Pay Now (Paystack) and Pay on Delivery
- 📱 **Responsive Design**: Modern UI with TailwindCSS
- 🔒 **Order Management**: Track orders with unique redemption codes

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: TailwindCSS 4
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Payments**: Paystack
- **State Management**: React Context API + localStorage

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project
- Paystack account

### Installation

1. Install dependencies:
```bash
npm install firebase
```

2. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Paystack Configuration
PAYSTACK_SECRET_KEY=your_paystack_secret_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Firebase Setup

### Firestore Collections

#### Products Collection
```typescript
{
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  storeName?: string;
  createdAt: Timestamp;
}
```

#### Orders Collection
```typescript
{
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
  createdAt: Timestamp;
}
```

### Firestore Security Rules (Development)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{document=**} {
      allow read: if true;
      allow write: if false; // Only allow writes from admin panel
    }
    match /orders/{document=**} {
      allow read: if false; // Only server-side reads
      allow write: if false; // Only server-side writes
    }
  }
}
```

## Paystack Webhook Setup

1. Go to your Paystack Dashboard
2. Navigate to Settings > Webhooks
3. Add webhook URL: `https://yourdomain.com/api/paystack/webhook`
4. Copy the webhook secret and add it to your `.env.local` file

## Project Structure

```
app/
  ├── api/
  │   └── paystack/
  │       ├── create-transaction/route.ts
  │       ├── create-invoice/route.ts
  │       └── webhook/route.ts
  ├── product/[id]/page.tsx
  ├── cart/page.tsx
  ├── checkout/page.tsx
  ├── payment-success/page.tsx
  └── page.tsx (home)
components/
  ├── ProductCard.tsx
  ├── ProductDetail.tsx
  ├── CartItem.tsx
  ├── CheckoutForm.tsx
  ├── PaymentMethodSelector.tsx
  ├── PaystackButton.tsx
  ├── Navbar.tsx
  └── LoadingSpinner.tsx
context/
  └── CartContext.tsx
lib/
  ├── firebase/
  │   ├── config.ts
  │   ├── firestore.ts
  │   ├── products.ts
  │   └── orders.ts
  ├── paystack/
  │   ├── verifyWebhook.ts
  └── paystack.ts
types/
  └── index.ts
```

## Payment Flow

### Pay Now
1. User selects "Pay Now" on checkout
2. System creates Paystack transaction
3. Paystack popup opens for payment
4. On success, webhook updates order status to "paid"
5. User sees success page with redemption code

### Pay on Delivery
1. User selects "Pay on Delivery" and enters address
2. System creates Paystack invoice
3. Order saved with `paymentMethod: "pay_on_delivery"`
4. User receives offline reference code
5. User pays on delivery using redemption code

## License

MIT
