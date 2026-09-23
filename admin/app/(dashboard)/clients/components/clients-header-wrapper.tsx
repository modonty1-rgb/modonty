"use client";

import { useState, createContext, useContext, ReactNode } from "react";
import { ClientsHeader } from "./clients-header";
import type { ClientsStats } from "../actions/clients-actions/types";
import type { ClientForList } from "../actions/clients-actions/types";

interface ClientsHeaderWrapperProps {
  clientCount: number;
  stats: ClientsStats;
  clients: ClientForList[];
  children: ReactNode;
}

const SearchContext = createContext<{
  search: string;
  setSearch: (value: string) => void;
} | null>(null);

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearchContext must be used within ClientsHeaderWrapper");
  }
  return context;
}

export function ClientsHeaderWrapper({
  clientCount,
  stats,
  clients,
  children,
}: ClientsHeaderWrapperProps) {
  const [search, setSearch] = useState("");

  return (
    <SearchContext.Provider value={{ search, setSearch }}>
      <ClientsHeader
        clientCount={clientCount}
        stats={stats}
        clients={clients}
        search={search}
        onSearchChange={setSearch}
      />
      {children}
    </SearchContext.Provider>
  );
}
