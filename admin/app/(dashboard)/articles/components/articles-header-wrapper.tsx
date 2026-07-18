"use client";

import { useState, createContext, useContext, Fragment, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, HeartPulse, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ArticleStatus } from "@prisma/client";
import { getStatusLabel } from "../helpers/status-utils";
import { cn } from "@/lib/utils";
import { ArticlesFilters } from "./articles-filters";

/** A status tab split into two segments: label | count, divided by a splitter.
 *  When active the count segment inverts colour so it never blends into the fill. */
function CountTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center overflow-hidden rounded-full border text-xs font-medium transition-colors",
        active ? "border-primary" : "border-border hover:bg-accent",
      )}
    >
      <span className={cn("px-2.5 py-1", active ? "bg-primary text-primary-foreground" : "text-foreground")}>
        {label}
      </span>
      <span
        className={cn(
          "border-s px-2 py-1 font-bold tabular-nums",
          active
            ? "border-primary-foreground/30 bg-primary-foreground text-primary"
            : "border-border bg-muted text-muted-foreground",
        )}
      >
        {count}
      </span>
    </button>
  );
}

interface ArticlesHeaderWrapperProps {
  articleCount: number;
  description: string;
  children: ReactNode;
  clients: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
  authors: Array<{ id: string; name: string }>;
  statusCounts: Record<ArticleStatus, number>;
  statsSlot: ReactNode;
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
  authors,
  statusCounts,
  statsSlot,
}: ArticlesHeaderWrapperProps) {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const activeStatus = searchParams.get("status") || "";
  const totalCount = Object.values(statusCounts).reduce((sum, n) => sum + n, 0);

  const handleStatusFilter = (status: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (status === activeStatus) {
        params.delete("status");
      } else {
        params.set("status", status);
      }
      const queryString = params.toString();
      router.push(queryString ? `/articles?${queryString}` : "/articles");
    });
  };

  return (
    <SearchContext.Provider value={{ search, setSearch }}>
      <div className="space-y-3">
        {/* Header row: Title + Stats + Filters + New Article */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-wrap">
            <h1 key="title" className="text-xl font-semibold leading-tight whitespace-nowrap">
              Articles <span className="text-muted-foreground font-normal text-base">({articleCount})</span>
            </h1>
            <Fragment key="stats">{statsSlot}</Fragment>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ArticlesFilters clients={clients} categories={categories} authors={authors} />
            <Link href="/seo-overview">
              <Button size="sm" variant="outline" className="whitespace-nowrap gap-1.5 rounded-full px-4">
                <HeartPulse className="h-3.5 w-3.5" />
                SEO Health
              </Button>
            </Link>
          </div>
        </div>

        {/* Search + Status tabs row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full h-9"
            />
          </div>
          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            <CountTab
              label="All"
              count={totalCount}
              active={!activeStatus}
              onClick={() => {
                startTransition(() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("status");
                  const queryString = params.toString();
                  router.push(queryString ? `/articles?${queryString}` : "/articles");
                });
              }}
            />
            {Object.values(ArticleStatus).map((status) => (
              <CountTab
                key={status}
                label={getStatusLabel(status)}
                count={statusCounts[status]}
                active={activeStatus === status}
                onClick={() => handleStatusFilter(status)}
              />
            ))}
          </div>
        </div>

        {/* Table content — dimmed with a spinner while a tab switch is loading */}
        <div className="relative">
          {isPending && (
            <div className="absolute inset-0 z-10 flex items-start justify-center rounded-lg bg-background/50 pt-20 backdrop-blur-[1px]">
              <span className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                جارٍ التحميل…
              </span>
            </div>
          )}
          <div
            className={
              isPending
                ? "pointer-events-none opacity-50 transition-opacity"
                : "transition-opacity"
            }
          >
            {children}
          </div>
        </div>
      </div>
    </SearchContext.Provider>
  );
}
