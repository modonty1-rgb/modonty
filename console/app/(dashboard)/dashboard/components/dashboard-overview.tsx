import { Sparkles } from "lucide-react";

import { ar } from "@/lib/ar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getClientGooglePerformance } from "../helpers/get-client-google-performance";
import { getSiteActivity } from "../helpers/get-site-activity";
import { JourneyStrip } from "./journey-strip";
import { OverviewCharts } from "./overview-charts";

/**
 * The dashboard's answer to one question: «وش جاب لي محتواي؟» (Khalid, 30 Sep 2026). Four numbers
 * for the chosen period — Google showed you, Google sent you, people read you, people contacted
 * you — then the day-by-day picture, the pages behind it and the searches that found them.
 * Streams behind its own Suspense: Google can take a few seconds on a cold cache.
 */
export async function DashboardOverview({ clientId, days }: { clientId: string; days: number }) {
  const d = ar.dashboard;
  const [google, site] = await Promise.all([getClientGooglePerformance(clientId, days), getSiteActivity(clientId, days)]);

  // One series per day of the window, Google and modonty side by side (a day with no data is 0).
  const byDate = new Map<string, { impressions: number; clicks: number; views: number }>();
  for (let i = days - 1; i >= 0; i--) {
    byDate.set(new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10), { impressions: 0, clicks: 0, views: 0 });
  }
  for (const g of google?.daily ?? []) {
    const row = byDate.get(g.date);
    if (row) { row.impressions = g.impressions; row.clicks = g.clicks; }
  }
  for (const [date, n] of Object.entries(site.viewsByDay)) {
    const row = byDate.get(date);
    if (row) row.views = n;
  }
  const daily = [...byDate].map(([date, v]) => ({ date, ...v }));

  const g = google?.current;
  const gp = google?.previous;

  return (
    <section className="space-y-3">
      <p className="text-xs text-muted-foreground">{d.overviewSubtitle.replace("{days}", (days <= 10 ? d.periodDaysFew : d.periodDays).replace("{n}", String(days)))}</p>

      {/* What the team did for him this period — the page never lets him feel he pays for nothing. */}
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-muted/60 px-4 py-2.5 text-sm text-foreground">
        <Sparkles className="h-4 w-4 text-primary" aria-hidden />
        <span className="font-bold">شغلنا لك هالفترة:</span>
        <span>
          {site.published > 0 ? `نشرنا ${articlesAr(site.published)}` : "نجهّز مقالاتك القادمة"}
          {g && g.impressions > 0 ? ` · ظهرت في جوجل ${g.impressions.toLocaleString()} مرة` : ""}
        </span>
      </p>

      <JourneyStrip
        impressions={g ? { value: g.impressions, previous: gp?.impressions ?? null } : null}
        clicks={g ? { value: g.clicks, previous: gp?.clicks ?? null } : null}
        views={{ value: site.views, previous: site.viewsPrev }}
        contacts={{ value: site.contacts, previous: site.contactsPrev }}
      />

      <OverviewCharts daily={daily} topPages={google?.topPages ?? []} />

      {google && google.topQueries.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{d.googleTopQueries}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-wrap gap-2">
              {google.topQueries.map((q) => (
                <li key={q.query} className="rounded-full bg-muted px-3 py-1.5 text-sm text-foreground">
                  {q.query} <span className="tabular-nums text-muted-foreground">· {q.impressions.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

/** Arabic counting for «مقال»: مقالاً واحداً · مقالين · ٣–١٠ مقالات · ١١+ مقالاً. */
function articlesAr(n: number): string {
  if (n === 1) return "مقالاً واحداً";
  if (n === 2) return "مقالين";
  return n <= 10 ? `${n} مقالات` : `${n.toLocaleString()} مقالاً`;
}

export function DashboardOverviewSkeleton() {
  return (
    <section className="space-y-3" aria-hidden>
      <div className="h-4 w-72 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-[340px] animate-pulse rounded-xl bg-muted" />
    </section>
  );
}
