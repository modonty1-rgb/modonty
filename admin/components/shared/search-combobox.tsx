"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface SearchOption {
  id: string;
  name: string;
  /** Optional second line (e.g. an article's client). */
  hint?: string;
  /** Optional number at the end of the row (e.g. how many files). Rows with 0 are dimmed. */
  count?: number;
}

interface SearchComboboxProps {
  options: SearchOption[];
  value: string | null;
  onChange: (id: string | null) => void;
  /** Label of the «everything» row (value null). Omit for pickers that need one choice. */
  allLabel?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  ariaLabel: string;
  disabled?: boolean;
  busy?: boolean;
  className?: string;
  id?: string;
}

/**
 * A searchable picker for long lists — clients, articles (Khalid, 26 Sep 2026: «سيرش في الدروب
 * داون… كومبوننت ريوزبل»). Filters as you type on the name and the hint line.
 */
export function SearchCombobox({
  options,
  value,
  onChange,
  allLabel,
  placeholder = "Choose…",
  searchPlaceholder = "Search…",
  ariaLabel,
  disabled,
  busy,
  className,
  id,
}: SearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const selected = options.find((o) => o.id === value) ?? null;

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((o) => o.name.toLowerCase().includes(needle) || o.hint?.toLowerCase().includes(needle));
  }, [options, q]);

  const pick = (next: string | null) => {
    setOpen(false);
    setQ("");
    onChange(next);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          disabled={disabled || busy}
          className={cn(
            "inline-flex h-10 items-center justify-between gap-2 rounded-md border bg-background px-3 text-sm hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
            className,
          )}
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected ? selected.name : allLabel ?? placeholder}
          </span>
          {busy ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-60" />}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[340px] p-0">
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <ul role="listbox" aria-label={ariaLabel} className="max-h-72 overflow-y-auto p-1">
          {allLabel && !q && (
            <li>
              <button type="button" role="option" aria-selected={!selected} onClick={() => pick(null)} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted">
                <Check className={cn("h-4 w-4", selected ? "opacity-0" : "opacity-100")} />
                {allLabel}
              </button>
            </li>
          )}
          {shown.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                role="option"
                aria-selected={o.id === value}
                onClick={() => pick(o.id)}
                className={cn("flex w-full items-center gap-2 rounded px-2 py-1.5 text-start text-sm hover:bg-muted", o.count === 0 && "text-muted-foreground")}
              >
                <Check className={cn("h-4 w-4 shrink-0", o.id === value ? "opacity-100" : "opacity-0")} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{o.name}</span>
                  {o.hint && <span className="block truncate text-[11px] text-muted-foreground">{o.hint}</span>}
                </span>
                {o.count !== undefined && <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{o.count}</span>}
              </button>
            </li>
          ))}
          {shown.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted-foreground">No match for «{q}»</li>}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
