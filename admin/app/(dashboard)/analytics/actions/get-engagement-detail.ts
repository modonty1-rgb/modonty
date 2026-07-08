"use server";

import { db } from "@/lib/db";
import { runReport } from "@/lib/analytics/ga4-data-api";

/**
 * Engagement drill-down — GA4 (SOT) aggregates per event/day/page + recent
 * raw interactions from our DB (who did what, for follow-up and moderation).
 */

const ENGAGEMENT_EVENTS = [
  "article_like",
  "article_dislike",
  "article_favorite",
  "article_share",
  "comment_submit",
  "comment_reply",
  "comment_like",
  "comment_dislike",
  "client_share",
  "client_favorite",
  "client_comment_submit",
  "follow_client",
];

export interface EngagementDetail {
  byEvent: Array<{ event: string; count: number }>;
  byDay: Array<{ date: string; count: number }>;
  byPage: Array<{ path: string; count: number }>;
  recentComments: Array<{ id: string; author: string; article: string; excerpt: string; status: string; createdAt: string }>;
  recentInteractions: Array<{ kind: string; article: string | null; user: string; createdAt: string }>;
  total30d: number;
}

const evFilter = { filter: { fieldName: "eventName", inListFilter: { values: ENGAGEMENT_EVENTS } } };

export async function getEngagementDetail(): Promise<EngagementDetail> {
  const dateRanges = [{ startDate: "30daysAgo", endDate: "today" }];

  const [byEventRep, byDayRep, byPageRep, comments, likes, favorites] = await Promise.all([
    runReport({
      dateRanges,
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: evFilter,
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 20,
    }),
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
      limit: 15,
    }),
    db.comment.findMany({
      select: {
        id: true,
        content: true,
        status: true,
        createdAt: true,
        author: { select: { name: true } },
        article: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.articleLike.findMany({
      select: { createdAt: true, user: { select: { name: true } }, article: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    db.articleFavorite.findMany({
      select: { createdAt: true, user: { select: { name: true } }, article: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
  ]);

  const decodedPath = (p: string) => {
    try {
      return decodeURIComponent(p);
    } catch {
      return p;
    }
  };

  const byDay = (byDayRep.rows ?? [])
    .map((r) => {
      const raw = r.dimensionValues[0].value;
      return { date: `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`, count: Number(r.metricValues[0].value) || 0 };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const recentInteractions = [
    ...likes.map((l) => ({ kind: "Like", article: l.article?.title ?? null, user: l.user?.name ?? "Anonymous", createdAt: l.createdAt.toISOString() })),
    ...favorites.map((f) => ({ kind: "Favorite", article: f.article?.title ?? null, user: f.user?.name ?? "—", createdAt: f.createdAt.toISOString() })),
  ]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 20);

  return {
    byEvent: (byEventRep.rows ?? []).map((r) => ({ event: r.dimensionValues[0].value, count: Number(r.metricValues[0].value) || 0 })),
    byDay,
    byPage: (byPageRep.rows ?? []).map((r) => ({ path: decodedPath(r.dimensionValues[0].value), count: Number(r.metricValues[0].value) || 0 })),
    recentComments: comments.map((c) => ({
      id: c.id,
      author: c.author?.name ?? "Anonymous",
      article: c.article?.title ?? "—",
      excerpt: c.content.slice(0, 100),
      status: String(c.status),
      createdAt: c.createdAt.toISOString(),
    })),
    recentInteractions,
    total30d: byDay.reduce((s, d) => s + d.count, 0),
  };
}
