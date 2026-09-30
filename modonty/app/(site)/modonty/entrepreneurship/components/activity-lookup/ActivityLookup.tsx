"use client";

import { useState } from "react";

import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";
import { Input } from "@/components/ui/input";
import { fill } from "@/lib/i18n/fill";

import { useDebouncedSearch } from "../../../helpers/use-debounced-search";
import type { ActivitySearch, CompetitionLevel } from "../../helpers/types";

export interface ActivityLookupLabels {
  title: string;
  note: string;
  label: string;
  placeholder: string;
  examplesLabel: string;
  examples: string[];
  registrations: string;
  rank: string;
  levels: Record<CompetitionLevel, string>;
  searching: string;
  empty: string;
  error: string;
  hint: string;
}

const N = new Intl.NumberFormat(SITE_LOCALE);
const LEVEL_CLASS: Record<CompetitionLevel, string> = {
  busy: "text-destructive",
  medium: "text-foreground/80",
  quiet: "text-primary",
};

/**
 * «كم منافس في نشاطك؟» — the reader types an activity and sees how many commercial registrations
 * the ministry counts for it, and where that sits among all activities. Searched on the server
 * (`../../api`) so the full list never reaches the phone.
 */
export function ActivityLookup({ labels: t }: { labels: ActivityLookupLabels }) {
  const [query, setQuery] = useState("");
  const state = useDebouncedSearch<ActivitySearch>("/modonty/entrepreneurship/api", query);

  return (
    <section aria-labelledby="activity-lookup" className="rounded-lg bg-card p-5 ring-1 ring-border">
      <h2 id="activity-lookup" className="text-lg font-bold">
        {t.title}
      </h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{t.note}</p>

      <label htmlFor="activity-q" className="mt-4 block text-sm font-semibold">
        {t.label}
      </label>
      <Input
        id="activity-q"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.placeholder}
        autoComplete="off"
        className="mt-1.5 h-11 text-base"
      />
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-muted-foreground">{t.examplesLabel}</span>
        {t.examples.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setQuery(ex)}
            className="rounded-full bg-muted px-2.5 py-1 font-medium hover:bg-muted/70 max-md:min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {ex}
          </button>
        ))}
      </div>

      <div aria-live="polite" className="mt-4">
        {state.kind === "loading" && <p className="text-sm text-muted-foreground">{t.searching}</p>}
        {state.kind === "error" && <p className="text-sm text-destructive">{t.error}</p>}
        {state.kind === "done" && !state.data.results.length && <p className="text-sm text-muted-foreground">{t.empty}</p>}
        {state.kind === "done" && state.data.results.length > 0 && (
          <ul className="divide-y divide-border">
            {state.data.results.map((a) => (
              <li key={a.code} className="py-3">
                <p className="text-sm font-bold leading-snug">{a.name}</p>
                <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-sm">
                  <span className="text-base font-bold tabular-nums">{fill(t.registrations, { n: N.format(a.count) })}</span>
                  <span className="text-xs text-muted-foreground">{fill(t.rank, { rank: N.format(a.rank), total: N.format(state.data.total) })}</span>
                </p>
                <p className={`mt-0.5 text-xs font-semibold ${LEVEL_CLASS[a.level]}`}>{t.levels[a.level]}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t.hint}</p>
    </section>
  );
}
