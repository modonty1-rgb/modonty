"use server";

import { db } from "@/lib/db";
import { ArticleStatus, SubscriptionStatus, TrafficSource } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

import { computeClientSeoScore } from "@modonty/shared/lib/seo/client/seo-score";
import { clientToSeoInput, CLIENT_SEO_SELECT } from "@modonty/shared/lib/seo/client/from-client";

/**
 * Safely fetches clients with relations, handling DateTime conversion errors.
 * On DateTime error, falls back to a single query without date-filtered articles.
 */
async function safeFindClientsWithRelations(startOfMonth: Date, endOfMonth: Date) {
  try {
    return await db.client.findMany({
      include: {
        subscriptionTierConfig: {
          select: {
            price: true,
            articlesPerMonth: true,
            tier: true,
          },
        },
        articles: {
          where: {
            status: ArticleStatus.PUBLISHED,
            datePublished: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          select: {
            id: true,
            datePublished: true,
          },
        },
        _count: {
          select: {
            articles: {
              where: {
                status: ArticleStatus.PUBLISHED,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.message.includes("Failed to convert") &&
      error.message.includes("DateTime")
    ) {
      console.error("DateTime conversion error — falling back to query without date-filtered articles:", error.message);

      const clients = await db.client.findMany({
        select: {
          id: true,
          subscriptionStatus: true,
          subscriptionEndDate: true,
          articlesPerMonth: true,
          subscriptionTierConfig: {
            select: {
              price: true,
              articlesPerMonth: true,
              tier: true,
            },
          },
          _count: {
            select: {
              articles: {
                where: {
                  status: ArticleStatus.PUBLISHED,
                },
              },
            },
          },
        },
      });

      return clients.map((client) => ({
        ...client,
        articles: [] as Array<{ id: string; datePublished: Date | null }>,
      }));
    }

    throw error;
  }
}

export async function getClientsStats() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const expiringSoonDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [total, withArticles, withoutArticles, createdThisMonth, allClients, clientsWithRelations] =
      await Promise.all([
        db.client.count(),
        db.client.count({
          where: {
            articles: {
              some: {
                status: ArticleStatus.PUBLISHED,
              },
            },
          },
        }),
        db.client.count({
          where: {
            articles: {
              none: {},
            },
          },
        }),
        db.client.count({
          where: {
            createdAt: { gte: startOfMonth },
          },
        }),
        db.client.findMany({
          select: { id: true, ...CLIENT_SEO_SELECT },
        }),
        safeFindClientsWithRelations(startOfMonth, endOfMonth),
      ]);

    // Scored through the ONE shared client rubric, like every other surface.
    //
    // This used to be a fourth hand-rolled formula (title=20, desc=20, ogImage=10,
    // graph=30, zero-errors=20) that agreed with nothing else in the app — the same
    // client read one number here and another in the table beside it. Worse, its
    // `errCount === 0` handed 20 points to a client with NO validation report at all:
    // no report means no errors counted, which it read as a clean bill of health.
    let averageSEO = 0;
    if (allClients.length > 0) {
      const scores = allClients.map(
        (client) => computeClientSeoScore(clientToSeoInput(client as unknown as Record<string, unknown>)).score,
      );
      averageSEO = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
    }

    const activeClients = clientsWithRelations.filter(
      (c) => c.subscriptionStatus === SubscriptionStatus.ACTIVE
    );

    // Get all published article IDs for analytics queries
    const allArticleIds = await db.article.findMany({
      where: { status: ArticleStatus.PUBLISHED },
      select: { id: true },
    }).then((articles) => articles.map((a) => a.id));

    const articleIdsThisMonth = await db.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        datePublished: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: { id: true },
    }).then((articles) => articles.map((a) => a.id));

    // Analytics queries
    const [
      totalViews,
      viewsThisMonth,
      totalArticles,
      articlesThisMonth,
      engagementMetrics,
      trafficSources,
    ] = await Promise.all([
      // Total views
      db.analytics.count({
        where: {
          articleId: { in: allArticleIds },
        },
      }),
      // Views this month
      db.analytics.count({
        where: {
          articleId: { in: allArticleIds },
          timestamp: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),
      // Total published articles
      db.article.count({
        where: { status: ArticleStatus.PUBLISHED },
      }),
      // Articles this month
      db.article.count({
        where: {
          status: ArticleStatus.PUBLISHED,
          datePublished: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),
      // Engagement metrics
      db.analytics.aggregate({
        where: {
          articleId: { in: allArticleIds },
        },
        _avg: {
          timeOnPage: true,
          scrollDepth: true,
        },
        _count: {
          id: true,
        },
      }),
      // Traffic sources
      db.analytics.groupBy({
        by: ["source"],
        where: {
          articleId: { in: allArticleIds },
        },
        _count: {
          source: true,
        },
      }),
    ]);

    // Calculate bounce rate
    const bouncedCount = await db.analytics.count({
      where: {
        articleId: { in: allArticleIds },
        bounced: true,
      },
    });
    const bounceRate = totalViews > 0 ? Math.round((bouncedCount / totalViews) * 100) : 0;

    // Calculate average views per article
    const averageViewsPerArticle = totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0;

    // Calculate engagement score (0-100)
    const avgTimeOnPage = engagementMetrics._avg.timeOnPage ?? 0;
    const avgScrollDepth = engagementMetrics._avg.scrollDepth ?? 0;
    const engagementScore = Math.round(
      (Math.min(avgTimeOnPage / 120, 1) * 50 + Math.min(avgScrollDepth / 100, 1) * 50)
    );

    // Build traffic sources object
    const trafficSourcesMap: Record<string, number> = {};
    trafficSources.forEach((item) => {
      trafficSourcesMap[item.source] = item._count.source;
    });

    const organicTraffic = trafficSourcesMap[TrafficSource.ORGANIC] ?? 0;
    const directTraffic = trafficSourcesMap[TrafficSource.DIRECT] ?? 0;
    const referralTraffic = trafficSourcesMap[TrafficSource.REFERRAL] ?? 0;
    const socialTraffic = trafficSourcesMap[TrafficSource.SOCIAL] ?? 0;

    // Calculate retention rate (clients with articles / total clients)
    const retentionRate = total > 0 ? Math.round((withArticles / total) * 100) : 0;

    // Calculate new clients trend (this month vs last month)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const newClientsLastMonth = await db.client.count({
      where: {
        createdAt: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
      },
    });
    const newClientsTrend = newClientsLastMonth > 0
      ? Math.round(((createdThisMonth - newClientsLastMonth) / newClientsLastMonth) * 100)
      : createdThisMonth > 0 ? 100 : 0;

    const subscriptionCounts = {
      active: clientsWithRelations.filter((c) => c.subscriptionStatus === SubscriptionStatus.ACTIVE)
        .length,
      expired: clientsWithRelations.filter((c) => c.subscriptionStatus === SubscriptionStatus.EXPIRED)
        .length,
      cancelled: clientsWithRelations.filter(
        (c) => c.subscriptionStatus === SubscriptionStatus.CANCELLED
      ).length,
      pending: clientsWithRelations.filter((c) => c.subscriptionStatus === SubscriptionStatus.PENDING)
        .length,
      expiringSoon: clientsWithRelations.filter((c) => {
        if (!c.subscriptionEndDate) return false;
        const endDate = new Date(c.subscriptionEndDate);
        return endDate >= now && endDate <= expiringSoonDate;
      }).length,
    };

    let totalPromised = 0;
    let totalDelivered = 0;
    let behindSchedule = 0;

    activeClients.forEach((client) => {
      const promised =
        client.articlesPerMonth ?? client.subscriptionTierConfig?.articlesPerMonth ?? 0;
      const delivered = client.articles.length;
      totalPromised += promised;
      totalDelivered += delivered;
      if (delivered < promised) {
        behindSchedule++;
      }
    });

    const deliveryRate = totalPromised > 0 ? Math.round((totalDelivered / totalPromised) * 100) : 0;

    return {
      total,
      withArticles,
      withoutArticles,
      createdThisMonth,
      averageSEO,
      subscription: subscriptionCounts,
      delivery: {
        totalPromised,
        totalDelivered,
        deliveryRate,
        behindSchedule,
      },
      articles: {
        total: totalArticles,
        thisMonth: articlesThisMonth,
        averageViewsPerArticle,
      },
      views: {
        total: totalViews,
        thisMonth: viewsThisMonth,
      },
      engagement: {
        avgTimeOnPage: Math.round(avgTimeOnPage),
        avgScrollDepth: Math.round(avgScrollDepth),
        bounceRate,
        engagementScore,
      },
      traffic: {
        organic: organicTraffic,
        direct: directTraffic,
        referral: referralTraffic,
        social: socialTraffic,
        sources: trafficSourcesMap,
      },
      growth: {
        retentionRate,
        newClientsTrend,
      },
    };
  } catch (error) {
    console.error("Error fetching clients stats:", error);
    return {
      total: 0,
      withArticles: 0,
      withoutArticles: 0,
      createdThisMonth: 0,
      averageSEO: 0,
      subscription: {
        active: 0,
        expired: 0,
        cancelled: 0,
        pending: 0,
        expiringSoon: 0,
      },
      delivery: {
        totalPromised: 0,
        totalDelivered: 0,
        deliveryRate: 0,
        behindSchedule: 0,
      },
      articles: {
        total: 0,
        thisMonth: 0,
        averageViewsPerArticle: 0,
      },
      views: {
        total: 0,
        thisMonth: 0,
      },
      engagement: {
        avgTimeOnPage: 0,
        avgScrollDepth: 0,
        bounceRate: 0,
        engagementScore: 0,
      },
      traffic: {
        organic: 0,
        direct: 0,
        referral: 0,
        social: 0,
        sources: {},
      },
      growth: {
        retentionRate: 0,
        newClientsTrend: 0,
      },
    };
  }
}

