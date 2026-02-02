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

  return (
    <>
      <BulkActionsToolbar
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
      />
      <CategoryTable categories={categories} onSelectionChange={setSelectedIds} />
    </>
  );
}
