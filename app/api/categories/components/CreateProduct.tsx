"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";

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
};

export default function CreateProduct() {
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [loadingSpeech, setLoadingSpeech] = useState(false);
  const [generatingProducts, setGeneratingProducts] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [products, setProducts] = useState<ProductType[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Start recording
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      setLoadingSpeech(true);
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const res = await fetch("/api/openai/parse-speech-to-text", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setTranscript(data.transcript || "");
      setLoadingSpeech(false);
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingProducts(true);

    if (!transcript.trim()) return;

    const res = await fetch("/api/openai/generate-products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: transcript }),
    });

    const data = await res.json();

    if (data.result && Array.isArray(data.result)) {
      setParsedItems(data.result);
      setGeneratingProducts(false);
    } else {
      alert("Not a valid food input!");
    }
  };
  const handleChange = (index: number, field: keyof ProductType, value: string) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };
  const handleProductSubmit = async () => {
  try {
    // Map parsedItems -> ProductType
    const productsToSend: ProductType[] = parsedItems.map(item => ({
      name: item.name,
      quantity: item.quantity.toString(),
      units: item.unit,
      category: item.category,
    }));

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products: productsToSend }),
    });

    const data = await res.json();
    if (data.success) {
      alert("✅ Pantry saved successfully!");
    } else {
      alert("❌ Error: " + data.error);
    }
  } catch (err: any) {
    alert("❌ Failed to save: " + err.message);
  }
};

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-black">🥕 Pantry Manager</h1>

      {/* Recording buttons */}
      {!recording ? (
        <button
          onClick={startRecording}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          {loadingSpeech ? 'Parsing Speech To Text...' : 'Start Recording'}
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Stop Recording
        </button>
      )}
    <Link href="/admin/scan-product-list" className="btn btn-accent">Scan Product List</Link>
      {/* Transcript textarea */}
      <form onSubmit={handleSubmit} className="mt-4">
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Transcript will appear here..."
          rows={4}
          className="w-full p-2 border rounded border-black"
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          {generatingProducts ? 'Generating Product Details...' : 'Process With AI'}
        </button>
      </form>

      {/* Parsed items table */}
      {parsedItems.length > 0 && (
        <table className="mt-6 w-full border-collapse border border-gray-300">
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
                    name={"name" + idx}
                    type="text"
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
                    name={"quantity" + idx}
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
                    name={"unit" + idx}
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
                    name={"category" + idx}
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
    </div>
  );
}
