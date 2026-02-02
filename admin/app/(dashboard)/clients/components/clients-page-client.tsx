"use client";

import { useState } from "react";
import { ClientTable } from "./client-table";
import { BulkActionsToolbar } from "./bulk-actions-toolbar";
import { useSearchContext } from "./clients-header-wrapper";
import type { ClientForList } from "../actions/clients-actions/types";

interface ClientsPageClientProps {
  clients: ClientForList[];
  clientCount: number;
  description: string;
}

export function ClientsPageClient({ clients, clientCount, description }: ClientsPageClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { search } = useSearchContext();

  return (
    <div className="space-y-4">
      <BulkActionsToolbar
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
      />
      <ClientTable clients={clients} onSelectionChange={setSelectedIds} search={search} />
    </div>
  );
}
