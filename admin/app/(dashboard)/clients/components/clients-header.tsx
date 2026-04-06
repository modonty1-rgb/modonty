"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { ClientsFilters } from "./clients-filters";
import type { ClientsStats } from "../actions/clients-actions/types";

interface ClientsHeaderProps {
  clientCount: number;
  stats: ClientsStats;
  search: string;
  onSearchChange: (value: string) => void;
}

export function ClientsHeader({ clientCount, stats, search, onSearchChange }: ClientsHeaderProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="space-y-4 mb-6">
      {/* Row 1: Title + Stats + Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-2xl font-semibold leading-tight">
            Clients <span className="text-muted-foreground font-normal">({clientCount})</span>
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs gap-1">
              {stats.total} total
            </Badge>
            <Badge variant="secondary" className="text-xs gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {stats.delivery.deliveryRate}% delivery
            </Badge>
            <Badge
              variant="secondary"
              className={`text-xs gap-1 ${
                stats.averageSEO >= 80
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : stats.averageSEO >= 60
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              {stats.averageSEO}% SEO
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={filtersOpen ? "bg-muted" : ""}
          >
            <SlidersHorizontal className="h-4 w-4 me-1.5" />
            Filters
          </Button>
          <Link href="/clients/new">
            <Button size="sm">
              <Plus className="h-4 w-4 me-1.5" />
              New Client
            </Button>
          </Link>
        </div>
      </div>

      {/* Row 2: Search + Filters (collapsible) */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="ps-10"
          />
        </div>
        {filtersOpen && <ClientsFilters />}
      </div>
    </div>
  );
}
