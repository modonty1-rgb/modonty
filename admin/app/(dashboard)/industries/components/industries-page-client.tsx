"use client";

import { useState } from "react";
import { IndustryTable } from "./industry-table";
import { BulkActionsToolbar } from "./bulk-actions-toolbar";

interface Industry {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  _count: { clients: number };
  seoTitle?: string | null;
  seoDescription?: string | null;
  [key: string]: unknown;
}

interface IndustriesPageClientProps {
  industries: Industry[];
}

export function IndustriesPageClient({ industries }: IndustriesPageClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  return (
    <>
      <BulkActionsToolbar
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
      />
      <IndustryTable industries={industries} onSelectionChange={setSelectedIds} />
    </>
  );
}
