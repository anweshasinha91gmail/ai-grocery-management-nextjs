import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import Product from "../../../models/Products";
import Categories from "../../../models/Categories";
import { normalizeName } from "@/app/util/normalizeName";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { products } = await req.json();

    if (!products || !Array.isArray(products)) {
      return NextResponse.json(
        { success: false, error: "Invalid products array" },
        { status: 400 }
      );
    }

    const createdOrUpdated: any[] = [];

    // Ensure local folder exists
    const imageFolder = path.join(process.cwd(), "public", "products");
    if (!fs.existsSync(imageFolder)) {
      fs.mkdirSync(imageFolder, { recursive: true });
    }

    for (const item of products) {
      // ✅ Check or create category
      let category = await Categories.findOne({ name: item.category });
      if (!category) category = await Categories.create({ name: item.category });

      // ✅ Normalize product name and units
      const normalizedName = normalizeName(item.name);
      const normalizedUnits = normalizeName(item.units);

      // ✅ Check existing product
      let existingProduct = await Product.findOne({
        name: new RegExp("^" + normalizedName + "s?$", "i"),
        units: new RegExp("^" + normalizedUnits + "s?$", "i"),
        category: category._id,
      });

      console.log("🛒 Processing:", normalizedName);

      if (!existingProduct) {
        // 🧠 Generate image with DALL·E 3
        const imageResponse = await client.images.generate({
          model: "dall-e-3",
          prompt: `A clear grocery product photo of ${normalizedName} on a white background, realistic lighting, center focus`,
          size: "1024x1024",
          quality: "standard",
        });

        const imageUrl = imageResponse.data?.[0]?.url;
        let savedImagePath = "";

        if (imageUrl) {
          console.log(`🎨 Image URL for ${normalizedName}:`, imageUrl);
          const res = await fetch(imageUrl);
          const arrayBuffer = await res.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Save original first
          const safeFileName = normalizedName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
          const rawPath = path.join(imageFolder, `${safeFileName}_raw.png`);
          fs.writeFileSync(rawPath, buffer);

          // 🧩 Compress and resize using sharp
          const compressedPath = path.join(imageFolder, `${safeFileName}.jpg`);
          await sharp(rawPath)
            .resize(512, 512)
            .jpeg({ quality: 70 })
            .toFile(compressedPath);

          // Delete the original large file
          fs.unlinkSync(rawPath);

          savedImagePath = `/products/${safeFileName}.jpg`;
          console.log(`✅ Image saved for ${normalizedName} → ${savedImagePath}`);
        } else {
          console.log(`⚠️ No image generated for ${normalizedName}`);
        }

        // 🗓️ Default expiry = +1 month
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const newProduct = await Product.create({
          name: normalizedName,
          quantity: item.quantity,
          units: normalizedUnits,
          category: category._id,
          expiryDate: nextMonth,
        });

        createdOrUpdated.push(newProduct);
      } else {
        // Update existing quantity
        const currentQty = parseFloat(existingProduct.quantity);
        const addQty = parseFloat(item.quantity);
        existingProduct.quantity = String(currentQty + addQty);
        await existingProduct.save();
        createdOrUpdated.push(existingProduct);
      }
    }

    return NextResponse.json({ success: true, data: createdOrUpdated });
  } catch (error: any) {
    console.error("❌ Bulk product creation failed:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
