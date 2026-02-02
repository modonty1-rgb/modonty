"use client";

import { useState, createContext, useContext, ReactNode } from "react";
import { ContactMessagesHeader } from "./contact-messages-header";

interface ContactMessagesHeaderWrapperProps {
  messageCount: number;
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
    throw new Error("useSearchContext must be used within ContactMessagesHeaderWrapper");
  }
  return context;
}

export function ContactMessagesHeaderWrapper({ 
  messageCount, 
  description, 
  children
}: ContactMessagesHeaderWrapperProps) {
  const [search, setSearch] = useState("");

  return (
    <SearchContext.Provider value={{ search, setSearch }}>
      <ContactMessagesHeader
        messageCount={messageCount}
        description={description}
        search={search}
        onSearchChange={setSearch}
      />
      {children}
    </SearchContext.Provider>
  );
}
