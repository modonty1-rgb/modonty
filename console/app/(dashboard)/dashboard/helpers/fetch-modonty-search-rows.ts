import { queryModontySearch, type SearchRow } from "@modonty/shared/lib/google/query-modonty-search";

export type { SearchRow };

interface ModontySearchRows {
  /** The chosen window, by page. */
  current: SearchRow[];
  /** The same length just before it, by page — for the trend. */
  previous: SearchRow[];
  /** The chosen window, by page + search term. */
  queries: SearchRow[];
  /** The chosen window, by page + day — the chart's time series. */
  daily: SearchRow[];
  range: { start: string; end: string };
}

const day = (d: Date) => d.toISOString().slice(0, 10);

/**
 * The whole of modonty.com in Google Search — the rows each client's dashboard filters down to
 * its own URLs (get-client-google-performance.ts).
 *
 * Every partner's page and article lives on modonty.com, so ONE property holds all of them
 * (Khalid, 30 Sep 2026: «كلنا كله ملموم في مدونتي في السيرش كونسل تبع مدونتي»). Not cached here:
 * the page+query rows can run to tens of thousands and would outgrow a cache entry — the caller
 * caches each client's small computed result instead. Same key the admin and modonty's footer read.
 * Any failure (key, quota, network) returns null and the section says so instead of breaking.
 */
export async function fetchModontySearchRows(days: number): Promise<ModontySearchRows | null> {
  try {
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - days);
    const prevEnd = new Date(start);
    prevEnd.setDate(start.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevEnd.getDate() - days);

    const [current, previous, queries, daily] = await Promise.all([
      queryModontySearch({ startDate: day(start), endDate: day(end), dimensions: ["page"] }),
      queryModontySearch({ startDate: day(prevStart), endDate: day(prevEnd), dimensions: ["page"] }),
      queryModontySearch({ startDate: day(start), endDate: day(end), dimensions: ["page", "query"] }),
      queryModontySearch({ startDate: day(start), endDate: day(end), dimensions: ["page", "date"] }),
    ]);
    return { current, previous, queries, daily, range: { start: day(start), end: day(end) } };
  } catch (error) {
    console.error("[fetchModontySearchRows]", error);
    return null;
  }
}
