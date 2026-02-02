"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import Link from "next/link";
import { ClientsFilters } from "./clients-filters";

interface ClientsHeaderProps {
  clientCount: number;
  description: string;
  search: string;
  onSearchChange: (value: string) => void;
}

export function ClientsHeader({ clientCount, description, search, onSearchChange }: ClientsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-2xl font-semibold leading-tight whitespace-nowrap">
          Clients <span className="text-muted-foreground font-normal">({clientCount})</span>
        </h1>
      </div>
      <div className="flex items-center gap-2 flex-1 min-w-0 max-w-2xl">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <ClientsFilters />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link href="/clients/new">
          <Button className="whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            New Client
          </Button>
        </Link>
      </div>
    </div>
  );
}
