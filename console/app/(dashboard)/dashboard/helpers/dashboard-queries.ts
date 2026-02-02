import { db } from "@/lib/db";
import { ArticleStatus, TrafficSource } from "@prisma/client";

export interface DashboardStats {
  subscription: {
    tier: string;
    tierName: string;
    price: number | null;
    articlesPerMonth: number;
    status: string;
    paymentStatus: string;
    startDate: Date | null;
    endDate: Date | null;
  };
  content: {
    monthlyPublished: number;
    monthlyQuota: number;
    totalArticles: number;
    totalSubscribers: number;
  };
  analytics: {
    views7d: number;
    views30d: number;
    viewsAllTime: number;
    engagementScore: number;
    avgTimeOnPage: number;
    avgScrollDepth: number;
    completionRate: number;
    engagementRate: number;
    bounceRate: number;
  };
  engagement: {
    activeUsers7d: number;
    activeUsers30d: number;
    returnVisitorRate: number;
    highEngagementUsers: number;
  };
  interactions: {
    totalLikes: number;
    totalShares: number;
    totalComments: number;
    interactionRate: number;
    ctaClickThroughRate: number;
  };
  conversions: {
    total: number;
    rate: number;
  };
}

export interface TopArticle {
  id: string;
  title: string;
  slug: string;
  views: number;
  engagementScore: number;
  conversions: number;
  category: string | null;
  datePublished: Date | null;
}

export interface TrafficSourceData {
  source: string;
  count: number;
  percentage: number;
}

export interface RecentActivity {
  type: "article" | "conversion" | "comment" | "subscriber";
  title: string;
  description: string;
  timestamp: Date;
}

