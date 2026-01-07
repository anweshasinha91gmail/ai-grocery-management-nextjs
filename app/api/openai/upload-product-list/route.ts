import { NextResponse } from "next/server";
import OpenAI from "openai";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import Tesseract from "tesseract.js";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ result: "no file uploaded" });

    const fileName = file.name;
    const extension = path.extname(fileName).toLowerCase();
    let fileContent = "";

    // ------------------------------
    // 📄 Handle TEXT / CSV / PDF
    // ------------------------------
    if ([".txt", ".csv", ".pdf"].includes(extension)) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (extension === ".txt" || extension === ".csv") {
        fileContent = new TextDecoder().decode(buffer);
      } else if (extension === ".pdf") {
        const PDFParser = require("pdf2json");
        fileContent = await new Promise((resolve, reject) => {
          const pdfParser = new PDFParser();

          pdfParser.on("pdfParser_dataError", (errData: any) =>
            reject(errData.parserError)
          );
          pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
            let rawText = "";
            pdfData.Pages.forEach((page: any) => {
              page.Texts.forEach((text: any) => {
                text.R.forEach((t: any) => {
                  rawText += decodeURIComponent(t.T) + " ";
                });
              });
            });
            resolve(rawText);
          });

          pdfParser.parseBuffer(buffer);
        });
      }
      fileContent = fileContent.replace(/\s+/g, " ").trim();
      if (fileContent.trim().length === 0)
        return NextResponse.json({ result: "no text found" });
      const systemPrompt = `
        You are a smart grocery assistant.
        Rules:
        - If the text is about grocery or food ingredients:
          - Respond ONLY in valid JSON array.
          - Each item must have: name, quantity, unit, category.
          - Guess the category automatically (e.g., rice → Grains, milk → Dairy).
        - If not related to food, respond with ONLY "no".
        `;
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: fileContent },
        ],
        temperature: 0,
      });

      const content = response.choices[0].message?.content?.trim() || "no";

      try {
        const json = JSON.parse(content);
        return NextResponse.json({ result: json });
      } catch {
        console.log("AI returned:", content);
        return NextResponse.json({ result: "no" });
      }
    } else if ([".png", ".jpg", ".jpeg"].includes(extension)) {
      const bytes = await file.arrayBuffer();
      const base64Image = Buffer.from(bytes).toString("base64");
      const mimeType = file.type || "image/png";
      const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `
You are a grocery list assistant. Extract grocery items from this image and return a valid JSON array like:
[
  {"name": "rice", "quantity": 2, "unit": "kg", "category": "Grains"},
  {"name": "milk", "quantity": 1, "unit": "litre", "category": "Dairy"}
]
If it's not a grocery list, return "no".
        `
      },
      {
        role: "user",
        content: [
          { type: "text", text: "This is a photo of a grocery list. Extract all items." },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } },
        ],
      },
    ],
      });
      const content = response.choices[0].message?.content?.trim() || "no";
      // 🧹 Clean code fences like ```json ... ```
      const cleaned = content
        .replace(/^```json\s*/i, "") // remove starting ```json
        .replace(/^```\s*/i, "")     // or starting ```
        .replace(/```$/i, "")        // remove ending ```
        .trim();

      try {
        const json = JSON.parse(cleaned);
        return NextResponse.json({ result: json });
      } catch (err) {
        console.error("❌ JSON parse error:", err);
        console.log("Raw GPT content:", content);
        return NextResponse.json({ result: "no" });
      }
    }
  } catch (error: any) {
    console.error("Parsing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
