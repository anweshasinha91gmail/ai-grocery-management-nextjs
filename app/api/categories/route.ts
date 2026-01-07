// app/api/categories/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import Categories from "../../../models/Categories";

// GET all categories
export async function GET() {
  await connectToDatabase();
  // Fetch categories where parent is either null or empty string
  const categories = await Categories.find().select("name");
  return NextResponse.json(categories);
}

// POST create category
export async function POST(req: Request) {
  await connectToDatabase();
  const { name } = await req.json();
  const category = await Categories.create({
    name
  });
  return NextResponse.json(category, { status: 201 });
}
