"use client";

import { ClientTable, type StatusFilterKey } from "./client-table";
import { useSearchContext } from "./clients-header-wrapper";
import type { ClientForList } from "../actions/clients-actions/types";

interface ClientsPageClientProps {
  clients: ClientForList[];
  defaultLogoUrl?: string | null;
  statusFilter?: StatusFilterKey;
}

export function ClientsPageClient({ clients, defaultLogoUrl, statusFilter }: ClientsPageClientProps) {
  const { search } = useSearchContext();

  return (
    <ClientTable clients={clients} search={search} defaultLogoUrl={defaultLogoUrl} statusFilter={statusFilter} />
  );
}
