"use client";

import { useState } from "react";

export function RevalidateAllSEOButton() {
  const [loading, setLoading] = useState(false);

  const handleRevalidate = async () => {
    setLoading(true);
    try {
      const { batchGenerateCategorySeo } = await import("@/lib/seo/category-seo-generator");
      const result = await batchGenerateCategorySeo();
      alert(`✅ Done: ${result.successful} succeeded, ${result.failed} failed out of ${result.total}`);
      window.location.reload();
    } catch {
      alert("❌ Failed to generate SEO");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRevalidate}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-border rounded hover:bg-muted disabled:opacity-50"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={loading ? "animate-spin" : ""}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
      {loading ? "Revalidating..." : "Revalidate All SEO"}
    </button>
  );
}
