"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconSearch, IconClose } from "@/lib/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SearchScope = "all" | "articles" | "clients";

function scopeFromParam(type: string | null): SearchScope {
  return type === "clients" ? "clients" : type === "articles" ? "articles" : "all";
}

interface SearchInputProps {
  defaultValue?: string;
  defaultScope?: SearchScope;
  autoFocus?: boolean;
  /** When provided, parent controls navigation and pending state (e.g. to show results skeleton). */
  onNavigate?: (url: string) => void;
  isPending?: boolean;
}

export function SearchInput({
  defaultValue = "",
  defaultScope = "all",
  autoFocus,
  onNavigate,
  isPending: isPendingProp,
}: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [internalPending, startTransition] = useTransition();
  const isPending = onNavigate != null ? isPendingProp ?? false : internalPending;
  const [searchValue, setSearchValue] = useState(defaultValue);
  const [scope, setScope] = useState<SearchScope>(defaultScope);
  const [minCharsError, setMinCharsError] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    setSearchValue(q);
    setScope(scopeFromParam(searchParams.get("type")));
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMinCharsError(false);
    const trimmed = searchValue.trim();
    if (trimmed.length > 0 && trimmed.length < 2) {
      setMinCharsError(true);
      return;
    }
    const base = trimmed
      ? `/search?q=${encodeURIComponent(trimmed)}${scope !== "all" ? `&type=${scope}` : ""}`
      : "/search";
    const sortArticles = searchParams.get("sort_articles");
    const sortClients = searchParams.get("sort_clients");
    const parts = [sortArticles && `sort_articles=${sortArticles}`, sortClients && `sort_clients=${sortClients}`].filter(Boolean);
    const url = parts.length ? `${base}${base.includes("?") ? "&" : "?"}${parts.join("&")}` : base;
    if (onNavigate) {
      onNavigate(url);
    } else {
      startTransition(() => router.replace(url));
    }
  };

  const handleClear = () => {
    setSearchValue("");
    setMinCharsError(false);
    const url = "/search";
    if (onNavigate) {
      onNavigate(url);
    } else {
      startTransition(() => router.replace(url));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="relative flex flex-col gap-3"
      dir="rtl"
    >
      <fieldset className="flex flex-col gap-2 max-w-md" aria-label="نطاق البحث">
        <legend className="text-sm font-medium text-foreground">نطاق البحث</legend>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="searchScope"
              value="all"
              checked={scope === "all"}
              onChange={() => setScope("all")}
              className="rounded-full border-border text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            />
            <span className="text-sm text-foreground">الكل</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="searchScope"
              value="articles"
              checked={scope === "articles"}
              onChange={() => setScope("articles")}
              className="rounded-full border-border text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            />
            <span className="text-sm text-foreground">المقالات</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="searchScope"
              value="clients"
              checked={scope === "clients"}
              onChange={() => setScope("clients")}
              className="rounded-full border-border text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            />
            <span className="text-sm text-foreground">العملاء</span>
          </label>
        </div>
      </fieldset>
      <div className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <IconSearch
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="ابحث في المقالات..."
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setMinCharsError(false);
            }}
            className="pr-10 pl-10 min-w-[25ch] cursor-text focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 search-input-no-native-cancel"
            disabled={isPending}
            autoFocus={autoFocus}
            aria-label="بحث المقالات"
          />
          {searchValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute left-1 top-1/2 -translate-y-1/2 h-9 w-9 p-0 min-w-[44px] min-h-[44px]"
              disabled={isPending}
              aria-label="مسح البحث"
            >
              <IconClose className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button
          type="submit"
          variant="default"
          className="min-w-[44px] min-h-[44px] shrink-0"
          disabled={isPending}
        >
          بحث
        </Button>
      </div>
      {minCharsError && (
        <p className="text-sm text-destructive">اكتب حرفين على الأقل</p>
      )}
      {isPending && (
        <div className="absolute left-0 right-0 -bottom-1 h-0.5 bg-primary/20 overflow-hidden max-w-md">
          <div className="h-full bg-primary w-1/3 animate-pulse" />
        </div>
      )}
    </form>
  );
}
