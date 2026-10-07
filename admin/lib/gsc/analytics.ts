import type { GscAnalyticsRequest, GscAnalyticsResponse, GscRow } from "./types";
import { getGscClient, GSC_PROPERTY } from "./client";

async function queryAnalytics(req: GscAnalyticsRequest): Promise<GscAnalyticsResponse> {
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
