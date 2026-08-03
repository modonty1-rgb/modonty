/**
 * Bing Webmaster Tools API client.
 * Docs: https://learn.microsoft.com/en-us/bingwebmaster/
 *
 * Auth: API key as ?apikey= query parameter.
 * Same key as IndexNow (Bing Webmaster Settings → API access → Generate Key).
 *
 * Endpoints used (all GET with JSON response):
 *   /GetQueryStats         — top queries (last ~6 months window per Bing's API)
 *   /GetPageStats          — top pages
 *   /GetRankAndTrafficStats— overall clicks/impressions trends
 *   /GetCrawlStats         — Bingbot crawl activity
 *   /GetUrlInfo            — index status for a specific URL
 */

const BASE = "https://ssl.bing.com/webmaster/api.svc/json";

async function getCreds() {
  const apikey = process.env.INDEXNOW_KEY;
  if (!apikey) throw new Error("INDEXNOW_KEY env var not set");
  const { loadSiteUrl } = await import("@/lib/seo/site-url");
  const siteUrl = await loadSiteUrl();
  return { apikey, siteUrl };
}

interface BingResponse<T> {
  d?: T;
}

async function bingGet<T>(endpoint: string): Promise<T> {
  const { apikey, siteUrl } = await getCreds();
  const url = `${BASE}/${endpoint}?siteUrl=${encodeURIComponent(siteUrl)}&apikey=${apikey}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Bing API ${endpoint}: HTTP ${res.status} ${text.slice(0, 150)}`);
  }
  const json = (await res.json()) as BingResponse<T>;
  if (json.d === undefined) {
    throw new Error(`Bing API ${endpoint}: unexpected response shape`);
  }
  return json.d;
}

// Verified against the live API 2026-07-30 (149 page rows / 271 query rows):
//   • BOTH endpoints return `__type: "QueryStats:#…"` — GetPageStats reuses the
//     QueryStats DTO, so the PAGE URL arrives in `Query`, and `Page` never exists.
//     Reading `.Page` threw "Cannot read properties of undefined (reading 'replace')".
//   • Rows are PER-DAY, not totals (149 rows → 57 distinct URLs; one URL appeared
//     10 times). Sorting raw rows ranks single days, so a top-10 table repeated the
//     same URL. Always aggregate through `aggregateBingStats` before ranking.
//   • `AvgClickPosition: -1` is Bing's "no clicks" sentinel, not a position.
export interface BingQueryStat {
  Query?: string | null;
  Page?: string | null;
  Date?: string;
  Clicks: number;
  Impressions: number;
  AvgClickPosition?: number;
  AvgImpressionPosition?: number;
}

/** Same wire shape as BingQueryStat — GetPageStats returns QueryStats objects. */
export type BingPageStat = BingQueryStat;

/** One row per distinct query/URL, summed across every day Bing reported. */
export interface BingAggregatedStat {
  key: string;
  Clicks: number;
  Impressions: number;
  /** Impression-weighted mean position, or null when Bing reported none. */
  AvgImpressionPosition: number | null;
}

/**
 * Collapse Bing's per-day rows into one row per query/URL. `keyOf` picks the label
 * field: GetPageStats and GetQueryStats both carry it in `Query`, so default to that
 * and fall back to `Page` in case Bing ever normalizes the DTO.
 */
export function aggregateBingStats(
  rows: BingQueryStat[],
  keyOf: (r: BingQueryStat) => string | null | undefined = (r) => r.Query ?? r.Page,
): BingAggregatedStat[] {
  const byKey = new Map<string, { clicks: number; impressions: number; posWeighted: number; posWeight: number }>();

  for (const r of rows) {
    const key = keyOf(r)?.trim();
    if (!key) continue; // no label = nothing to show
    const acc = byKey.get(key) ?? { clicks: 0, impressions: 0, posWeighted: 0, posWeight: 0 };
    const impressions = r.Impressions ?? 0;
    acc.clicks += r.Clicks ?? 0;
    acc.impressions += impressions;
    const pos = r.AvgImpressionPosition ?? 0;
    if (pos > 0 && impressions > 0) {
      acc.posWeighted += pos * impressions;
      acc.posWeight += impressions;
    }
    byKey.set(key, acc);
  }

  return [...byKey.entries()].map(([key, a]) => ({
    key,
    Clicks: a.clicks,
    Impressions: a.impressions,
    AvgImpressionPosition: a.posWeight > 0 ? a.posWeighted / a.posWeight : null,
  }));
}

export interface BingRankAndTraffic {
  Date: string; // /Date(timestamp)/ format
  Clicks: number;
  Impressions: number;
  AvgClickPosition?: number;
  AvgImpressionPosition?: number;
}

export interface BingCrawlStat {
  Date: string;
  CrawledPages: number;
  CrawlErrors: number;
  HttpStatus2xx?: number;
  HttpStatus3xx?: number;
  HttpStatus4xx?: number;
  HttpStatus5xx?: number;
  InLinks?: number;
}

export async function getBingQueryStats(): Promise<BingQueryStat[]> {
  return bingGet<BingQueryStat[]>("GetQueryStats");
}

export async function getBingPageStats(): Promise<BingPageStat[]> {
  return bingGet<BingPageStat[]>("GetPageStats");
}

export async function getBingRankAndTrafficStats(): Promise<BingRankAndTraffic[]> {
  return bingGet<BingRankAndTraffic[]>("GetRankAndTrafficStats");
}

export async function getBingCrawlStats(): Promise<BingCrawlStat[]> {
  return bingGet<BingCrawlStat[]>("GetCrawlStats");
}

/**
 * Convert Bing's "/Date(1747526400000+0000)/" format to JS Date.
 */
export function parseBingDate(s: string): Date | null {
  const m = s.match(/\/Date\((\d+)([+-]\d{4})?\)\//);
  if (!m) return null;
  return new Date(Number(m[1]));
}

/**
 * Aggregate daily trafffic data into a single totals object.
 */
export interface BingTotals {
  totalClicks: number;
  totalImpressions: number;
  ctr: number;
  avgPosition: number;
  daysCount: number;
}

export function aggregateBingTraffic(rows: BingRankAndTraffic[]): BingTotals {
  if (rows.length === 0) {
    return { totalClicks: 0, totalImpressions: 0, ctr: 0, avgPosition: 0, daysCount: 0 };
  }
  const totalClicks = rows.reduce((s, r) => s + (r.Clicks ?? 0), 0);
  const totalImpressions = rows.reduce((s, r) => s + (r.Impressions ?? 0), 0);
  const positions = rows
    .map((r) => r.AvgImpressionPosition ?? 0)
    .filter((p) => p > 0);
  const avgPosition = positions.length
    ? positions.reduce((s, p) => s + p, 0) / positions.length
    : 0;
  return {
    totalClicks,
    totalImpressions,
    ctr: totalImpressions > 0 ? totalClicks / totalImpressions : 0,
    avgPosition,
    daysCount: rows.length,
  };
}
