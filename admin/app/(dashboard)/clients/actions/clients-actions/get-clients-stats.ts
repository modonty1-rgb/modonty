"use server";

import { db } from "@/lib/db";
import { ArticleStatus, SubscriptionStatus, TrafficSource } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { calculateSEOScore } from "@/helpers/utils/seo-score-calculator";
import { organizationSEOConfig } from "../../helpers/client-seo-config";

/**
 * Safely fetches clients with relations, handling DateTime conversion errors
 * Skips records with corrupted date fields (stored as strings instead of Date)
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
    // Handle DateTime conversion errors for corrupted data
    if (error instanceof PrismaClientKnownRequestError) {
      const errorMessage = error.message || "";
      if (errorMessage.includes("Failed to convert") && errorMessage.includes("DateTime")) {
        console.error("DateTime conversion error detected. Attempting to fetch clients individually...", errorMessage);
        
        // Fetch all client IDs first
        const clientIds = await db.client.findMany({
          select: { id: true },
        });

        // Try to fetch each client individually, skipping corrupted ones
        const validClients = [];
        const corruptedClientIds: string[] = [];

        for (const { id } of clientIds) {
          try {
            const client = await db.client.findUnique({
              where: { id },
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
            
            if (client) {
              validClients.push(client);
            }
          } catch (clientError) {
            // Skip this client if it has corrupted date fields
            corruptedClientIds.push(id);
            console.warn(`Skipping client ${id} due to corrupted date fields:`, clientError instanceof Error ? clientError.message : "Unknown error");
          }
        }

        if (corruptedClientIds.length > 0) {
          console.warn(`Skipped ${corruptedClientIds.length} clients with corrupted date fields:`, corruptedClientIds);
        }

        return validClients;
      }
    }
    
    // Re-throw if not a DateTime conversion error
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
          select: {
            id: true,
            name: true,
            slug: true,
            legalName: true,
            url: true,
            email: true,
            phone: true,
            description: true,
            seoTitle: true,
            seoDescription: true,
            logoMedia: {
              select: {
                url: true,
                altText: true,
                width: true,
                height: true,
              },
            },
            ogImageMedia: {
              select: {
                url: true,
                altText: true,
                width: true,
                height: true,
              },
            },
            twitterImageMedia: {
              select: {
                url: true,
                altText: true,
                width: true,
                height: true,
              },
            },
            sameAs: true,
            businessBrief: true,
            gtmId: true,
            foundingDate: true,
            contactType: true,
            addressStreet: true,
            addressCity: true,
            addressCountry: true,
            addressPostalCode: true,
            twitterCard: true,
            twitterTitle: true,
            twitterDescription: true,
            twitterSite: true,
            canonicalUrl: true,
          },
        }),
        safeFindClientsWithRelations(startOfMonth, endOfMonth),
      ]);

    let averageSEO = 0;
    if (allClients.length > 0) {
      const scores = allClients.map((client) => {
        const scoreResult = calculateSEOScore(client, organizationSEOConfig);
        return scoreResult.percentage;
      });
      averageSEO = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
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

