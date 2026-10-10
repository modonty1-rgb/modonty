"use client";

import { fill } from "@/lib/i18n/fill";

import type { Drug } from "../../helpers/types";
import { LookupCard, type LookupLabels } from "../lookup-card/LookupCard";

export interface DrugLookupLabels extends LookupLabels {
  otc: string;
  prescription: string;
  more: string;
}

const DISPENSING_CLASS: Record<Drug["dispensing"], string> = { otc: "text-primary", prescription: "text-destructive", other: "text-muted-foreground" };

/** Is it registered, and does it need a prescription — the authority's open-data rows as listed. */
export function DrugLookup({ labels: t }: { labels: DrugLookupLabels }) {
  return (
    <LookupCard<{ results: Drug[]; total: number }>
      id="drug-lookup"
      endpoint="/modonty/health/api/drugs"
      labels={t}
      renderRows={(data) => ({
        count: data.results.length,
        rows: (
          <>
            {data.results.map((d, i) => (
              <li key={`${d.trade}-${d.manufacturer}-${i}`} className="py-2.5">
                <bdi dir="ltr" className="block text-start text-sm font-bold leading-snug">
                  {d.trade}
                </bdi>
                <bdi dir="ltr" className="block text-start text-xs text-muted-foreground">
                  {d.scientific}
                </bdi>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs">
                  {d.dispensing !== "other" && (
                    <span className={`font-bold ${DISPENSING_CLASS[d.dispensing]}`}>{d.dispensing === "otc" ? t.otc : t.prescription}</span>
                  )}
                  <bdi dir="ltr" className="text-muted-foreground">
                    {d.manufacturer}
                    {d.country && ` · ${d.country}`}
                  </bdi>
                </p>
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
