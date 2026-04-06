"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ArticlesFilters } from "./articles-filters";

interface ArticlesSearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  clients: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
  authors: Array<{ id: string; name: string }>;
}

export function ArticlesSearchBar({
  search,
  onSearchChange,
  clients,
  categories,
  authors,
}: ArticlesSearchBarProps) {
  return (
    <div className="flex items-center gap-2">
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
  );
}
