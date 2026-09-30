import { unstable_cache } from "next/cache";

import { db } from "@/lib/db";
import { getClientPagePaths } from "@/lib/google/get-client-page-paths";

import { fetchModontySearchRows, type SearchRow } from "./fetch-modonty-search-rows";

export interface GoogleTotals {
  clicks: number;
  impressions: number;
  /** Clicks ÷ impressions, as a percentage. */
  ctr: number;
  /** Average position, weighted by impressions (Google's own way of averaging it). */
  position: number | null;
}

export interface ClientGooglePerformance {
  current: GoogleTotals;
  previous: GoogleTotals;
  /** Google impressions/clicks with the same page's views on modonty over the same window. */
  topPages: { title: string; path: string; clicks: number; impressions: number; position: number; views: number }[];
  topQueries: { query: string; clicks: number; impressions: number }[];
  /** One point per day that had data: impressions, clicks, impressions-weighted average position. */
  daily: { date: string; impressions: number; clicks: number; position: number | null }[];
  range: { start: string; end: string };
}

function totals(rows: SearchRow[]): GoogleTotals {
  const clicks = rows.reduce((s, r) => s + r.clicks, 0);
  const impressions = rows.reduce((s, r) => s + r.impressions, 0);
  const weighted = rows.reduce((s, r) => s + r.position * r.impressions, 0);
  return {
    clicks,
    impressions,
    ctr: impressions ? (clicks / impressions) * 100 : 0,
    position: impressions ? weighted / impressions : null,
  };
}

/**
 * This client's slice of modonty.com in Google: his partner page and his published articles.
 *
 * Measured before building (30 Sep 2026, شركة جبر سيو, 90 days): 19 of his pages had Google data,
 * 6,271 impressions, 55 clicks, 268 search terms — so the section shows real numbers, not a
 * placeholder. Cached per client for six hours: the finished numbers are small, and Search
 * Console only moves once a day anyway.
 */
export const getClientGooglePerformance = unstable_cache(
  async (clientId: string, days: number): Promise<ClientGooglePerformance | null> => {
    const [pages, rows] = await Promise.all([getClientPagePaths(clientId), fetchModontySearchRows(days)]);
    if (!pages || !rows) return null;
    const { clientPath, isMine, pathOf, titleOf } = pages;

    // Views on modonty in the same window as Google's numbers — so one list answers both
    // «how often did Google show it» and «how many read it here» (the dashboard used to carry
    // two separate «best articles» lists, one per source).
    const since = new Date(`${rows.range.start}T00:00:00Z`);
    const [articleViews, pageViews] = await Promise.all([
      db.articleView.groupBy({ by: ["articleId"], where: { article: { clientId }, createdAt: { gte: since } }, _count: { _all: true } }),
      db.clientView.count({ where: { clientId, createdAt: { gte: since } } }),
    ]);
    const viewsByArticle = new Map(articleViews.map((v) => [v.articleId, v._count._all]));
    const viewsByPath = new Map(pages.articles.map((a) => [a.path, viewsByArticle.get(a.id) ?? 0]));

    const current = rows.current.filter((r) => isMine(r.keys[0]));
    const previous = rows.previous.filter((r) => isMine(r.keys[0]));

    const byQuery = new Map<string, { clicks: number; impressions: number }>();
    for (const r of rows.queries) {
      if (!isMine(r.keys[0])) continue;
      const q = byQuery.get(r.keys[1]) ?? { clicks: 0, impressions: 0 };
      q.clicks += r.clicks;
      q.impressions += r.impressions;
      byQuery.set(r.keys[1], q);
    }

    const byDay = new Map<string, SearchRow[]>();
    for (const r of rows.daily) {
      if (!isMine(r.keys[0])) continue;
      byDay.set(r.keys[1], [...(byDay.get(r.keys[1]) ?? []), r]);
    }
    const daily = [...byDay]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, dayRows]) => {
        const t = totals(dayRows);
        return { date, impressions: t.impressions, clicks: t.clicks, position: t.position };
      });

    return {
      daily,
      current: totals(current),
      previous: totals(previous),
      topPages: current
        .map((r) => {
          const path = pathOf(r.keys[0]);
          const views = viewsByPath.get(path) ?? (path === clientPath ? pageViews : 0);
          return { title: titleOf(path), path, clicks: r.clicks, impressions: r.impressions, position: r.position, views };
        })
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 5),
      topQueries: [...byQuery]
        .map(([query, v]) => ({ query, ...v }))
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 8),
      range: rows.range,
    };
  },
  // unstable_cache folds the arguments (clientId, days) into the key — one entry per client per period.
  ["client-google-performance-v4"],
  { revalidate: 6 * 60 * 60, tags: ["gsc-console"] },
);
