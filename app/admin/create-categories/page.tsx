import React from 'react'
import Categories from '../../../models/Categories';
import CategoryForm from '../../api/categories/components/CategoryForm';
import { connectToDatabase } from '../../../lib/mongodb';
import Header from "@/app/Header";

interface CategoryType {
  _id: string;
  name: string;
}
export default async function Page () {
  await connectToDatabase();
  const topCategories = await Categories.find().lean();
  const categories: CategoryType[] = topCategories.map((cat: any) => ({
    _id: cat._id.toString(),
    name: cat.name,
  }));
  return (
    <div className="w-full">
        <Header />
        <div className="max-w-md mx-auto mt-10">
        <h1 className="text-2xl font-bold mb-4">Create Category</h1>
        <CategoryForm topCategories={categories} />
        </div>
      </div>
  );
}

