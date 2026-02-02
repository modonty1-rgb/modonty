"use client";

import { useState, createContext, useContext, ReactNode } from "react";
import { ArticlesHeader } from "./articles-header";

interface ArticlesHeaderWrapperProps {
  articleCount: number;
  description: string;
  children: ReactNode;
  clients: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
  authors: Array<{ id: string; name: string }>;
}

const SearchContext = createContext<{
  search: string;
  setSearch: (value: string) => void;
} | null>(null);

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearchContext must be used within ArticlesHeaderWrapper");
  }
  return context;
}

export function ArticlesHeaderWrapper({ 
  articleCount, 
  description, 
  children,
  clients,
  categories,
  authors
}: ArticlesHeaderWrapperProps) {
  const [search, setSearch] = useState("");

  return (
    <SearchContext.Provider value={{ search, setSearch }}>
      <ArticlesHeader
        articleCount={articleCount}
        description={description}
        search={search}
        onSearchChange={setSearch}
        clients={clients}
        categories={categories}
        authors={authors}
      />
      {children}
    </SearchContext.Provider>
  );
}
