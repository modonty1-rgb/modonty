import type { GscAnalyticsRequest, GscAnalyticsResponse, GscRow } from "./types";
import { getGscClient, GSC_PROPERTY } from "./client";

export async function queryAnalytics(req: GscAnalyticsRequest): Promise<GscAnalyticsResponse> {
  const gsc = getGscClient();

  const dimensionFilterGroups = req.filters?.length
    ? [{ filters: req.filters.map((f) => ({ dimension: f.dimension, operator: f.operator, expression: f.expression })) }]
    : undefined;

  const res = await gsc.searchanalytics.query({
    siteUrl: GSC_PROPERTY,
    requestBody: {
      startDate: req.startDate,
      endDate: req.endDate,
      dimensions: req.dimensions ?? ["query"],
      searchType: req.searchType ?? "web",
      dimensionFilterGroups,
      rowLimit: req.rowLimit ?? 1000,
      startRow: req.startRow ?? 0,
    },
  });

  const rows: GscRow[] = (res.data.rows ?? []).map((r) => ({
    keys: r.keys ?? [],
    clicks: r.clicks ?? 0,
    impressions: r.impressions ?? 0,
    ctr: r.ctr ?? 0,
    position: r.position ?? 0,
  }));

  return { rows, responseAggregationType: res.data.responseAggregationType ?? undefined };
}

export async function getTopQueries(days = 28, limit = 100): Promise<GscRow[]> {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days - 3); // GSC data is 2-3 days delayed

  const res = await queryAnalytics({
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    dimensions: ["query"],
    rowLimit: limit,
  });

  return res.rows.sort((a, b) => b.clicks - a.clicks);
}

export async function getTopPages(days = 28, limit = 100): Promise<GscRow[]> {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days - 3);

  const res = await queryAnalytics({
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    dimensions: ["page"],
    rowLimit: limit,
  });

  return res.rows.sort((a, b) => b.clicks - a.clicks);
}

export async function getPerformanceByDate(days = 28): Promise<GscRow[]> {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days - 3);

  const res = await queryAnalytics({
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    dimensions: ["date"],
    rowLimit: days + 5,
  });

  return res.rows.sort((a, b) => a.keys[0].localeCompare(b.keys[0]));
}

export async function getPerformanceTotals(days = 28): Promise<{ clicks: number; impressions: number; ctr: number; position: number }> {
  const rows = await getPerformanceByDate(days);
  if (!rows.length) return { clicks: 0, impressions: 0, ctr: 0, position: 0 };

  const totals = rows.reduce(
    (acc, r) => ({ clicks: acc.clicks + r.clicks, impressions: acc.impressions + r.impressions }),
    { clicks: 0, impressions: 0 }
  );
  const avgCtr = totals.impressions > 0 ? totals.clicks / totals.impressions : 0;
  const avgPos = rows.reduce((sum, r) => sum + r.position, 0) / rows.length;

  return { ...totals, ctr: avgCtr, position: avgPos };
}
