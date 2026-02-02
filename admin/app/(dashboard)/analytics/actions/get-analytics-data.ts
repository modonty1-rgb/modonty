"use server";

import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { startOfDay, endOfDay } from "date-fns";

type AnalyticsWithArticle = Prisma.AnalyticsGetPayload<{
  include: {
    article: {
      select: {
        title: true;
        client: { select: { name: true } };
      };
    };
  };
}>;

type TopArticle = {
  articleId: string;
  title: string;
  client: string;
  views: number;
};

type ChannelSummary = {
  views: number;
  sessions: number;
  avgTimeOnPage: number;
  bounceRate: number;
  avgScrollDepth: number;
};

function categorizeSource(rawSource?: string | null): string {
  const source = (rawSource || "").toLowerCase();

  if (!source || source === "direct") {
    return "Direct";
  }

  if (source.includes("google") || source.includes("bing") || source.includes("yahoo")) {
    return "Organic";
  }

  if (source.includes("facebook") || source.includes("twitter") || source.includes("x.com") || source.includes("linkedin") || source.includes("instagram")) {
    return "Social";
  }

  if (source.includes("ads") || source.includes("adwords") || source.includes("cpc") || source.includes("ppc")) {
    return "Paid";
  }

  if (source.includes("email")) {
    return "Email";
  }

  return "Referral";
}

export async function getAnalyticsData(filters?: {
  clientId?: string;
  articleId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const where: Prisma.AnalyticsWhereInput = {};
    if (filters?.clientId) where.clientId = filters.clientId;
    if (filters?.articleId) where.articleId = filters.articleId;

    const defaultStartDate = startOfDay(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const defaultEndDate = endOfDay(new Date());

    const startDate = filters?.startDate ? startOfDay(filters.startDate) : defaultStartDate;
    const endDate = filters?.endDate ? endOfDay(filters.endDate) : defaultEndDate;

    where.timestamp = {
      gte: startDate,
      lte: endDate,
    };

    const analytics = await db.analytics.findMany({
      where,
      include: {
        article: {
          select: {
            title: true,
            client: { select: { name: true } },
          },
        },
      },
      orderBy: { timestamp: "desc" },
      take: 10000,
    });

    const totalViews = analytics.length;
    const uniqueSessions = new Set(
      analytics.map((a: AnalyticsWithArticle) => a.sessionId).filter(Boolean)
    ).size;

    const validTimeOnPageRecords = analytics.filter(
      (a: AnalyticsWithArticle) => a.timeOnPage != null && a.timeOnPage !== undefined
    );
    const avgTimeOnPage =
      validTimeOnPageRecords.length > 0
        ? validTimeOnPageRecords.reduce(
            (sum: number, a: AnalyticsWithArticle) => sum + (a.timeOnPage || 0),
            0
          ) / validTimeOnPageRecords.length
        : 0;

    const bounceRate =
      totalViews > 0
        ? (analytics.filter((a: AnalyticsWithArticle) => a.bounced).length / totalViews) * 100
        : 0;

    const validScrollDepthRecords = analytics.filter(
      (a: AnalyticsWithArticle) => a.scrollDepth != null && a.scrollDepth !== undefined
    );
    const avgScrollDepth =
      validScrollDepthRecords.length > 0
        ? validScrollDepthRecords.reduce(
            (sum: number, a: AnalyticsWithArticle) => sum + (a.scrollDepth || 0),
            0
          ) / validScrollDepthRecords.length
        : 0;

    const topArticles = analytics.reduce(
      (acc: Record<string, TopArticle>, a: AnalyticsWithArticle) => {
        if (!a.article) {
          return acc;
        }
        const articleId = a.articleId;
        if (!acc[articleId]) {
          acc[articleId] = {
            articleId,
            title: a.article.title || "Untitled",
            client: a.article.client?.name || "Unknown",
            views: 0,
          };
        }
        acc[articleId].views++;
        return acc;
      },
      {} as Record<string, TopArticle>
    );

    const topArticlesList = Object.values(topArticles)
      .sort((a: TopArticle, b: TopArticle) => b.views - a.views)
      .slice(0, 10);

    const trafficSources = analytics.reduce(
      (acc: Record<string, number>, a: AnalyticsWithArticle) => {
        const source = a.source || "UNKNOWN";
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const channelStats = analytics.reduce(
      (
        acc: Record<
          string,
          {
            views: number;
            sessions: Set<string>;
            timeOnPageSum: number;
            timeOnPageCount: number;
            scrollDepthSum: number;
            scrollDepthCount: number;
            bounces: number;
          }
        >,
        a: AnalyticsWithArticle
      ) => {
        const channel = categorizeSource(a.source);
        if (!acc[channel]) {
          acc[channel] = {
            views: 0,
            sessions: new Set<string>(),
            timeOnPageSum: 0,
            timeOnPageCount: 0,
            scrollDepthSum: 0,
            scrollDepthCount: 0,
            bounces: 0,
          };
        }

        acc[channel].views += 1;

        if (a.sessionId) {
          acc[channel].sessions.add(a.sessionId);
        }

        if (typeof a.timeOnPage === "number") {
          acc[channel].timeOnPageSum += a.timeOnPage;
          acc[channel].timeOnPageCount += 1;
        }

        if (typeof a.scrollDepth === "number") {
          acc[channel].scrollDepthSum += a.scrollDepth;
          acc[channel].scrollDepthCount += 1;
        }

        if (a.bounced) {
          acc[channel].bounces += 1;
        }

        return acc;
      },
      {} as Record<
        string,
        {
          views: number;
          sessions: Set<string>;
          timeOnPageSum: number;
          timeOnPageCount: number;
          scrollDepthSum: number;
          scrollDepthCount: number;
          bounces: number;
        }
      >
    );

    const channelSummary: Record<string, ChannelSummary> = Object.entries(channelStats).reduce(
      (acc, [channel, data]) => {
        const views = data.views || 0;
        const sessions = data.sessions.size || 0;
        const avgTimeOnPageValue =
          data.timeOnPageCount > 0 ? data.timeOnPageSum / data.timeOnPageCount : 0;
        const avgScrollDepthValue =
          data.scrollDepthCount > 0 ? data.scrollDepthSum / data.scrollDepthCount : 0;
        const bounceRateValue = views > 0 ? (data.bounces / views) * 100 : 0;

        acc[channel] = {
          views,
          sessions,
          avgTimeOnPage: Math.round(avgTimeOnPageValue) || 0,
          bounceRate: Math.round(bounceRateValue * 100) / 100 || 0,
          avgScrollDepth: Math.round(avgScrollDepthValue * 100) / 100 || 0,
        };

        return acc;
      },
      {} as Record<string, ChannelSummary>
    );

    return {
      totalViews: totalViews || 0,
      uniqueSessions: uniqueSessions || 0,
      avgTimeOnPage: Math.round(avgTimeOnPage) || 0,
      bounceRate: Math.round(bounceRate * 100) / 100 || 0,
      avgScrollDepth: Math.round(avgScrollDepth * 100) / 100 || 0,
      topArticles: topArticlesList || [],
      trafficSources: trafficSources || {},
      channelSummary,
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return {
      totalViews: 0,
      uniqueSessions: 0,
      avgTimeOnPage: 0,
      bounceRate: 0,
      avgScrollDepth: 0,
      topArticles: [],
      trafficSources: {},
    };
  }
}

