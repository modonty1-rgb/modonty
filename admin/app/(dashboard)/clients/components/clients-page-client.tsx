"use client";

import { ClientTable } from "./client-table";
import { useSearchContext } from "./clients-header-wrapper";
import type { ClientForList } from "../actions/clients-actions/types";

interface ClientsPageClientProps {
  clients: ClientForList[];
  defaultLogoUrl?: string | null;
}

export function ClientsPageClient({ clients, defaultLogoUrl }: ClientsPageClientProps) {
  const { search } = useSearchContext();

  return (
    <ClientTable clients={clients} search={search} defaultLogoUrl={defaultLogoUrl} />
  );
}
