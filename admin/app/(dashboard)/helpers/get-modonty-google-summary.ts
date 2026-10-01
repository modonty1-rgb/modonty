import { unstable_cache } from "next/cache";

import { queryModontySearch, type SearchRow } from "@modonty/shared/lib/google/query-modonty-search";

export interface GoogleTotals {
  clicks: number;
  impressions: number;
  /** Percent, 0–100. */
  ctr: number;
  /** Impression-weighted average position; null with no impressions. */
  position: number | null;
}

export interface GoogleWindow {
  /** `0` = all the data Google keeps (about 16 months; for modonty from its first day in Search Console). */
  days: 7 | 28 | 90 | 0;
  start: string;
  end: string;
  current: GoogleTotals;
  /** null for «all time» — there is nothing before it. */
  previous: GoogleTotals | null;
  /** The page with the most clicks in the window, and its share of the window's clicks. */
  topPage: { path: string; clicks: number; share: number } | null;
}

export interface ModontyGoogleSummary {
  /** The last day Google has finalised — every window ends here. */
  lastFinalDay: string;
  windows: GoogleWindow[];
}

const WINDOWS = [7, 28, 90] as const;

const day = (d: Date) => d.toISOString().slice(0, 10);
const shift = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return day(d);
};

function totalsOf(rows: SearchRow[]): GoogleTotals {
  const clicks = rows.reduce((s, r) => s + r.clicks, 0);
  const impressions = rows.reduce((s, r) => s + r.impressions, 0);
  const weighted = rows.reduce((s, r) => s + r.position * r.impressions, 0);
  return { clicks, impressions, ctr: impressions ? (clicks / impressions) * 100 : 0, position: impressions ? weighted / impressions : null };
}

const pathOf = (url: string) => {
  try {
    return decodeURIComponent(new URL(url).pathname);
  } catch {
    return url;
  }
};

/**
 * modonty.com in Google Search for the dashboard — 7, 28 and 90 days, each against the same
 * length just before it (Khalid, 1 Oct 2026: «الإمبريشن والسي تي آر والمعلومات المهمة بس»).
 *
 * **Every window ends on Google's last finalised day, not today.** The shared query reads
 * `final` data, which lags two to three days; a «7 days» ending today would hold only four or
 * five days and look like a drop every time (measured 1 Oct 2026: last final day 28 Sep).
 *
 * Same property and key as the console dashboard and KPI › Content.
 * Any failure returns null and the card says so instead of breaking the dashboard — caught
 * OUTSIDE the cache, so one failed call is not remembered as «no data» for six hours.
 */
export async function getModontyGoogleSummary(): Promise<ModontyGoogleSummary | null> {
  try {
    return await loadSummary();
  } catch (error) {
    console.error("[getModontyGoogleSummary]", error);
    return null;
  }
}

/**
 * One request at a time, each tried twice. Measured 1 Oct 2026 on the office line: 3 parallel
 * Search Console calls all returned 200, 10 parallel returned 5 connect timeouts — and the card
 * failed whole on any one of them.
 */
async function query(body: { startDate: string; endDate: string; dimensions: string[] }): Promise<SearchRow[]> {
  try {
    return await queryModontySearch(body);
  } catch {
    return queryModontySearch(body);
  }
}

const loadSummary = unstable_cache(
  async (): Promise<ModontyGoogleSummary | null> => {
    const today = day(new Date());
    /**
     * ONE daily series covers every window and the one before it — and «all time» (Search
     * Console keeps about 16 months, so 500 days asks for everything it has). The totals are
     * sums of days, and the newest day in it is Google's last finalised day.
     * Position is impression-weighted across days, the way Search Console averages it.
     */
    const daily = await query({ startDate: shift(today, -500), endDate: today, dimensions: ["date"] });
    const dates = daily.map((r) => r.keys[0]).sort();
    const firstDay = dates[0];
    const lastFinalDay = dates[dates.length - 1];
    if (!lastFinalDay) return null;
    const between = (from: string, to: string) => totalsOf(daily.filter((r) => r.keys[0] >= from && r.keys[0] <= to));

    const windows: GoogleWindow[] = [];
    for (const days of [...WINDOWS, 0 as const]) {
      const start = days ? shift(lastFinalDay, -(days - 1)) : firstDay;
      const prevEnd = shift(start, -1);
      const prevStart = shift(prevEnd, -(days - 1));
      const cur = between(start, lastFinalDay);
      const pages = await query({ startDate: start, endDate: lastFinalDay, dimensions: ["page"] });
      const top = pages.reduce<SearchRow | null>((best, r) => (!best || r.clicks > best.clicks ? r : best), null);
      windows.push({
        days,
        start,
        end: lastFinalDay,
        current: cur,
        previous: days ? between(prevStart, prevEnd) : null,
        topPage: top && top.clicks > 0 ? { path: pathOf(top.keys[0]), clicks: top.clicks, share: cur.clicks ? (top.clicks / cur.clicks) * 100 : 0 } : null,
      });
    }
    return { lastFinalDay, windows };
  },
  // v2: «all time» added — the key changes so a cached v1 (three windows) is not served.
  ["modonty-google-summary-v2"],
  // Search Console moves once a day — same lifetime and tag as KPI › Content.
  { revalidate: 6 * 60 * 60, tags: ["gsc-kpi"] },
);
