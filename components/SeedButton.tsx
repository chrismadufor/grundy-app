"use client";

import { useState } from "react";

export default function SeedButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSeed() {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Failed to seed");
      }
      setResult(`Seeded ${data.created} products. Skipped ${data.skipped}.`);
    } catch (e: any) {
      setError(e?.message || "Failed to seed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleSeed}
        disabled={loading}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {loading ? "Seeding..." : "Start Seed"}
      </button>
      {result && <p className="text-green-600 text-sm">{result}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}
