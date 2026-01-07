// app/api/categories/[id]/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Categories from "../../../../models/Categories";

// GET single category
export async function GET(_: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const category = await Categories.findById(params.id).populate("name");
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(category);
}

// PUT update category
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const { name, parent } = await req.json();
  const updated = await Categories.findByIdAndUpdate(
    params.id,
    { name},
    { new: true }
  );
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

// DELETE category
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  await Categories.findByIdAndDelete(params.id);
  return NextResponse.json({ message: "Deleted successfully" });
}
