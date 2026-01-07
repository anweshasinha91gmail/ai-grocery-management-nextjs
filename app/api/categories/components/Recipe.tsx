"use client";

import { useState } from "react";
import Header from "@/app/Header";


interface Ingredient {
  name: string;
  product: string;
  image: string;
  rating: string;
}

export default function RecipeForm() {
  const [query, setQuery] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [recipe, setRecipe] = useState("");
  const [notFood, setNotFood] = useState(false);
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState<{ productName: string; amazon: string }[]>(
    []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/openai/generate-recipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();

    try {
      // Try parsing JSON (when cooking related)
      const parsed = JSON.parse(data.result);
      setIngredients(parsed.ingredients);
      setRecipe(parsed.recipe);
      setSelected(new Set()); // reset selections
      setNotFood(false);
    } catch {
      // If not food related, we expect "no"
      setIngredients([]);
      setRecipe("");
      setNotFood(true);
    }finally {
      setLoading(false);
    }
  };

  //Toggle checkboxes
  const toggleSelection = (ingredientName: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(ingredientName)) {
      newSelected.delete(ingredientName);
    } else {
      newSelected.add(ingredientName);
    }
    setSelected(newSelected);
  };

  // Generate Amazon links
  const generateLinks = () => {
    const results = Array.from(selected).map((productName) => ({
      productName,
      amazon: `https://www.amazon.in/s?k=${encodeURIComponent(
        productName
      )}&s=review-rank`, // sorted by top reviews
    }));
    setLinks(results);
  };

  return (
    <div className="w-full">
      <Header />
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">🍴 AI Recipe Generator</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask me how to cook something..."
            className="border p-2 w-full rounded"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </form>

        {notFood && <p className="mt-4 text-red-500">❌ Not a cooking-related question</p>}

        {ingredients.length > 0 && (
          <div className="mt-6">
            <h2 className="font-bold text-lg">Ingredients</h2>
            <ul className="space-y-2 mt-2">
              {ingredients.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <input type="checkbox" id={`ingredient-${idx}`} checked={selected.has(item.product)}
                      onChange={() => toggleSelection(item.product)} />
                  <label htmlFor={`ingredient-${idx}`}><ul className="list bg-base-100 rounded-box shadow-md m-t-2">
                      <li className="list-row">
                        <div>
                          <div>{ item.name}</div>
                          <div className="text-xs uppercase font-semibold opacity-60">{ item.product}</div>
                        </div>
                        <p className="list-col-wrap text-xs">
                          Ratings: { item.rating } / 5
                        </p>

                      </li>
                  </ul>
                  </label>
                </li>
              ))}
            </ul>
                <button
              onClick={generateLinks}
              className="mt-3 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Get Amazon Links
            </button>
            {/* Amazon Links */}
            {links.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-2 mt-4">📦 Buy Ingredients</h2>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.productName}>
                      ✅ {link.productName}:{" "}
                      <a
                        href={link.amazon}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View on Amazon
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <h2 className="font-bold text-lg mt-4">Recipe</h2>
            <p className="mt-2 whitespace-pre-line">{recipe}</p>
          </div>
        )}
      </div>
    </div>
  );
}
