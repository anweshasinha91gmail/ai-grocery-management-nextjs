"use client";

import React, { useState } from "react";
import { normalizeName } from "@/app/util/normalizeName";

interface ParsedItem {
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

interface ProductType {
  name: string;
  quantity: string;
  units: string;
  category: string;
  expiryDate?: string; // will be ISO string from input type="date"
}

export default function ScanProductList() {
  const [loading, setLoading] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [storing, setStoring] = useState(false);
  const [popup, setPopup] = useState<{ message: string; success: boolean } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setPopup(null);

    const res = await fetch("/api/openai/upload-product-list", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (data.result && Array.isArray(data.result)) {
      setParsedItems(data.result);
    } else {
      setPopup({ message: "❌ Not a valid food input!", success: false });
    }
  };

  const handleProductSubmit = async () => {
    try {
      const productsToSend = parsedItems.map((item) => ({
        name: item.name,
        quantity: item.quantity.toString(),
        units: item.unit,
        category: item.category,
      }));

      setStoring(true);
      setPopup(null);

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: productsToSend }),
      });

      const data = await res.json();
      setStoring(false);

      if (data.success) {
        setPopup({ message: "✅ Pantry saved successfully!", success: true });
      } else {
        setPopup({ message: "❌ Error: " + data.error, success: false });
      }
    } catch (err: any) {
      setPopup({ message: "❌ Failed to save: " + err.message, success: false });
      setStoring(false);
    }
  };

  return (
    <div className="relative p-6 border rounded-md bg-gray-100 mx-auto max-w-3xl">
      <h2 className="text-lg font-bold mb-2">📂 Scan & Upload Your Grocery List</h2>

      {/* File Upload */}
      <input
        type="file"
        accept=".txt,.csv,.pdf,.jpg,.png,.jpeg"
        onChange={handleFileUpload}
        className="block w-full text-sm text-gray-700 border rounded px-2 py-1"
      />

      {loading && (
        <div className="text-blue-600 mt-3 font-medium">Processing file... please wait</div>
      )}

      {/* Table Display */}
      {parsedItems.length > 0 && (
        <table className="mt-6 w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-3 py-2">Name</th>
              <th className="border px-3 py-2">Quantity</th>
              <th className="border px-3 py-2">Unit</th>
              <th className="border px-3 py-2">Category</th>
            </tr>
          </thead>
          <tbody>
            {parsedItems.map((item, idx) => (
              <tr key={idx}>
                <td className="border px-3 py-2">
                  <input
                    value={item.name}
                    onChange={(e) => {
                      const updated = [...parsedItems];
                      updated[idx].name = e.target.value;
                      setParsedItems(updated);
                    }}
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="border px-3 py-2">
                  <input
                    type="text"
                    value={item.quantity}
                    onChange={(e) => {
                      const updated = [...parsedItems];
                      updated[idx].quantity = Number(e.target.value);
                      setParsedItems(updated);
                    }}
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="border px-3 py-2">
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => {
                      const updated = [...parsedItems];
                      updated[idx].unit = e.target.value;
                      setParsedItems(updated);
                    }}
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="border px-3 py-2">
                  <input
                    type="text"
                    value={item.category}
                    onChange={(e) => {
                      const updated = [...parsedItems];
                      updated[idx].category = e.target.value;
                      setParsedItems(updated);
                    }}
                    className="w-full p-1 border rounded"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Save Button */}
      {parsedItems.length > 0 && (
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleProductSubmit}
            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            💾 Save Pantry
          </button>
        </div>
      )}

      {/* 🔲 Overlay while saving */}
      {storing && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="text-white text-xl animate-pulse">
            ⏳ Saving your pantry items...
          </div>
        </div>
      )}

      {/* ✅ Popup Message */}
      {popup && (
        <div
          className={`fixed bottom-5 right-5 px-4 py-3 rounded-md shadow-lg text-white transition-all duration-500 ${
            popup.success ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {popup.message}
        </div>
      )}
    </div>
  );
}
