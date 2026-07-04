"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconSearch, IconClose } from "@/lib/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EntitySearchFormProps {
  /** Route to push to, e.g. "/tags" or "/categories". */
  basePath: string;
  placeholder: string;
  defaultValue?: string;
}

export function EntitySearchForm({ basePath, placeholder, defaultValue = "" }: EntitySearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(defaultValue);

  const applySearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("search", value);
    else params.delete("search");
    startTransition(() => router.push(`${basePath}?${params.toString()}`));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        applySearch(searchValue);
      }}
      className="relative flex-1"
    >
      <div className="relative">
        {/* Magnifier = leading (start / right in RTL) · clear = trailing (end / left) */}
        <IconSearch className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="h-12 rounded-xl ps-10 pe-10"
          disabled={isPending}
        />
        {searchValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="مسح البحث"
            onClick={() => {
              setSearchValue("");
              applySearch("");
            }}
            className="absolute end-1.5 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full p-0 text-muted-foreground hover:text-foreground"
            disabled={isPending}
          >
            <IconClose className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  );
}
