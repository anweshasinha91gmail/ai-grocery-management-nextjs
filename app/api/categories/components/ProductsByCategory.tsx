import React from "react";
import { connectToDatabase } from "../../../../lib/mongodb";
import Products from "../../../../models/Products";
import Categories from "../../../../models/Categories";
import ProductsRendering from "./ProductsRendering";

interface ProductType {
  _id: string;
  name: string;
  quantity: string;
  units: string;
  category: string;
  expiryDate?: string;
}

interface CategoryGroup {
  categoryName: string;
  products: ProductType[];
}

export default async function ProductsByCategory() {
  await connectToDatabase();

  // Fetch all categories
  const categories = await Categories.find({}).lean();

  // Fetch all products
  const allProducts = await Products.find({}).populate("category").lean();

  // Group products by category name
  const grouped: CategoryGroup[] = categories.map((cat: any) => {
    const products = allProducts
      .filter((p: any) => p.category && p.category._id.toString() === cat._id.toString())
      .map((p: any) => ({
        _id: p._id.toString(),
        name: p.name,
        quantity: p.quantity,
        units: p.units,
        category: cat.name,
        expiryDate: p.expiryDate ? new Date(p.expiryDate).toISOString().split("T")[0] : "",
        imageUrl: p.name? "/products/" + p.name.replace(/[^a-z0-9]/gi, "_").toLowerCase() + ".jpg": ""
      }));

    return {
      categoryName: cat.name,
      products,
    };
  });

  return <ProductsRendering grouped={grouped} />;
}
