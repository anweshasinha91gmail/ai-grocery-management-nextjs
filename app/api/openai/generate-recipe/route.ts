import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  const { query } = await req.json();

  // Construct a structured prompt
  const systemPrompt = `
You are a strict cooking assistant.

Rules:
- If the user query is about cooking, recipes, or food preparation:
    - Respond ONLY in valid JSON with this structure:

{
  "ingredients": [
    {
      "name": "ingredient1",
      "product": "Top product name for this ingredient",
      "image": "URL of product image",
      "rating": "Rating of the product"
    }
  ],
  "recipe": "Step by step instructions"
}

- Example:
Query: "How to make vegan cake?"
Response:
{
  "ingredients": [
    {
      "name": "Flour",
      "product": "Aashirvaad Whole Wheat Atta 5kg",
      "image": "https://example.com/flour.jpg",
      "rating": "4.7"
    },
    {
      "name": "Sugar",
      "product": "Dabur Sugar 1kg",
      "image": "https://example.com/sugar.jpg",
      "rating": "4.5"
    }
  ],
  "recipe": "Mix flour and sugar. Bake at 180°C for 30 mins."
}

- If the query is NOT related to cooking/recipes/food, respond with ONLY the string: "no".
- Do not add extra text or explanation.
- Only return valid JSON.
`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
      temperature: 0,
    });

    const content = response.choices[0].message?.content || "no";

    return NextResponse.json({ result: content });
  } catch (error) {
    console.error("Error in OpenAI call:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
