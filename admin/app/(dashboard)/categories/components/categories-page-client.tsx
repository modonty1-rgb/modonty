"use client";

import { useState } from "react";
import { CategoryTable } from "./category-table";
import { BulkActionsToolbar } from "./bulk-actions-toolbar";

interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  parent: { name: string } | null;
  _count: { articles: number };
  seoTitle?: string | null;
  seoDescription?: string | null;
  [key: string]: unknown;
}

interface CategoriesPageClientProps {
  categories: Category[];
}

export function CategoriesPageClient({ categories }: CategoriesPageClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const missingSeo = categories.filter((c: any) => !c.jsonLdLastGenerated).length;

  const handleBatchGenerate = async () => {
    setBatchLoading(true);
    try {
      const { batchGenerateCategorySeo } = await import("@/lib/seo/category-seo-generator");
      const result = await batchGenerateCategorySeo();
      alert(`✅ Done: ${result.successful} succeeded, ${result.failed} failed out of ${result.total}`);
      window.location.reload();
    } catch (e) {
      alert("❌ Failed to generate SEO");
    } finally {
      setBatchLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <BulkActionsToolbar
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
      />
      {missingSeo > 0 && (
        <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
          <span className="text-yellow-800">
            ⚠️ {missingSeo} {missingSeo === 1 ? "category is" : "categories are"} missing SEO cache
          </span>
          <button
            onClick={handleBatchGenerate}
            disabled={batchLoading}
            className="px-3 py-1 text-xs font-medium bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
          >
            {batchLoading ? "Generating..." : "Generate SEO for all"}
          </button>
        </div>
      )}
      <CategoryTable categories={categories} onSelectionChange={setSelectedIds} />
    </div>
  );
}
