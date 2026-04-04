"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { CategoryTable } from "./category-table";

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
  missingSeoCount: number;
}

export function CategoriesPageClient({ categories, missingSeoCount }: CategoriesPageClientProps) {
  const [batchLoading, setBatchLoading] = useState(false);

  const handleBatchGenerate = async () => {
    setBatchLoading(true);
    try {
      const { batchGenerateCategorySeo } = await import("@/lib/seo/category-seo-generator");
      const result = await batchGenerateCategorySeo();
      alert(`Done: ${result.successful} succeeded, ${result.failed} failed out of ${result.total}`);
      window.location.reload();
    } catch {
      alert("Failed to generate SEO");
    } finally {
      setBatchLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {missingSeoCount > 0 && (
        <div className="flex items-center justify-between px-3 py-2 border border-yellow-500/20 bg-yellow-500/[0.04] rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
            <span className="text-xs text-yellow-500">
              {missingSeoCount} {missingSeoCount === 1 ? "category" : "categories"} missing SEO cache
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBatchGenerate}
            disabled={batchLoading}
            className="h-7 text-xs text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
          >
            {batchLoading ? "Generating…" : "Generate All"}
          </Button>
        </div>
      )}
      <CategoryTable categories={categories} />
    </div>
  );
}
