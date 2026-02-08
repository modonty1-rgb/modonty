"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchInputProps {
  defaultValue?: string;
  autoFocus?: boolean;
}

export function SearchInput({ defaultValue = "", autoFocus }: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(defaultValue);
  const [minCharsError, setMinCharsError] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    setSearchValue(q);
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMinCharsError(false);
    const trimmed = searchValue.trim();
    if (trimmed.length > 0 && trimmed.length < 2) {
      setMinCharsError(true);
      return;
    }
    startTransition(() => {
      router.replace(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
    });
  };

  const handleClear = () => {
    setSearchValue("");
    setMinCharsError(false);
    startTransition(() => {
      router.replace("/search");
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="relative flex flex-col gap-1"
      dir="rtl"
    >
      <div className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search
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
            className="pr-10 pl-10 min-w-[25ch] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
              <X className="h-4 w-4" />
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
