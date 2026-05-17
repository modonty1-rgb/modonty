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

function getCreds() {
  const apikey = process.env.INDEXNOW_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.modonty.com";
  if (!apikey) throw new Error("INDEXNOW_KEY env var not set");
  return { apikey, siteUrl };
}

interface BingResponse<T> {
  d?: T;
}

async function bingGet<T>(endpoint: string): Promise<T> {
  const { apikey, siteUrl } = getCreds();
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

export interface BingQueryStat {
  Query: string;
  Clicks: number;
  Impressions: number;
  AvgClickPosition?: number;
  AvgImpressionPosition?: number;
}

export interface BingPageStat {
  Page: string;
  Clicks: number;
  Impressions: number;
  AvgClickPosition?: number;
  AvgImpressionPosition?: number;
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
