"use client";

import { useState, type ReactNode } from "react";

import { Input } from "@/components/ui/input";

import { useDebouncedSearch } from "../../../helpers/use-debounced-search";

export interface LookupLabels {
  title: string;
  note: string;
  label: string;
  placeholder: string;
  hint: string;
  searching: string;
  empty: string;
  error: string;
}

/**
 * The frame the page's lookups share: the box and the waiting and failing states — each lookup
 * draws only its own rows.
 */
export function LookupCard<T>({
  id,
  endpoint,
  labels: t,
  renderRows,
}: {
  id: string;
  endpoint: string;
  labels: LookupLabels;
  renderRows: (data: T) => { rows: ReactNode; count: number };
}) {
  const [query, setQuery] = useState("");
  const state = useDebouncedSearch<T>(endpoint, query);
  const view = state.kind === "done" ? renderRows(state.data) : null;

  return (
    <section aria-labelledby={id} className="rounded-lg bg-card p-5 ring-1 ring-border">
      <h2 id={id} className="text-lg font-bold">
        {t.title}
      </h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{t.note}</p>
      <label htmlFor={`${id}-q`} className="mt-4 block text-sm font-bold">
        {t.label}
      </label>
      <Input
        id={`${id}-q`}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.placeholder}
        autoComplete="off"
        className="mt-1.5 h-11 text-base"
      />
      <div aria-live="polite" className="mt-4">
        {state.kind === "loading" && <p className="text-sm text-muted-foreground">{t.searching}</p>}
        {state.kind === "error" && <p className="text-sm text-destructive">{t.error}</p>}
        {view && view.count === 0 && <p className="text-sm text-muted-foreground">{t.empty}</p>}
        {view && view.count > 0 && <ul className="divide-y divide-border">{view.rows}</ul>}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t.hint}</p>
    </section>
  );
}
