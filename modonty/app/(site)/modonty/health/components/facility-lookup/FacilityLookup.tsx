"use client";

import { fill } from "@/lib/i18n/fill";

import type { Facility } from "../../helpers/types";
import { LookupCard, type LookupLabels } from "../lookup-card/LookupCard";

export interface FacilityLookupLabels extends LookupLabels {
  cbahi: string;
  until: string;
  insurance: string;
  more: string;
}

// «معتمد» good news; a refusal, suspension or withdrawal must stand out.
const statusClass = (s = "") => (s === "معتمد" ? "text-primary" : /رفض|سحب|تعليق/.test(s) ? "text-destructive" : "text-foreground/80");

/** Is this hospital, clinic or pharmacy accredited — by سباهي, and for insurance by مجلس الضمان الصحي. */
export function FacilityLookup({ labels: t }: { labels: FacilityLookupLabels }) {
  return (
    <LookupCard<{ results: Facility[]; total: number }>
      id="facility-lookup"
      endpoint="/modonty/health/api/facilities"
      labels={t}
      renderRows={(data) => ({
        count: data.results.length,
        rows: (
          <>
            {data.results.map((f, i) => (
              <li key={`${f.source}-${f.name}-${f.city}-${i}`} className="py-2.5">
                <p className="text-sm font-bold leading-snug">{f.name}</p>
                <p className="text-xs text-muted-foreground">
                  {f.type} · {f.city || f.region}
                </p>
                {f.source === "cbahi" ? (
                  <p className={`mt-0.5 text-xs font-semibold ${statusClass(f.status)}`}>
                    {fill(t.cbahi, { status: f.status ?? "" })}
                    {f.until && f.status === "معتمد" ? ` · ${fill(t.until, { date: f.until })}` : ""}
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs font-semibold text-primary">{t.insurance}</p>
                )}
              </li>
            ))}
            {data.total > data.results.length && (
              <li className="py-2 text-xs text-muted-foreground">{fill(t.more, { n: String(data.total - data.results.length) })}</li>
            )}
          </>
        ),
      })}
    />
  );
}
