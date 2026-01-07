"use client";

import React, { useEffect, useState } from "react";

interface ProductType {
  _id: string;
  name: string;
  quantity: string;
  units: string;
  category: string;
  expiryDate?: string;
  imageUrl?: string; // dynamically generated
}

interface CategoryGroup {
  categoryName: string;
  products: ProductType[];
}

interface Props {
  grouped: CategoryGroup[];
}

export default function ProductsRendering({ grouped }: Props) {
  const [categories, setCategories] = useState<CategoryGroup[]>(grouped);

  // 🗓️ Format expiry date → “10th Dec 2025”
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";

    const day = date.getDate();
    const suffix =
      day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
        ? "rd"
        : "th";

    const month = date.toLocaleString("en-GB", { month: "short" }); // e.g. "Dec"
    const year = date.getFullYear();

    return `${day}${suffix} ${month} ${year}`;
  };

  return (
    <div className="mt-6">
      {categories.map((cat, catIdx) => (
        <div key={cat.categoryName} className="mb-6">
          <h2 className="text-xl font-bold mb-2">{cat.categoryName}</h2>
          <div className="grid grid-cols-3 gap-4">
              {cat.products.map((prod, prodIdx) => (
                    <div className="card bg-base-100 w-96 shadow-sm" key={prodIdx}>
                      <figure>
                        <img
                          src={prod.imageUrl} />
                      </figure>
                      <div className="card-body">
                      <h2 className="card-title">{ prod.name}</h2>
                      <p>{prod.quantity} {prod.units}</p>
                    <p><span text-l font-bold> Expiry Date - </span>{formatDate(prod.expiryDate)} </p>
                        <div className="card-actions justify-end">
                          <button className="btn btn-primary">Buy Now</button>
                        </div>
                      </div>
                  </div>
              ))}
            </div>
        </div>
      ))}
    </div>
  );
}
