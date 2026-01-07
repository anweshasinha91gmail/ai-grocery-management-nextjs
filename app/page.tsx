import { NextResponse } from "next/server";
import Header from './Header';
import { connectToDatabase } from "../lib/mongodb";
import Categories from "../models/Categories";
import CategoryForm from "./api/categories/components/CategoryForm";

// Define the type for props
interface CategoryType {
  _id: string;
  name: string;
}

export default async function Home() {
  await connectToDatabase();

  const topCategories = await Categories.find().lean();

  // Explicitly map results into the CategoryType
  const categories: CategoryType[] = topCategories.map((cat: any) => ({
    _id: cat._id.toString(), // convert ObjectId → string
    name: cat.name,
  }));
  return (
    <main className="p-6 text-black">
      <Header />
      {/* <h1 className="text-2xl font-bold mb-4">Grocery Categories</h1>
      <ul className="space-y-2">
        {categories.map((cat: any) => (
          <li
            key={cat._id.toString()}
            className="p-4 bg-blue-100 rounded-md shadow-sm"
          >
            <h2 className="text-lg font-semibold">{cat.name}</h2>
            <p className="text-gray-700">{cat.description}</p>
          </li>
        ))}
      </ul> */}
      <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Create Category</h1>
      <CategoryForm topCategories={categories} />
    </div>
    </main>
  );
}
