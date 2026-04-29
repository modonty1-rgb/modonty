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
    newSubscribersThisMonth: number;
  };
  analytics: {
    views7d: number;
    views7dPrev: number; // days 8-14 ago — for WoW trend
    views7dTrendPct: number; // % change vs prev period
    views30d: number;
    views30dPrev: number; // days 31-60 ago — for MoM trend
    views30dTrendPct: number;
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

function trendPct(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
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
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const [
    client,
    monthlyPublished,
    totalArticles,
    subscribers,
    newSubscribersThisMonth,
    views7d,
    views7dPrev,
    views30d,
    views30dPrev,
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
      where: { clientId, subscribed: true },
    }),
    db.subscriber.count({
      where: { clientId, subscribed: true, subscribedAt: { gte: startOfMonth } },
    }),
    // BUG-07 fix: count article + client page views to match Analytics page
    Promise.all([
      db.articleView.count({ where: { article: { clientId }, createdAt: { gte: sevenDaysAgo } } }),
      db.clientView.count({ where: { clientId, createdAt: { gte: sevenDaysAgo } } }),
    ]).then(([a, c]) => a + c),
    // Previous 7-day window (days 8-14 ago) for WoW trend
    Promise.all([
      db.articleView.count({ where: { article: { clientId }, createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
      db.clientView.count({ where: { clientId, createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
    ]).then(([a, c]) => a + c),
    Promise.all([
      db.articleView.count({ where: { article: { clientId }, createdAt: { gte: thirtyDaysAgo } } }),
      db.clientView.count({ where: { clientId, createdAt: { gte: thirtyDaysAgo } } }),
    ]).then(([a, c]) => a + c),
    // Previous 30-day window (days 31-60 ago) for MoM trend
    Promise.all([
      db.articleView.count({ where: { article: { clientId }, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      db.clientView.count({ where: { clientId, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    ]).then(([a, c]) => a + c),
    db.articleView.count({
      where: { article: { clientId } },
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
          clientId,
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

  // BUG-06 fix: build Set manually to handle null sessionId correctly
  const rawViews7d = await db.articleView.findMany({
    where: { article: { clientId }, createdAt: { gte: sevenDaysAgo } },
    select: { sessionId: true, userId: true },
  });
  const activeUsers7d = new Set(
    rawViews7d.map((v) => v.userId ?? v.sessionId).filter(Boolean)
  ).size;

  const rawViews30d = await db.articleView.findMany({
    where: { article: { clientId }, createdAt: { gte: thirtyDaysAgo } },
    select: { sessionId: true, userId: true },
  });
  const activeUsers30d = new Set(
    rawViews30d.map((v) => v.userId ?? v.sessionId).filter(Boolean)
  ).size;

  const returnVisitors = await db.articleView.findMany({
    where: {
      article: { clientId },
      createdAt: { gte: thirtyDaysAgo },
    },
    select: { sessionId: true, userId: true },
  });
  // Count views per unique session to find sessions that visited more than once
  const sessionViewCount = new Map<string, number>();
  for (const v of returnVisitors) {
    const key = v.userId ?? v.sessionId;
    if (!key) continue;
    sessionViewCount.set(key, (sessionViewCount.get(key) ?? 0) + 1);
  }
  const uniqueSessions = sessionViewCount.size;
  const returnerCount = [...sessionViewCount.values()].filter((c) => c > 1).length;
  const returnVisitorRate = uniqueSessions > 0 ? (returnerCount / uniqueSessions) * 100 : 0;

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
      newSubscribersThisMonth,
    },
    analytics: {
      views7d,
      views7dPrev,
      views7dTrendPct: trendPct(views7d, views7dPrev),
      views30d,
      views30dPrev,
      views30dTrendPct: trendPct(views30d, views30dPrev),
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
  // BUG-09 fix: completionRate and engagementRate come from empty engagementDuration table
  // Redistribute their weights to the metrics we actually have
  const timeScore = Math.min(100, (metrics.avgTimeOnPage / 180) * 100) * 0.4;
  const scrollScore = metrics.avgScrollDepth * 0.35;
  const interactionScore = Math.min(100, metrics.interactionRate * 10) * 0.25;

  return Math.round(timeScore + scrollScore + interactionScore);
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

export interface ViewsOverTimeItem {
  date: string;
  views: number;
}

export async function getViewsOverTime(
  clientId: string,
  days: 7 | 30 = 7
): Promise<ViewsOverTimeItem[]> {
  const result: ViewsOverTimeItem[] = [];
  const now = new Date();
  for (let d = days - 1; d >= 0; d--) {
    const day = new Date(now);
    day.setDate(day.getDate() - d);
    day.setHours(0, 0, 0, 0);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    const count = await db.articleView.count({
      where: {
        article: { clientId },
        createdAt: { gte: day, lt: nextDay },
      },
    });
    result.push({
      date: day.toISOString().slice(0, 10),
      views: count,
    });
  }
  return result;
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
          clientId,
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

  const conversionTypeAr: Record<string, string> = {
    CONTACT_FORM: "رسالة تواصل",
    NEWSLETTER: "اشتراك نشرة",
    SIGNUP: "تسجيل مستخدم",
    PURCHASE: "عملية شراء",
  };

  recentArticles.forEach((article) => {
    if (article.datePublished) {
      activities.push({
        type: "article",
        title: article.title,
        description: "مقال جديد منشور",
        timestamp: article.datePublished,
      });
    }
  });

  recentConversions.forEach((conversion) => {
    activities.push({
      type: "conversion",
      title: conversionTypeAr[conversion.type] ?? conversion.type,
      description: conversion.article?.title ? `في المقالة: ${conversion.article.title}` : "تحويل جديد",
      timestamp: conversion.createdAt,
    });
  });

  recentComments.forEach((comment) => {
    activities.push({
      type: "comment",
      title: "تعليق جديد",
      description: `في المقالة: ${comment.article?.title ?? "—"}`,
      timestamp: comment.createdAt,
    });
  });

  recentSubscribers.forEach((subscriber) => {
    activities.push({
      type: "subscriber",
      title: "مشترك جديد",
      description: subscriber.email,
      timestamp: subscriber.subscribedAt,
    });
  });

  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}
