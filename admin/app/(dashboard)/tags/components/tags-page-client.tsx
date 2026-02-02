"use client";

import { useState } from "react";
import { TagTable } from "./tag-table";
import { BulkActionsToolbar } from "./bulk-actions-toolbar";

interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  _count: { articles: number };
  seoTitle?: string | null;
  seoDescription?: string | null;
  [key: string]: unknown;
}

interface TagsPageClientProps {
  tags: Tag[];
}

export function TagsPageClient({ tags }: TagsPageClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  return (
    <>
      <BulkActionsToolbar
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
      />
      <TagTable tags={tags} onSelectionChange={setSelectedIds} />
    </>
  );
}
