"use client";

import { useState, createContext, useContext, ReactNode } from "react";
import { ClientsHeader } from "./clients-header";

interface ClientsHeaderWrapperProps {
  clientCount: number;
  description: string;
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

export function ClientsHeaderWrapper({ clientCount, description, children }: ClientsHeaderWrapperProps) {
  const [search, setSearch] = useState("");

  return (
    <SearchContext.Provider value={{ search, setSearch }}>
      <ClientsHeader
        clientCount={clientCount}
        description={description}
        search={search}
        onSearchChange={setSearch}
      />
      {children}
    </SearchContext.Provider>
  );
}
