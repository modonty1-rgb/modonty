"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, CalendarClock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClientsFilters } from "./clients-filters";
import type { ClientsStats } from "../actions/clients-actions/types";

interface ClientsHeaderProps {
  clientCount: number;
  stats: ClientsStats;
  expiringThisMonth: number;
  /** Live clients whose paid period already ended — counted by DATE, see expiredByDateWhere. */
  overdueRenewals: number;
  search: string;
  onSearchChange: (value: string) => void;
}

export function ClientsHeader({
  clientCount,
  stats,
  expiringThisMonth,
  overdueRenewals,
  search,
  onSearchChange,
}: ClientsHeaderProps) {
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
            {/**
              * Already overdue — the money that has ALREADY lapsed, ahead of the money
              * about to. It hides itself at zero, so it only ever appears when someone
              * is being served unpaid.
              *
              * It exists because neither surface on this page could show these clients:
              * the `Expired` tab counts `subscriptionStatus`, which nothing in the
              * repository ever writes, so it reads 0 with four clients overdue; and the
              * renewals chip starts at the first of this month, so whoever lapsed in an
              * earlier month fell through both (measured 2026-09-19: مركز فريق الإغاثة,
              * ended 27 Aug, appeared nowhere).
              */}
            {overdueRenewals > 0 && (
              <Link
                href="/clients/segment/expired"
                title="Their paid period has already ended — still live, renewal overdue"
                className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/15 px-3 py-1 text-xs font-bold text-red-600 transition-colors hover:bg-red-500/25 dark:text-red-400"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Overdue
                <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold leading-none tabular-nums text-white">
                  {overdueRenewals}
                </span>
              </Link>
            )}

            {/* Renewals this month — money queue. Links to the full segment table. */}
            <Link
              href="/clients/segment/expiring-month"
              title="Clients whose subscription ends this month — open the renewals list"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-colors",
                expiringThisMonth > 0
                  ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20"
                  : "border-border bg-muted/40 text-muted-foreground hover:bg-muted",
              )}
            >
              <CalendarClock className="h-3.5 w-3.5" />
              Renewals this month
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums leading-none",
                  expiringThisMonth > 0 ? "bg-red-500 text-white" : "bg-muted-foreground/20 text-muted-foreground",
                )}
              >
                {expiringThisMonth}
              </span>
            </Link>
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
