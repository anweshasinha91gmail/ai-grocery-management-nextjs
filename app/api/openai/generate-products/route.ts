// app/api/parse-ingredients/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    const systemPrompt = `
You are a smart grocery assistant.
Rules:
- If the user query is about food ingredients:
    - Respond ONLY in valid JSON array.
    - Each item must have: name, quantity, unit, category.
    - Guess the category automatically (e.g., rice → Grains, milk → Dairy).
- If the query is NOT related to food ingredients, respond with ONLY "no".
Example:
Input: "Add 2 packets of Maggi, 1 kg rice, 5 eggs"
Output:
[
  { "name": "Maggi", "quantity": 2, "unit": "packets", "category": "Instant Food" },
  { "name": "rice", "quantity": 1, "unit": "kg", "category": "Grains" },
  { "name": "eggs", "quantity": 5, "unit": "pieces", "category": "Protein" }
]
Now parse: "${query}"
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
      temperature: 0,
    });

    const content = response.choices[0].message?.content?.trim() || "no";

    try {
      const json = JSON.parse(content);
      return NextResponse.json({ result: json });
    } catch {
      return NextResponse.json({ result: "no" });
    }
  } catch (error) {
    console.error("Parsing error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
