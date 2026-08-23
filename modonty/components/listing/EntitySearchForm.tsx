"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconSearch, IconClose, IconLoading } from "@/lib/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EntitySearchFormProps {
  /** Route to push to, e.g. "/tags" or "/categories". */
  basePath: string;
  placeholder: string;
  defaultValue?: string;
  /**
   * Search as the visitor TYPES (380ms after the last keystroke), not only on Enter.
   * Born on `/articles` (Khalid, 23 Aug: he typed «الظهر», the counts above the list never
   * moved, and nothing on the screen said why — the form was waiting for an Enter nobody
   * pressed). Live mode uses `replace`, not `push`: five keystrokes are one search, not
   * five back-button stops.
   */
  live?: boolean;
}

export function EntitySearchForm({ basePath, placeholder, defaultValue = "", live = false }: EntitySearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(defaultValue);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applySearch = (value: string, viaTyping = false) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("search", value);
    else params.delete("search");
    const target = `${basePath}?${params.toString()}`;
    startTransition(() => (viaTyping ? router.replace(target) : router.push(target)));
  };

  const handleChange = (value: string) => {
    setSearchValue(value);
    if (!live) return;
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => applySearch(value.trim(), true), 380);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (debounce.current) clearTimeout(debounce.current);
        applySearch(searchValue.trim());
      }}
      className="relative flex-1"
    >
      <div className="relative">
        {/* Magnifier = leading (start / right in RTL) · clear = trailing (end / left).
            While results are on their way the magnifier becomes a spinner — the field is
            where the reader is looking, so that is where the answer-is-coming sign goes. */}
        {isPending ? (
          <IconLoading className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden />
        ) : (
          <IconSearch className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        )}
        <Input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => handleChange(e.target.value)}
          className="h-12 rounded-xl ps-10 pe-10"
          // Live mode NEVER locks the input — freezing the keyboard mid-word to show a
          // pending state is the opposite of a fast search.
          disabled={!live && isPending}
        />
        {searchValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="مسح البحث"
            onClick={() => {
              if (debounce.current) clearTimeout(debounce.current);
              setSearchValue("");
              applySearch("");
            }}
            className="absolute end-1.5 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full p-0 text-muted-foreground hover:text-foreground"
            disabled={!live && isPending}
          >
            <IconClose className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  );
}
