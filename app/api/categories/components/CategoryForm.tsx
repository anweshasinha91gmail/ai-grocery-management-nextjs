'use client';

import { useState } from 'react';

interface Category {
  _id: string;
  name: string;
}

interface Props {
  topCategories: Category[];
}

export default function CategoryForm({ topCategories }: Props) {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState<Category[]>(topCategories);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name}),
      });

      if (!res.ok) throw new Error('Failed to create category');

      const newCategory = await res.json();

      // Update category list instantly
      setCategories(prev => [...prev, newCategory]);

      setMessage(`Category "${newCategory.name}" created successfully!`);
      setName('');
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="p-4 bg-white shadow rounded space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {loading ? 'Saving...' : 'Create Category'}
        </button>

        {message && <p className="mt-2 text-green-600">{message}</p>}
      </form>

      {/* Optional: display all categories live */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold">All Categories</h2>
        <ul className="list-disc pl-5">
          {categories.map(cat => (
            <li key={cat._id}>
              {cat.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
