"use server";

import { db } from "@/lib/db";
import { runReport } from "@/lib/analytics/ga4-data-api";

/**
 * CTA drill-down — GA4 (SOT) for aggregates, our DB for the recent raw clicks.
 * GA4 event name verified: outbound_click (events-registry.ts).
 */

export interface CtaDetail {
  byDay: Array<{ date: string; count: number }>;
  byPage: Array<{ path: string; count: number }>;
  bySource: Array<{ source: string; count: number }>;
  recent: Array<{
    id: string;
    type: string;
    articleTitle: string | null;
    clientName: string | null;
    createdAt: string;
  }>;
  total30d: number;
}

const EV = "outbound_click";
const evFilter = { filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT" as const, value: EV } } };

export async function getCtaDetail(): Promise<CtaDetail> {
  const dateRanges = [{ startDate: "30daysAgo", endDate: "today" }];

  const [byDayRep, byPageRep, bySourceRep, recent] = await Promise.all([
    runReport({
      dateRanges,
      dimensions: [{ name: "date" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: evFilter,
      limit: 40,
    }),
    runReport({
      dateRanges,
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: evFilter,
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 20,
    }),
    runReport({
      dateRanges,
      dimensions: [{ name: "sessionSource" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: evFilter,
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 10,
    }),
    db.cTAClick.findMany({
      select: {
        id: true,
        type: true,
        createdAt: true,
        article: { select: { title: true } },
        client: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const byDay = (byDayRep.rows ?? [])
    .map((r) => {
      const raw = r.dimensionValues[0].value;
      return { date: `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`, count: Number(r.metricValues[0].value) || 0 };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const decodedPath = (p: string) => {
    try {
      return decodeURIComponent(p);
    } catch {
      return p;
    }
  };

  return {
    byDay,
    total30d: byDay.reduce((s, d) => s + d.count, 0),
    byPage: (byPageRep.rows ?? []).map((r) => ({ path: decodedPath(r.dimensionValues[0].value), count: Number(r.metricValues[0].value) || 0 })),
    bySource: (bySourceRep.rows ?? [])
      .map((r) => ({ source: r.dimensionValues[0].value, count: Number(r.metricValues[0].value) || 0 }))
      .filter((s) => s.source !== "(not set)"),
    recent: recent.map((c) => ({
      id: c.id,
      type: String(c.type),
      articleTitle: c.article?.title ?? null,
      clientName: c.client?.name ?? null,
      createdAt: c.createdAt.toISOString(),
    })),
  };
}
