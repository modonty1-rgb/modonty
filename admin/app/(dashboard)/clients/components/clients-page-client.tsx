"use client";

import { ClientTable } from "./client-table";
import { RegenerateAllSeoButton } from "./regenerate-all-seo-button";
import { useSearchContext } from "./clients-header-wrapper";
import type { ClientForList } from "../actions/clients-actions/types";

interface ClientsPageClientProps {
  clients: ClientForList[];
}

export function ClientsPageClient({ clients }: ClientsPageClientProps) {
  const { search } = useSearchContext();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <RegenerateAllSeoButton clients={clients} />
      </div>
      <ClientTable clients={clients} search={search} />
    </div>
  );
}
