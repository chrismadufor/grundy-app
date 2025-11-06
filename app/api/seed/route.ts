import { NextResponse } from "next/server";
import { firestoreHelpers } from "@/lib/firebase/firestore";

interface SeedProduct {
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  storeName?: string;
}

const products: SeedProduct[] = [
  {
    name: "Peak Milk Powdered (400g)",
    price: 750000,
    description:
      "Premium full cream powdered milk, rich in calcium and vitamins. Perfect for families.",
    imageUrl:
      "https://ng.jumia.is/unsafe/fit-in/680x680/filters:fill(white)/product/28/6366814/1.jpg?0028",
    storeName: "Grundy Stores",
  },
  {
    name: "Nasco Cornflakes (500g)",
    price: 480000,
    description:
      "Crispy, golden cornflakes perfect for breakfast. A family favorite across Nigeria.",
    imageUrl:
      "https://www.nasco.net/media/page/nasco-corn-flakes-vanilla-cinnamon-350g.jpg",
    storeName: "Grundy Stores",
  },
  {
    name: "Peanut Butter (500g)",
    price: 220000,
    description:
      "Creamy and smooth peanut butter, rich in protein. Great for sandwiches and snacks.",
    imageUrl:
      "https://shoprite.ng/wp-content/uploads/2023/06/Peanut-Butter-Extra-Crunchy-Nutzy-510G-1299.99.jpg",
    storeName: "Grundy Stores",
  },
  {
    name: "Indomie Instant Noodles (Pack of 5)",
    price: 150000,
    description:
      "Delicious instant noodles, a Nigerian household staple. Quick and easy to prepare.",
    imageUrl:
      "https://shoprite.ng/wp-content/uploads/2023/06/Noodles-Inst-Indomie-120G-Chic-Super-199.99.jpg",
    storeName: "Grundy Stores",
  },
  {
    name: "Golden Penny Pasta (500g)",
    price: 120000,
    description:
      "Quality pasta perfect for your favorite Nigerian pasta dishes. Versatile and filling.",
    imageUrl:
      "https://riftvalley.ng/wp-content/uploads/2024/10/GOLDEN-PENNY-PASTA-SLIM-SPAGHETTINI-500G.jpg",
    storeName: "Grundy Stores",
  },
  {
    name: "Dangote Sugar (1kg)",
    price: 180000,
    description:
      "Pure refined sugar, perfect for cooking, baking, and beverages. Trusted Nigerian brand.",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdmvirgIRENua-ddxqq2TA641_ji8YA18qUA&s",
    storeName: "Grundy Stores",
  },
  {
    name: "Blue Band Margarine (250g)",
    price: 85000,
    description:
      "Creamy margarine spread, ideal for bread and cooking. A kitchen essential.",
    imageUrl:
      "https://www.blueband.com/en-ke/-/media/Project/Upfield/Brands/Blue-Band-Global/Blue-Band-Consumer-KE/Assets/Products/BlueBand-Original-1kg-IML.jpg?rev=9fdaac4973fd496186464ebc74fec203",
    storeName: "Grundy Stores",
  },
  {
    name: "Bournvita (500g)",
    price: 320000,
    description:
      "Nutritious chocolate drink powder, rich in vitamins and minerals. Energize your day!",
    imageUrl:
      "https://nextcashandcarry.com.ng/wp-content/uploads/2022/04/BOURNVITA-900G-JAR.jpeg",
    storeName: "Grundy Stores",
  },
  {
    name: "Milo (400g)",
    price: 280000,
    description:
      "Chocolate malt drink powder, loved by kids and adults. Great for breakfast and snacks.",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFAYQnNtNA_IyLJQy2f3lho1X61_PQRm2tsw&s",
    storeName: "Grundy Stores",
  },
  {
    name: "Maggi Cubes (Pack of 4)",
    price: 45000,
    description:
      "Flavorful seasoning cubes for soups, stews, and rice dishes. Essential for Nigerian cooking.",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQg2X0tUG-ZXx8yLXpAwpzE7opxBNMpq07utw&s",
    storeName: "Grundy Stores",
  },
];

export async function POST() {
  try {
    let created = 0;
    let skipped = 0;

    for (const p of products) {
      // Idempotency: skip if a product with same name exists
      const existing = await firestoreHelpers.queryDocuments<any>(
        "products",
        "name",
        "==",
        p.name
      );

      if (existing.length > 0) {
        skipped += 1;
        continue;
      }

      await firestoreHelpers.addDocument("products", p);
      created += 1;
    }

    return NextResponse.json({ ok: true, created, skipped });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: error?.message || "Failed to seed products" },
      { status: 500 }
    );
  }
}
