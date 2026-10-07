"use client";

import { useState } from "react";

import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";
import { siteNumberFormat } from "@/lib/site-number-format";
import { Input } from "@/components/ui/input";
import { fill } from "@/lib/i18n/fill";

import { useDebouncedSearch } from "../../../helpers/use-debounced-search";
import type { SchoolMatch, SchoolResult } from "../../helpers/types";

interface SchoolLookupLabels {
  title: string;
  note: string;
  label: string;
  placeholder: string;
  boys: string;
  girls: string;
  test: string;
  average: string;
  rank: string;
  up: string;
  down: string;
  same: string;
  searching: string;
  empty: string;
  error: string;
  hint: string;
}

const YEAR = new Intl.NumberFormat(SITE_LOCALE, { useGrouping: false });

/** A parent or student types a school's name and sees its average and national rank in each test. */
export function SchoolLookup({ labels: t }: { labels: SchoolLookupLabels }) {
  const [query, setQuery] = useState("");
  const state = useDebouncedSearch<{ results: SchoolMatch[] }>("/modonty/education/api/schools", query);

  return (
    <section aria-labelledby="school-lookup" className="rounded-lg bg-card p-5 ring-1 ring-border">
      <h2 id="school-lookup" className="text-lg font-bold">
        {t.title}
      </h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{t.note}</p>
      <label htmlFor="school-q" className="mt-4 block text-sm font-semibold">
        {t.label}
      </label>
      <Input
        id="school-q"
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
          <ul className="divide-y divide-border">
            {state.data.results.map((s) => (
              <li key={`${s.name}-${s.region}-${s.gender}`} className="py-3">
                <p className="text-sm font-bold leading-snug">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.region} · {s.gender === "M" ? t.boys : t.girls}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {s.results.map((r) => (
                    <ResultRow key={`${r.test}-${r.track}`} result={r} labels={t} />
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t.hint}</p>
    </section>
  );
}

function ResultRow({ result: r, labels: t }: { result: SchoolResult; labels: SchoolLookupLabels }) {
  // A lower rank number is better, so moving up means the number fell.
  const moved = r.previousRank === null ? null : r.previousRank - r.rank;
  return (
    <li className="rounded-md bg-muted/40 px-3 py-2 text-sm">
      <p className="flex flex-wrap items-baseline justify-between gap-x-3">
        <span className="font-semibold">{fill(t.test, { test: r.test, track: r.track, year: YEAR.format(r.year) })}</span>
        <span className="text-xs text-muted-foreground tabular-nums">{fill(t.average, { n: siteNumberFormat.format(r.average) })}</span>
      </p>
      <p className="mt-0.5 font-bold tabular-nums">{fill(t.rank, { rank: siteNumberFormat.format(r.rank), total: siteNumberFormat.format(r.outOf) })}</p>
      {moved !== null && (
        <p className={`text-xs font-semibold ${moved > 0 ? "text-primary" : moved < 0 ? "text-destructive" : "text-muted-foreground"}`}>
          {moved > 0 ? fill(t.up, { n: siteNumberFormat.format(moved) }) : moved < 0 ? fill(t.down, { n: siteNumberFormat.format(-moved) }) : t.same}
        </p>
      )}
    </li>
  );
}
