"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import Link from "next/link";
import { ArticlesFilters } from "./articles-filters";

interface ArticlesHeaderProps {
  articleCount: number;
  description: string;
  search: string;
  onSearchChange: (value: string) => void;
  clients: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
  authors: Array<{ id: string; name: string }>;
}

export function ArticlesHeader({ 
  articleCount, 
  description, 
  search, 
  onSearchChange,
  clients,
  categories,
  authors
}: ArticlesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-2xl font-semibold leading-tight whitespace-nowrap">
          Articles <span className="text-muted-foreground font-normal">({articleCount})</span>
        </h1>
      </div>
      <div className="flex items-center gap-2 flex-1 min-w-0 max-w-2xl">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <ArticlesFilters clients={clients} categories={categories} authors={authors} />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link href="/articles/new">
          <Button className="whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Button>
        </Link>
      </div>
    </div>
  );
}
