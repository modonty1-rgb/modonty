"use client";

import { useCallback, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export type DateRange = "today" | "7d" | "28d" | "90d";

export const DATE_RANGE_DAYS: Record<DateRange, number> = {
  today: 1,
  "7d": 7,
  "28d": 28,
  "90d": 90,
};

export const DEFAULT_RANGE: DateRange = "7d";

const OPTIONS: { value: DateRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "28d", label: "28 days" },
  { value: "90d", label: "90 days" },
];

export function parseRange(value: string | null | undefined): DateRange {
  if (value === "today" || value === "7d" || value === "28d" || value === "90d") {
    return value;
  }
  return DEFAULT_RANGE;
}

export function DateRangeSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const current = parseRange(searchParams.get("range"));

  const handleChange = useCallback(
    (next: DateRange) => {
      if (next === current) return;
      const params = new URLSearchParams(searchParams.toString());
      if (next === DEFAULT_RANGE) {
        params.delete("range");
      } else {
        params.set("range", next);
      }
      const query = params.toString();
      startTransition(() => {
        router.push(query ? `${pathname}?${query}` : pathname);
      });
    },
    [current, pathname, router, searchParams],
  );

  return (
    <div
      role="tablist"
      aria-label="Select date range"
      className={`inline-flex items-center gap-0.5 bg-muted rounded-lg p-1 text-xs ${pending ? "opacity-70" : ""}`}
    >
      {OPTIONS.map((opt) => {
        const active = opt.value === current;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => handleChange(opt.value)}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
