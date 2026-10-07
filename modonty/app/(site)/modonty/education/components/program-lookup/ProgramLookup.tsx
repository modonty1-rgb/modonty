"use client";

import { useState } from "react";

import { siteNumberFormat } from "@/lib/site-number-format";
import { Input } from "@/components/ui/input";
import { fill } from "@/lib/i18n/fill";

import { useDebouncedSearch } from "../../../helpers/use-debounced-search";
import type { AccreditationStatus, ProgramMatch } from "../../helpers/types";

interface ProgramLookupLabels {
  title: string;
  note: string;
  label: string;
  placeholder: string;
  statuses: Record<AccreditationStatus, string>;
  more: string;
  searching: string;
  empty: string;
  error: string;
  hint: string;
}

const STATUS_CLASS: Record<AccreditationStatus, string> = {
  full: "text-primary",
  conditional: "text-foreground/80",
  pending: "text-foreground/80",
  none: "text-muted-foreground",
  expired: "text-destructive",
  rejected: "text-destructive",
};

/** A student types a programme or a university and sees whether ETEC has accredited it. */
export function ProgramLookup({ labels: t }: { labels: ProgramLookupLabels }) {
  const [query, setQuery] = useState("");
  const state = useDebouncedSearch<{ total: number; results: ProgramMatch[] }>("/modonty/education/api/programs", query);

  return (
    <section aria-labelledby="program-lookup" className="rounded-lg bg-card p-5 ring-1 ring-border">
      <h2 id="program-lookup" className="text-lg font-bold">
        {t.title}
      </h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{t.note}</p>
      <label htmlFor="program-q" className="mt-4 block text-sm font-semibold">
        {t.label}
      </label>
      <Input
        id="program-q"
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
        {state.kind === "done" && !state.data.results.length && <p className="text-sm text-muted-foreground">{t.empty}</p>}
        {state.kind === "done" && state.data.results.length > 0 && (
          <>
            <ul className="divide-y divide-border">
              {state.data.results.map((p) => (
                <li key={`${p.institution}-${p.campus}-${p.degree}-${p.program}`} className="py-2.5">
                  <p className="text-sm font-bold leading-snug">{p.program}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.institution} · {p.city} · {p.degree}
                  </p>
                  <p className={`mt-0.5 text-xs font-semibold ${STATUS_CLASS[p.status]}`}>{t.statuses[p.status]}</p>
                </li>
              ))}
            </ul>
            {state.data.total > state.data.results.length && (
              <p className="mt-2 text-xs text-muted-foreground">{fill(t.more, { n: siteNumberFormat.format(state.data.total - state.data.results.length) })}</p>
            )}
          </>
        )}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t.hint}</p>
    </section>
  );
}
