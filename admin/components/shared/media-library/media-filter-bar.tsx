"use client";

import { useTransition, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@modonty/shared/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchCombobox, type SearchOption } from "@/components/shared/search-combobox";

/** Writes one filter to the URL, back to page 1, inside a transition so the control can show it. */
function useFilterParam() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const update = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };
  return { searchParams, update, isPending };
}

// The picked toggle in the brand fill. The shared primitive paints «on» as bg-background on
// a bg-muted track — measured 1.04:1 against the track (26 Sep 2026), so which filter was on
// could not be seen; WCAG 1.4.11 asks 3:1 for a state indicator.
const ITEM = "text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-sm";

function Count({ n }: { n: number }) {
  return <span className="ms-1.5 rounded-full bg-foreground/10 px-1.5 text-xs font-semibold tabular-nums">{n}</span>;
}

/**
 * The «what kind of file» row on the section media pages (Clients › Media, Articles › Media).
 * Each toggle carries its count, so an empty kind shows «0» before a click; `extra` lets a page
 * add a badge to one toggle (the amber «2 pending» on Reels).
 */
export function MediaKindToggles({
  kinds,
  total,
  byKind,
  extra,
  issues,
}: {
  kinds: ReadonlyArray<{ value: string; label: string }>;
  total: number;
  byKind: Record<string, number>;
  extra?: Record<string, ReactNode>;
  /** Files with the warning triangle under the other filters; adds the «Issues» toggle. */
  issues?: number;
}) {
  const { searchParams, update, isPending } = useFilterParam();
  const kind = searchParams.get("kind") ?? "all";
  const issuesOn = searchParams.get("issues") === "1";

  return (
    <div className="flex items-center gap-2" aria-busy={isPending}>
      <ToggleGroup
        type="single"
        value={kind}
        onValueChange={(v) => { if (v) update("kind", v); }}
        disabled={isPending}
        aria-label="النوع"
        className="h-auto flex-wrap justify-start"
      >
        <ToggleGroupItem value="all" className={ITEM}>الكل<Count n={total} /></ToggleGroupItem>
        {kinds.map((k) => (
          <ToggleGroupItem key={k.value} value={k.value} className={ITEM}>
            {k.label}<Count n={byKind[k.value] ?? 0} />
            {extra?.[k.value]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {/* Its own switch, not one more kind: «logos with a problem» is logo AND issues. */}
      {issues !== undefined && (
        <button
          type="button"
          aria-pressed={issuesOn}
          onClick={() => update("issues", issuesOn ? null : "1")}
          disabled={isPending}
          title="صيغة أو نسبة أو حجم غلط — الملفات اللي عليها مثلث التحذير"
          className={
            "inline-flex h-9 items-center gap-1 rounded-md border px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 " +
            (issuesOn
              ? "border-amber-500 bg-amber-500 text-white"
              : "border-amber-500/50 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400")
          }
        >
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
          مشاكل<Count n={issues} />
        </button>
      )}
      {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label="يحدّث" />}
    </div>
  );
}

/** In use or not — a compact select for the toolbar row. */
export function MediaUsageSelect({ used, unused }: { used: number; unused: number }) {
  const { searchParams, update, isPending } = useFilterParam();
  return (
    <Select value={searchParams.get("used") ?? "all"} onValueChange={(v) => update("used", v)} disabled={isPending}>
      <SelectTrigger className="h-9 w-[140px] text-xs" aria-label="الاستخدام">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">كل الاستخدام</SelectItem>
        <SelectItem value="used">مستخدمة · {used}</SelectItem>
        <SelectItem value="unused">غير مستخدمة · {unused}</SelectItem>
      </SelectContent>
    </Select>
  );
}

/** A searchable picker bound to one URL param (clientId, articleId…), with a clear button. */
export function UrlSearchPicker({
  param,
  options,
  allLabel,
  searchPlaceholder,
  ariaLabel,
  className = "w-[260px]",
  clearsParams = [],
}: {
  param: string;
  options: SearchOption[];
  allLabel: string;
  searchPlaceholder: string;
  ariaLabel: string;
  className?: string;
  /** Params that no longer make sense after this one changes (picking a client drops the article). */
  clearsParams?: string[];
}) {
  const { searchParams, isPending } = useFilterParam();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const value = searchParams.get(param);

  const pick = (id: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set(param, id);
    else params.delete(param);
    for (const p of clearsParams) params.delete(p);
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  return (
    <div className="flex items-center gap-1.5">
      <SearchCombobox
        options={options}
        value={value}
        onChange={pick}
        allLabel={allLabel}
        searchPlaceholder={searchPlaceholder}
        ariaLabel={ariaLabel}
        busy={pending || isPending}
        className={className}
      />
      {value && (
        <button
          type="button"
          onClick={() => pick(null)}
          aria-label={`امسح ${ariaLabel}`}
          title={allLabel}
          className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
