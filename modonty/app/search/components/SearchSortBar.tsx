"use client";

import { useRouter } from "next/navigation";
import { IconSort } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SortDropdown } from "@/app/clients/components/sort-dropdown";
import type { ClientSortOption } from "@/app/api/helpers/client-queries";

type SearchScope = "all" | "articles" | "clients";
type ArticleSortOption = "newest" | "oldest" | "title";

const ARTICLE_SORT_OPTIONS: { value: ArticleSortOption; label: string }[] = [
  { value: "newest", label: "الأحدث أولاً" },
  { value: "oldest", label: "الأقدم أولاً" },
  { value: "title", label: "الترتيب الأبجدي" },
];

interface SearchSortBarProps {
  scope: SearchScope;
  query: string;
  sortArticles: ArticleSortOption;
  sortClients: ClientSortOption;
}

function buildSearchUrl(
  query: string,
  scope: SearchScope,
  sortArticles: ArticleSortOption,
  sortClients: ClientSortOption,
  overrides: { sort_articles?: ArticleSortOption; sort_clients?: ClientSortOption; page?: number } = {}
): string {
  const q = encodeURIComponent(query);
  const type = scope !== "all" ? `&type=${scope}` : "";
  const sa = overrides.sort_articles ?? sortArticles;
  const sc = overrides.sort_clients ?? sortClients;
  const sortArticlesParam = sa !== "newest" ? `&sort_articles=${sa}` : "";
  const sortClientsParam = sc !== "name-asc" ? `&sort_clients=${sc}` : "";
  const pageParam = overrides.page !== undefined && overrides.page !== 1 ? `&page=${overrides.page}` : "";
  return `/search?q=${q}${type}${sortArticlesParam}${sortClientsParam}${pageParam}`;
}

export function SearchSortBar({ scope, query, sortArticles, sortClients }: SearchSortBarProps) {
  const router = useRouter();

  const handleArticleSort = (value: ArticleSortOption) => {
    router.replace(buildSearchUrl(query, scope, sortArticles, sortClients, { sort_articles: value, page: 1 }));
  };

  const handleClientSort = (value: ClientSortOption) => {
    router.replace(buildSearchUrl(query, scope, sortArticles, sortClients, { sort_clients: value }));
  };

  const showArticleSort = scope === "all" || scope === "articles";
  const showClientSort = scope === "all" || scope === "clients";

  if (!showArticleSort && !showClientSort) return null;

  const articleLabel = ARTICLE_SORT_OPTIONS.find((o) => o.value === sortArticles)?.label ?? "ترتيب المقالات";

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4" dir="rtl">
      {showArticleSort && (
        <div className="flex items-center gap-2">
          {scope === "all" && <span className="text-sm text-muted-foreground">ترتيب المقالات:</span>}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <IconSort className="h-4 w-4" />
                <span className="hidden md:inline">{articleLabel}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {ARTICLE_SORT_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleArticleSort(option.value)}
                  className={option.value === sortArticles ? "bg-accent" : ""}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      {showClientSort && (
        <div className="flex items-center gap-2">
          {scope === "all" && <span className="text-sm text-muted-foreground">ترتيب العملاء:</span>}
          <SortDropdown value={sortClients} onChange={handleClientSort} />
        </div>
      )}
    </div>
  );
}
