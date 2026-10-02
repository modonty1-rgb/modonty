import type { CWVRating } from "@/lib/seo/pagespeed";
import type { CruxPeriod, CwvKey, CwvValue } from "@/lib/seo/crux-history";
import { cn } from "@/lib/utils";

import { getSpeedKpis, SITE_ORIGIN } from "./helpers/get-speed-kpis";

export const metadata = { title: "Speed KPI" };

const METRICS: { key: CwvKey; label: string; limit: string }[] = [
  { key: "lcp", label: "LCP — main content shows", limit: "good ≤ 2.5 s" },
  { key: "inp", label: "INP — reacts to a tap", limit: "good ≤ 200 ms" },
  { key: "cls", label: "CLS — layout stays still", limit: "good ≤ 0.1" },
];

const RATING_TEXT: Record<CWVRating, string> = {
  good: "text-emerald-700",
  "needs-improvement": "text-amber-700",
  poor: "text-red-700",
};
const RATING_BG: Record<CWVRating, string> = {
  good: "border-emerald-200 bg-emerald-50",
  "needs-improvement": "border-amber-200 bg-amber-50",
  poor: "border-red-200 bg-red-50",
};
const RATING_LABEL: Record<CWVRating, string> = { good: "Good", "needs-improvement": "Needs work", poor: "Poor" };

function format(key: CwvKey, v: CwvValue): string {
  if (key === "lcp") return `${(v.p75 / 1000).toFixed(1)} s`;
  if (key === "inp") return `${Math.round(v.p75)} ms`;
  return v.p75.toFixed(2);
}

function Cell({ metric, period }: { metric: CwvKey; period: CruxPeriod }) {
  const v = period[metric];
  if (!v) return <td className="px-3 py-2 text-muted-foreground">—</td>;
  return <td className={cn("px-3 py-2 font-medium tabular-nums", RATING_TEXT[v.rating])}>{format(metric, v)}</td>;
}

/**
 * **KPI › Speed** (plan ج٩, 2 Oct 2026) — how fast modonty.com is for its real visitors, from
 * Google's Chrome UX Report: the same field data Search Console's Core Web Vitals report uses.
 */
export default async function SpeedKpiPage() {
  let data: Awaited<ReturnType<typeof getSpeedKpis>> | null = null;
  try {
    data = await getSpeedKpis();
  } catch (error) {
    console.error("[SpeedKpiPage]", error);
  }

  return (
    <div className="space-y-5 px-4 pb-6 sm:px-5">
      <header className="pt-1">
        <h1 className="text-xl font-semibold">Speed KPI</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Real Chrome visitors to {SITE_ORIGIN.replace("https://", "")} (Chrome UX Report) · 75th percentile — the number
          Google ranks by · each figure covers 28 days · Google updates it every Monday
        </p>
      </header>

      {!data ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Couldn&apos;t reach the Chrome UX Report right now — try again in a minute.
        </p>
      ) : (
        <>
          {data.devices.map((d) => (
            <section key={d.device} className="space-y-3 rounded-xl border bg-card p-4">
              <h2 className="text-base font-semibold">
                {d.device === "PHONE" ? "Phone" : "Desktop"}
                {d.latest && <span className="ms-2 text-xs font-normal text-muted-foreground">28 days to {d.latest.end}</span>}
              </h2>

              {!d.latest ? (
                <p className="text-sm text-muted-foreground">Google has no data for this device yet — too few Chrome visitors.</p>
              ) : (
                <>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {METRICS.map((m) => {
                      const v = d.latest?.[m.key];
                      return (
                        <div key={m.key} className={cn("rounded-lg border p-3", v ? RATING_BG[v.rating] : "bg-muted/40")}>
                          <p className="text-xs text-muted-foreground">{m.label}</p>
                          {v ? (
                            <>
                              <p className={cn("mt-1 text-2xl font-semibold tabular-nums", RATING_TEXT[v.rating])}>
                                {format(m.key, v)} <span className="text-sm font-medium">{RATING_LABEL[v.rating]}</span>
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {Math.round(v.goodShare)}% of visits good · {m.limit}
                              </p>
                            </>
                          ) : (
                            <p className="mt-1 text-sm text-muted-foreground">No data</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <caption className="pb-1 text-start text-xs text-muted-foreground">By month (the month&apos;s last 28-day window, newest first) · months Google skipped for too few visitors are left out</caption>
                      <thead className="border-b text-xs text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2 text-start font-medium">Month ending</th>
                          <th className="px-3 py-2 text-start font-medium">LCP</th>
                          <th className="px-3 py-2 text-start font-medium">INP</th>
                          <th className="px-3 py-2 text-start font-medium">CLS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {d.months.map((p) => (
                          <tr key={p.end}>
                            <td className="px-3 py-2 tabular-nums text-muted-foreground">{p.end}</td>
                            <Cell metric="lcp" period={p} />
                            <Cell metric="inp" period={p} />
                            <Cell metric="cls" period={p} />
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>
          ))}

          <section className="space-y-2 rounded-xl border bg-card p-4">
            <h2 className="text-base font-semibold">By page · Phone</h2>
            <p className="text-xs text-muted-foreground">
              Google reports a single page only once it has enough Chrome visitors of its own; until then the site figure
              above covers it. Rows fill in by themselves as traffic grows.
            </p>
            <table className="w-full text-sm">
              <thead className="border-b text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-start font-medium">Page</th>
                  <th className="px-3 py-2 text-start font-medium">LCP</th>
                  <th className="px-3 py-2 text-start font-medium">INP</th>
                  <th className="px-3 py-2 text-start font-medium">CLS</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.pages.map((p) => (
                  <tr key={p.path}>
                    <td className="px-3 py-2">
                      {p.label} <span className="text-xs text-muted-foreground" dir="ltr">{p.path}</span>
                    </td>
                    {p.latest ? (
                      <>
                        <Cell metric="lcp" period={p.latest} />
                        <Cell metric="inp" period={p.latest} />
                        <Cell metric="cls" period={p.latest} />
                      </>
                    ) : (
                      <td colSpan={3} className="px-3 py-2 text-xs text-muted-foreground">Not enough visitors yet</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}
