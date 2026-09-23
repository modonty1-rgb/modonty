"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, SlidersHorizontal, MoreHorizontal, RefreshCw } from "lucide-react";
import { ClientsFilters } from "./clients-filters";
import { RegenerateAllSeoButton } from "./regenerate-all-seo-button";
import type { ClientForList, ClientsStats } from "../actions/clients-actions/types";

interface ClientsHeaderProps {
  clientCount: number;
  stats: ClientsStats;
  clients: ClientForList[];
  search: string;
  onSearchChange: (value: string) => void;
}

export function ClientsHeader({
  clientCount,
  stats,
  clients,
  search,
  onSearchChange,
}: ClientsHeaderProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [seoDialogOpen, setSeoDialogOpen] = useState(false);

  return (
    <div className="space-y-4 mb-6">
      {/* Row 1: Title + Stats + Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-2xl font-semibold leading-tight">
            Clients <span className="text-muted-foreground font-normal">({clientCount})</span>
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
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
        <div className="flex min-w-[min(100%,18rem)] flex-1 items-center justify-end gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="ps-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Client actions">
                <MoreHorizontal className="h-4 w-4" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Client actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setFiltersOpen(true)}>
                <SlidersHorizontal className="me-2 h-4 w-4" aria-hidden />
                Filters
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setSeoDialogOpen(true)}>
                <RefreshCw className="me-2 h-4 w-4" aria-hidden />
                Regenerate all SEO
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search sits in the header actions; this row keeps its context and expanded filters. */}
      <div className="space-y-3">
        <p dir="rtl" className="text-xs text-muted-foreground">
          ترتيب في صفحة مدونتي حسب الأولويات التالية: المميّزون، ثم الأعلى في عدد المقالات المنشورة، ثم الاسم عربيًا.
        </p>
        {filtersOpen && <ClientsFilters />}
      </div>
      <RegenerateAllSeoButton clients={clients} open={seoDialogOpen} onOpenChange={setSeoDialogOpen} hideTrigger />
    </div>
  );
}
