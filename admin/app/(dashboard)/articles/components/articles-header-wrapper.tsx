"use client";

import { useState, createContext, useContext, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, HeartPulse } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ArticleStatus } from "@prisma/client";
import { getStatusLabel, getStatusVariant } from "../helpers/status-utils";
import { ArticlesFilters } from "./articles-filters";

interface ArticlesHeaderWrapperProps {
  articleCount: number;
  description: string;
  children: ReactNode;
  clients: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
  authors: Array<{ id: string; name: string }>;
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
  statsSlot,
}: ArticlesHeaderWrapperProps) {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const activeStatus = searchParams.get("status") || "";

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
            <h1 className="text-xl font-semibold leading-tight whitespace-nowrap">
              Articles <span className="text-muted-foreground font-normal text-base">({articleCount})</span>
            </h1>
            {statsSlot}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ArticlesFilters clients={clients} categories={categories} authors={authors} />
            <Link href="/seo-overview">
              <Button size="sm" variant="outline" className="whitespace-nowrap gap-1.5 rounded-full px-4">
                <HeartPulse className="h-3.5 w-3.5" />
                SEO Health
              </Button>
            </Link>
            <Link href="/articles/new">
              <Button size="sm" className="whitespace-nowrap gap-1.5 rounded-full px-4 shadow-sm">
                <Plus className="h-3.5 w-3.5" />
                New Article
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
          <div className="hidden md:flex items-center gap-1 shrink-0">
            <Badge
              variant={!activeStatus ? "default" : "outline"}
              className="cursor-pointer px-2.5 py-1 text-xs hover:bg-accent transition-colors"
              onClick={() => {
                startTransition(() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("status");
                  const queryString = params.toString();
                  router.push(queryString ? `/articles?${queryString}` : "/articles");
                });
              }}
            >
              All
            </Badge>
            {Object.values(ArticleStatus).map((status) => (
              <Badge
                key={status}
                variant={activeStatus === status ? getStatusVariant(status) : "outline"}
                className="cursor-pointer px-2.5 py-1 text-xs hover:bg-accent transition-colors"
                onClick={() => handleStatusFilter(status)}
              >
                {getStatusLabel(status)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Table content */}
        {children}
      </div>
    </SearchContext.Provider>
  );
}