export async function getDashboardStats(clientId: string): Promise<DashboardStats> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    client,
    monthlyPublished,
    totalArticles,
    subscribers,
    views7d,
    views30d,
    viewsAllTime,
    engagementData,
    interactions,
    conversions,
    engagementDuration,
  ] = await Promise.all([
    db.client.findUnique({
      where: { id: clientId },
      include: { subscriptionTierConfig: true },
    }),
    db.article.count({
      where: {
        clientId,
        status: ArticleStatus.PUBLISHED,
        createdAt: { gte: startOfMonth },
      },
    }),
    db.article.count({
      where: {
        clientId,
        status: ArticleStatus.PUBLISHED,
      },
    }),
    db.subscriber.count({
      where: {
        clientId,
        subscribed: true,
      },
    }),
    db.articleView.count({
      where: {
        article: { clientId },
        createdAt: { gte: sevenDaysAgo },
      },
    }),
    db.articleView.count({
      where: {
        article: { clientId },
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    db.articleView.count({
      where: {
        article: { clientId },
      },
    }),
    db.analytics.aggregate({
      where: {
        article: { clientId },
        timestamp: { gte: thirtyDaysAgo },
      },
      _avg: {
        timeOnPage: true,
        scrollDepth: true,
      },
      _count: {
        id: true,
      },
    }),
    Promise.all([
      db.articleLike.count({
        where: {
          article: { clientId },
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      db.share.count({
        where: {
          article: { clientId },
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      db.comment.count({
        where: {
          article: { clientId },
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      db.cTAClick.count({
        where: {
          article: { clientId },
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
    ]),
    Promise.all([
      db.conversion.count({
        where: {
          article: { clientId },
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      db.analytics.count({
        where: {
          article: { clientId },
          timestamp: { gte: thirtyDaysAgo },
          bounced: true,
        },
      }),
    ]),
    db.engagementDuration.aggregate({
      where: {
        article: { clientId },
        createdAt: { gte: thirtyDaysAgo },
      },
      _avg: {
        completionRate: true,
      },
      _count: {
        id: true,
      },
    }),
  ]);

  if (!client) {
    throw new Error("Client not found");
  }

  const tier = client.subscriptionTierConfig;
  const totalViews = engagementData._count.id;
  const avgTimeOnPage = engagementData._avg.timeOnPage ?? 0;
  const avgScrollDepth = engagementData._avg.scrollDepth ?? 0;
  const completionRate = engagementDuration._avg.completionRate ?? 0;
  const bounceCount = conversions[1];
  const bounceRate = totalViews > 0 ? (bounceCount / totalViews) * 100 : 0;

  const [likes, shares, comments, ctaClicks] = interactions;
  const totalInteractions = likes + shares + comments;
  const interactionRate = views30d > 0 ? (totalInteractions / views30d) * 100 : 0;
  const ctaClickThroughRate = views30d > 0 ? (ctaClicks / views30d) * 100 : 0;

  const engagedSessions = await db.engagementDuration.count({
    where: {
      article: { clientId },
      createdAt: { gte: thirtyDaysAgo },
      engagedSession: true,
    },
  });
  const engagementRate = views30d > 0 ? (engagedSessions / views30d) * 100 : 0;

  const engagementScore = calculateEngagementScore({
    avgTimeOnPage,
    avgScrollDepth,
    completionRate,
    interactionRate,
    engagementRate,
  });

  const uniqueUsers7d = await db.articleView.findMany({
    where: {
      article: { clientId },
      createdAt: { gte: sevenDaysAgo },
    },
    select: { sessionId: true, userId: true },
    distinct: ["sessionId"],
  });
  const activeUsers7d = new Set(
    uniqueUsers7d.map((v) => v.sessionId || v.userId).filter(Boolean)
  ).size;

  const uniqueUsers30d = await db.articleView.findMany({
    where: {
      article: { clientId },
      createdAt: { gte: thirtyDaysAgo },
    },
    select: { sessionId: true, userId: true },
    distinct: ["sessionId"],
  });
  const activeUsers30d = new Set(
    uniqueUsers30d.map((v) => v.sessionId || v.userId).filter(Boolean)
  ).size;

  const returnVisitors = await db.articleView.findMany({
    where: {
      article: { clientId },
      createdAt: { gte: thirtyDaysAgo },
    },
    select: { sessionId: true, userId: true },
  });
  const uniqueSessions = new Set(
    returnVisitors.map((v) => v.sessionId || v.userId).filter(Boolean)
  ).size;
  const returnVisitorRate = uniqueSessions > 0 ? (uniqueSessions / views30d) * 100 : 0;

  const highEngagementUsers = await db.leadScoring.count({
    where: {
      clientId,
      engagementScore: { gte: 70 },
    },
  });

  const conversionCount = conversions[0];
  const conversionRate = views30d > 0 ? (conversionCount / views30d) * 100 : 0;

  return {
    subscription: {
      tier: client.subscriptionTier,
      tierName: tier?.name ?? client.subscriptionTier,
      price: tier?.price ?? null,
      articlesPerMonth: client.articlesPerMonth ?? 0,
      status: client.subscriptionStatus,
      paymentStatus: client.paymentStatus,
      startDate: client.subscriptionStartDate,
      endDate: client.subscriptionEndDate,
    },
    content: {
      monthlyPublished,
      monthlyQuota: client.articlesPerMonth ?? 0,
      totalArticles,
      totalSubscribers: subscribers,
    },
    analytics: {
      views7d,
      views30d,
      viewsAllTime,
      engagementScore,
      avgTimeOnPage,
      avgScrollDepth,
      completionRate,
      engagementRate,
      bounceRate,
    },
    engagement: {
      activeUsers7d,
      activeUsers30d,
      returnVisitorRate,
      highEngagementUsers,
    },
    interactions: {
      totalLikes: likes,
      totalShares: shares,
      totalComments: comments,
      interactionRate,
      ctaClickThroughRate,
    },
    conversions: {
      total: conversionCount,
      rate: conversionRate,
    },
  };
}

function calculateEngagementScore(metrics: {
  avgTimeOnPage: number;
  avgScrollDepth: number;
  completionRate: number;
  interactionRate: number;
  engagementRate: number;
}): number {
  const timeScore = Math.min(100, (metrics.avgTimeOnPage / 180) * 100) * 0.3;
  const scrollScore = metrics.avgScrollDepth * 0.25;
  const completionScore = metrics.completionRate * 0.25;
  const interactionScore = Math.min(100, metrics.interactionRate * 10) * 0.1;
  const engagementScore = metrics.engagementRate * 0.1;

  return Math.round(timeScore + scrollScore + completionScore + interactionScore + engagementScore);
}

export async function getTopArticles(
  clientId: string,
  metric: "views" | "engagement" | "conversions",
  limit: number = 5
): Promise<TopArticle[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const articles = await db.article.findMany({
    where: {
      clientId,
      status: ArticleStatus.PUBLISHED,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      category: { select: { name: true } },
      datePublished: true,
    },
    take: 100,
  });

  const articlesWithMetrics = await Promise.all(
    articles.map(async (article) => {
      const [views, engagementDuration, conversions] = await Promise.all([
        db.articleView.count({
          where: {
            articleId: article.id,
            createdAt: { gte: thirtyDaysAgo },
          },
        }),
        db.engagementDuration.aggregate({
          where: {
            articleId: article.id,
            createdAt: { gte: thirtyDaysAgo },
          },
          _avg: {
            timeOnPage: true,
            scrollDepth: true,
            completionRate: true,
          },
        }),
        db.conversion.count({
          where: {
            articleId: article.id,
            createdAt: { gte: thirtyDaysAgo },
          },
        }),
      ]);

      const engagementScore = calculateEngagementScore({
        avgTimeOnPage: engagementDuration._avg.timeOnPage ?? 0,
        avgScrollDepth: engagementDuration._avg.scrollDepth ?? 0,
        completionRate: engagementDuration._avg.completionRate ?? 0,
        interactionRate: 0,
        engagementRate: 0,
      });

      return {
        id: article.id,
        title: article.title,
        slug: article.slug,
        views,
        engagementScore,
        conversions,
        category: article.category?.name ?? null,
        datePublished: article.datePublished,
      };
    })
  );

  const sorted = articlesWithMetrics.sort((a, b) => {
    switch (metric) {
      case "views":
        return b.views - a.views;
      case "engagement":
        return b.engagementScore - a.engagementScore;
      case "conversions":
        return b.conversions - a.conversions;
      default:
        return 0;
    }
  });

  return sorted.slice(0, limit);
}

export async function getTrafficSources(
  clientId: string,
  days: 7 | 30 = 30
): Promise<TrafficSourceData[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const sources = await db.analytics.groupBy({
    by: ["source"],
    where: {
      article: { clientId },
      timestamp: { gte: since },
    },
    _count: {
      source: true,
    },
  });

  const total = sources.reduce((sum, s) => sum + s._count.source, 0);

  return sources.map((s) => ({
    source: s.source,
    count: s._count.source,
    percentage: total > 0 ? (s._count.source / total) * 100 : 0,
  }));
}

export async function getRecentActivity(
  clientId: string,
  limit: number = 10
): Promise<RecentActivity[]> {
  const activities: RecentActivity[] = [];

  const [recentArticles, recentConversions, recentComments, recentSubscribers] =
    await Promise.all([
      db.article.findMany({
        where: {
          clientId,
          status: ArticleStatus.PUBLISHED,
        },
        select: {
          title: true,
          datePublished: true,
        },
        orderBy: { datePublished: "desc" },
        take: 5,
      }),
      db.conversion.findMany({
        where: {
          article: { clientId },
        },
        select: {
          type: true,
          createdAt: true,
          article: { select: { title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.comment.findMany({
        where: {
          article: { clientId },
          status: "APPROVED",
        },
        select: {
          content: true,
          createdAt: true,
          article: { select: { title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.subscriber.findMany({
        where: {
          clientId,
          subscribed: true,
        },
        select: {
          email: true,
          subscribedAt: true,
        },
        orderBy: { subscribedAt: "desc" },
        take: 5,
      }),
    ]);

  recentArticles.forEach((article) => {
    if (article.datePublished) {
      activities.push({
        type: "article",
        title: article.title,
        description: "New article published",
        timestamp: article.datePublished,
      });
    }
  });

  recentConversions.forEach((conversion) => {
    activities.push({
      type: "conversion",
      title: `${conversion.type} conversion`,
      description: `On article: ${conversion.article?.title ?? "Unknown"}`,
      timestamp: conversion.createdAt,
    });
  });

  recentComments.forEach((comment) => {
    activities.push({
      type: "comment",
      title: "New comment",
      description: `On article: ${comment.article?.title ?? "Unknown"}`,
      timestamp: comment.createdAt,
    });
  });

  recentSubscribers.forEach((subscriber) => {
    activities.push({
      type: "subscriber",
      title: "New subscriber",
      description: subscriber.email,
      timestamp: subscriber.subscribedAt,
    });
  });

  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}
