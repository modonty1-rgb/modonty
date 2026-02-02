"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ContactMessagesFilters } from "./contact-messages-filters";

interface ContactMessagesHeaderProps {
  messageCount: number;
  description: string;
  search: string;
  onSearchChange: (value: string) => void;
}

export function ContactMessagesHeader({ 
  messageCount, 
  description, 
  search, 
  onSearchChange
}: ContactMessagesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-2xl font-semibold leading-tight whitespace-nowrap">
          Contact Messages <span className="text-muted-foreground font-normal">({messageCount})</span>
        </h1>
      </div>
      <div className="flex items-center gap-2 flex-1 min-w-0 max-w-2xl">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search messages..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <ContactMessagesFilters />
      </div>
    </div>
  );
}
