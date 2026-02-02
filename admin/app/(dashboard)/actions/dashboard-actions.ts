"use server";

import { db } from "@/lib/db";
import { subDays, addDays, startOfDay, endOfDay, startOfMonth, endOfMonth, format, parse } from "date-fns";

export async function getDashboardStats() {
  try {
    const now = new Date();
    const thirtyDaysAgo = startOfDay(subDays(now, 30));
    const sixtyDaysAgo = startOfDay(subDays(now, 60));

    const [
      articlesCount,
      clientsCount,
      usersCount,
      subscribersCount,
      articlesLastMonth,
      clientsLastMonth,
      usersLastMonth,
      subscribersLastMonth,
      articlesLastPeriod,
      clientsLastPeriod,
      usersLastPeriod,
      subscribersLastPeriod,
    ] = await Promise.all([
      db.article.count(),
      db.client.count(),
      db.user.count(),
      db.subscriber.count(),
      db.article.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      db.client.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      db.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      db.subscriber.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      db.article.count({
        where: {
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo,
          },
        },
      }),
      db.client.count({
        where: {
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo,
          },
        },
      }),
      db.user.count({
        where: {
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo,
          },
        },
      }),
      db.subscriber.count({
        where: {
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo,
          },
        },
      }),
    ]);

    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      articles: {
        count: articlesCount,
        trend: calculateTrend(articlesLastMonth, articlesLastPeriod),
      },
      clients: {
        count: clientsCount,
        trend: calculateTrend(clientsLastMonth, clientsLastPeriod),
      },
      users: {
        count: usersCount,
        trend: calculateTrend(usersLastMonth, usersLastPeriod),
      },
      subscribers: {
        count: subscribersCount,
        trend: calculateTrend(subscribersLastMonth, subscribersLastPeriod),
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      articles: { count: 0, trend: 0 },
      clients: { count: 0, trend: 0 },
      users: { count: 0, trend: 0 },
      subscribers: { count: 0, trend: 0 },
    };
  }
}

export async function getRecentArticles() {
  try {
    const articles = await db.article.findMany({
      take: 5,
      where: {
        status: {
          in: ["WRITING", "DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"],
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        client: {
          select: { name: true },
        },
        category: {
          select: { name: true },
        },
        author: {
          select: { name: true },
        },
      },
    });

    return articles;
  } catch (error) {
    console.error("Error fetching recent articles:", error);
    return [];
  }
}

export async function getStatusBreakdown() {
  try {
    const [writing, draft, scheduled, published, archived] = await Promise.all([
      db.article.count({ where: { status: "WRITING" } }),
      db.article.count({ where: { status: "DRAFT" } }),
      db.article.count({ where: { status: "SCHEDULED" } }),
      db.article.count({ where: { status: "PUBLISHED" } }),
      db.article.count({ where: { status: "ARCHIVED" } }),
    ]);

    return {
      writing,
      draft,
      scheduled,
      published,
      archived,
      total: writing + draft + scheduled + published + archived,
    };
  } catch (error) {
    console.error("Error fetching status breakdown:", error);
    return {
      writing: 0,
      draft: 0,
      scheduled: 0,
      published: 0,
      archived: 0,
      total: 0,
      verified: true,
    };
  }
}

export async function getSubscriptionHealth() {
  try {
    const now = new Date();
    const sevenDaysFromNow = addDays(now, 7);
    const oneDayFromNow = addDays(now, 1);
    const threeDaysFromNow = addDays(now, 3);

    const [
      activeSubscriptions,
      expiredSubscriptions,
      cancelledSubscriptions,
      pendingSubscriptions,
      expiringIn7Days,
      expiringIn3Days,
      expiringIn1Day,
      paidPayments,
      pendingPayments,
      overduePayments,
      tierDistribution,
    ] = await Promise.all([
      db.client.count({ where: { subscriptionStatus: "ACTIVE" } }),
      db.client.count({ where: { subscriptionStatus: "EXPIRED" } }),
      db.client.count({ where: { subscriptionStatus: "CANCELLED" } }),
      db.client.count({ where: { subscriptionStatus: "PENDING" } }),
      db.client.count({
        where: {
          subscriptionStatus: "ACTIVE",
          subscriptionEndDate: {
            gte: startOfDay(now),
            lte: sevenDaysFromNow,
            not: null,
          },
        },
      }),
      db.client.count({
        where: {
          subscriptionStatus: "ACTIVE",
          subscriptionEndDate: {
            gte: startOfDay(now),
            lte: threeDaysFromNow,
            not: null,
          },
        },
      }),
      db.client.count({
        where: {
          subscriptionStatus: "ACTIVE",
          subscriptionEndDate: {
            gte: startOfDay(now),
            lte: oneDayFromNow,
            not: null,
          },
        },
      }),
      db.client.count({ where: { paymentStatus: "PAID" } }),
      db.client.count({ where: { paymentStatus: "PENDING" } }),
      db.client.count({ where: { paymentStatus: "OVERDUE" } }),
      db.client.groupBy({
        by: ["subscriptionTier"],
        _count: {
          _all: true,
        },
      }),
    ]);

    return {
      subscriptions: {
        active: activeSubscriptions,
        expired: expiredSubscriptions,
        cancelled: cancelledSubscriptions,
        pending: pendingSubscriptions,
      },
      expiring: {
        in7Days: expiringIn7Days,
        in3Days: expiringIn3Days,
        in1Day: expiringIn1Day,
      },
      payments: {
        paid: paidPayments,
        pending: pendingPayments,
        overdue: overduePayments,
      },
      tierDistribution: tierDistribution
        .filter((t) => t.subscriptionTier !== null)
        .map((t) => ({
          tier: t.subscriptionTier,
          count: t._count._all,
        })),
    };
  } catch (error) {
    console.error("Error fetching subscription health:", error);
    return {
      subscriptions: { active: 0, expired: 0, cancelled: 0, pending: 0 },
      expiring: { in7Days: 0, in3Days: 0, in1Day: 0 },
      payments: { paid: 0, pending: 0, overdue: 0 },
      tierDistribution: [],
    };
  }
}

export async function getDashboardAlerts() {
  try {
    const now = new Date();
    const sevenDaysFromNow = addDays(now, 7);
    const startOfCurrentMonth = startOfMonth(now);

    const [
      expiringSubscriptions,
      overduePayments,
      expiredSubscriptions,
      clientsAtLimit,
    ] = await Promise.all([
      db.client.findMany({
        where: {
          subscriptionStatus: "ACTIVE",
          subscriptionEndDate: {
            gte: startOfDay(now),
            lte: sevenDaysFromNow,
            not: null,
          },
        },
        select: {
          id: true,
          name: true,
          subscriptionEndDate: true,
        },
        orderBy: { subscriptionEndDate: "asc" },
        take: 10,
      }),
      db.client.findMany({
        where: { paymentStatus: "OVERDUE" },
        select: {
          id: true,
          name: true,
          paymentStatus: true,
        },
        take: 10,
      }),
      db.client.findMany({
        where: { subscriptionStatus: "EXPIRED" },
        select: {
          id: true,
          name: true,
          subscriptionStatus: true,
        },
        take: 10,
      }),
      db.client.findMany({
        where: {
          subscriptionStatus: "ACTIVE",
          articlesPerMonth: { not: null },
        },
        select: {
          id: true,
          name: true,
          articlesPerMonth: true,
        },
        take: 20,
      }),
    ]);

    const endOfCurrentMonth = endOfMonth(now);
    
    const clientsAtLimitWithCounts = await Promise.all(
      clientsAtLimit.map(async (client) => {
        const [publishedThisMonth, scheduledThisMonth] = await Promise.all([
          db.article.count({
            where: {
              clientId: client.id,
              status: "PUBLISHED",
              datePublished: {
                gte: startOfCurrentMonth,
                lte: endOfCurrentMonth,
                not: null,
              },
            },
          }),
          db.article.count({
            where: {
              clientId: client.id,
              status: "SCHEDULED",
              scheduledAt: {
                gte: startOfCurrentMonth,
                lte: endOfCurrentMonth,
                not: null,
              },
            },
          }),
        ]);

        const articlesThisMonth = publishedThisMonth + scheduledThisMonth;

        return {
          ...client,
          articlesThisMonth,
          isAtLimit: client.articlesPerMonth
            ? articlesThisMonth >= client.articlesPerMonth
            : false,
        };
      })
    );

    return {
      expiringSubscriptions,
      overduePayments,
      expiredSubscriptions,
      clientsAtLimit: clientsAtLimitWithCounts.filter((c) => c.isAtLimit),
    };
  } catch (error) {
    console.error("Error fetching dashboard alerts:", error);
    return {
      expiringSubscriptions: [],
      overduePayments: [],
      expiredSubscriptions: [],
      clientsAtLimit: [],
    };
  }
}

export async function getMonthlyDeliveryStats() {
  try {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);

    const activeClients = await db.client.findMany({
      where: {
        subscriptionStatus: "ACTIVE",
        articlesPerMonth: { not: null },
      },
      select: {
        id: true,
        name: true,
        articlesPerMonth: true,
      },
    });

    const endOfCurrentMonth = endOfMonth(now);

    const deliveryStats = await Promise.all(
      activeClients.map(async (client) => {
        const [publishedThisMonth, scheduledThisMonth] = await Promise.all([
          db.article.count({
            where: {
              clientId: client.id,
              status: "PUBLISHED",
              datePublished: {
                gte: startOfCurrentMonth,
                lte: endOfCurrentMonth,
                not: null,
              },
            },
          }),
          db.article.count({
            where: {
              clientId: client.id,
              status: "SCHEDULED",
              scheduledAt: {
                gte: startOfCurrentMonth,
                lte: endOfCurrentMonth,
                not: null,
              },
            },
          }),
        ]);

        const articlesThisMonth = publishedThisMonth + scheduledThisMonth;

        return {
          clientId: client.id,
          clientName: client.name,
          articlesPerMonth: client.articlesPerMonth || 0,
          articlesDelivered: articlesThisMonth,
          remaining: Math.max(0, (client.articlesPerMonth || 0) - articlesThisMonth),
          isAtLimit: (client.articlesPerMonth || 0) <= articlesThisMonth,
        };
      })
    );

    const totalDelivered = deliveryStats.reduce(
      (sum, stat) => sum + stat.articlesDelivered,
      0
    );
    const totalLimit = deliveryStats.reduce(
      (sum, stat) => sum + stat.articlesPerMonth,
      0
    );
    const clientsAtLimit = deliveryStats.filter((stat) => stat.isAtLimit).length;

    return {
      stats: deliveryStats.sort((a, b) => b.articlesDelivered - a.articlesDelivered),
      summary: {
        totalDelivered,
        totalLimit,
        clientsAtLimit,
        totalClients: deliveryStats.length,
      },
    };
  } catch (error) {
    console.error("Error fetching monthly delivery stats:", error);
    return {
      stats: [],
      summary: {
        totalDelivered: 0,
        totalLimit: 0,
        clientsAtLimit: 0,
        totalClients: 0,
      },
    };
  }
}

export async function getClientHealth() {
  try {
    const now = new Date();
    const sevenDaysFromNow = addDays(now, 7);
    const thirtyDaysAgo = startOfDay(subDays(now, 30));
    const sixtyDaysAgo = startOfDay(subDays(now, 60));

    const [
      activeClients,
      clientsNeedingAttention,
      topClientsByArticles,
      clientsLastMonth,
      clientsLastPeriod,
    ] = await Promise.all([
      db.client.count({ where: { subscriptionStatus: "ACTIVE" } }),
      db.client.findMany({
        where: {
          OR: [
            {
              subscriptionStatus: "ACTIVE",
              subscriptionEndDate: {
                lte: sevenDaysFromNow,
                not: null,
              },
            },
            { paymentStatus: "OVERDUE" },
            { subscriptionStatus: "EXPIRED" },
          ],
        },
        select: {
          id: true,
          name: true,
          subscriptionStatus: true,
          paymentStatus: true,
          subscriptionEndDate: true,
        },
        take: 10,
      }),
      db.client.findMany({
        select: {
          id: true,
          name: true,
          _count: { select: { articles: true } },
        },
        take: 50,
      }),
      db.client.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      db.client.count({
        where: {
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo,
          },
        },
      }),
    ]);

    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const sortedTopClients = topClientsByArticles
      .sort((a, b) => b._count.articles - a._count.articles)
      .slice(0, 5)
      .map((client) => ({
        id: client.id,
        name: client.name,
        articleCount: client._count.articles,
      }));

    return {
      activeClients,
      clientsNeedingAttention,
      topClientsByArticles: sortedTopClients,
      growthTrend: calculateTrend(clientsLastMonth, clientsLastPeriod),
    };
  } catch (error) {
    console.error("Error fetching client health:", error);
    return {
      activeClients: 0,
      clientsNeedingAttention: [],
      topClientsByArticles: [],
      growthTrend: 0,
    };
  }
}

// TODO: ENHANCEMENT NEEDED - Recent Activity Accuracy
// Currently, "subscription_updated" and "payment_updated" activities are inferred from
// clients with recent `updatedAt` timestamps, which may include updates for other reasons.
// Enhancement: Track actual subscription/payment status changes by:
// 1. Adding an ActivityLog model to track specific events, OR
// 2. Comparing previous vs current status values, OR
// 3. Using dedicated timestamp fields (e.g., subscriptionUpdatedAt, paymentUpdatedAt)
// This will ensure only actual subscription/payment changes appear in the activity feed.
//
// TODO: RECHECK NEEDED - Recent Activity Data Validation
// Verify that all activity data shown is accurate and reflects actual system events.
// Recheck the logic for determining what appears in the activity feed to ensure
// it matches user expectations and business requirements.
export async function getRecentActivity() {
  try {
    const [
      recentArticles,
      recentClients,
      recentSubscriptions,
      recentPayments,
    ] = await Promise.all([
      db.article.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { datePublished: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          datePublished: true,
          client: { select: { name: true } },
        },
      }),
      db.client.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      }),
      db.client.findMany({
        where: {
          OR: [
            { subscriptionStatus: "ACTIVE" },
            { subscriptionStatus: "EXPIRED" },
          ],
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          subscriptionStatus: true,
          subscriptionEndDate: true,
          updatedAt: true,
        },
      }),
      db.client.findMany({
        where: {
          paymentStatus: { in: ["PAID", "OVERDUE"] },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          paymentStatus: true,
          updatedAt: true,
        },
      }),
    ]);

    const activities = [
      ...recentArticles.map((article) => ({
        type: "article_published" as const,
        id: article.id,
        title: article.title,
        clientName: article.client.name,
        timestamp: article.datePublished || new Date(),
        link: `/articles/${article.id}`,
      })),
      ...recentClients.map((client) => ({
        type: "client_created" as const,
        id: client.id,
        title: client.name,
        timestamp: client.createdAt,
        link: `/clients/${client.id}`,
      })),
      ...recentSubscriptions.map((client) => ({
        type: "subscription_updated" as const,
        id: client.id,
        title: client.name,
        status: client.subscriptionStatus,
        timestamp: client.updatedAt,
        link: `/clients/${client.id}`,
      })),
      ...recentPayments.map((client) => ({
        type: "payment_updated" as const,
        id: client.id,
        title: client.name,
        status: client.paymentStatus,
        timestamp: client.updatedAt,
        link: `/clients/${client.id}`,
      })),
    ];

    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return [];
  }
}

export async function getArticlesTrendData() {
  try {
    const now = new Date();
    const sixMonthsAgo = subDays(now, 180);
    
    const articles = await db.article.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          {
            datePublished: {
              gte: sixMonthsAgo,
              not: null,
            },
          },
          {
            datePublished: null,
            createdAt: { gte: sixMonthsAgo },
          },
        ],
      },
      select: {
        datePublished: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const monthlyData: Record<string, number> = {};
    
    articles.forEach((article) => {
      const publishDate = article.datePublished || article.createdAt;
      if (publishDate) {
        const monthKey = format(new Date(publishDate), "MMM yyyy");
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, count]) => {
        try {
          const parsedDate = parse(month, "MMM yyyy", new Date());
          return { month, count, sortDate: parsedDate };
        } catch {
          return { month, count, sortDate: new Date(0) };
        }
      })
      .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
      .map(({ month, count }) => ({ month, count }));
  } catch (error) {
    console.error("Error fetching articles trend data:", error);
    return [];
  }
}

export async function getClientGrowthTrendData() {
  try {
    const now = new Date();
    const sixMonthsAgo = subDays(now, 180);
    
    const clients = await db.client.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const monthlyData: Record<string, number> = {};
    
    clients.forEach((client) => {
      const monthKey = format(new Date(client.createdAt), "MMM yyyy");
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    let cumulative = 0;
    return Object.entries(monthlyData)
      .map(([month, count]) => {
        cumulative += count;
        try {
          const parsedDate = parse(month, "MMM yyyy", new Date());
          return { month, count, cumulative, sortDate: parsedDate };
        } catch {
          return { month, count, cumulative, sortDate: new Date(0) };
        }
      })
      .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
      .map(({ month, count, cumulative }) => ({ month, count, cumulative }));
  } catch (error) {
    console.error("Error fetching client growth trend data:", error);
    return [];
  }
}

export async function getRecentSubscribers() {
  try {
    const subscribers = await db.subscriber.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        client: {
          select: { name: true },
        },
      },
    });

    return subscribers;
  } catch (error) {
    console.error("Error fetching recent subscribers:", error);
    return [];
  }
}

export async function getSubscriberStats() {
  try {
    const [total, active, unsubscribed, byClient] = await Promise.all([
      db.subscriber.count(),
      db.subscriber.count({ where: { subscribed: true } }),
      db.subscriber.count({ where: { subscribed: false } }),
      db.subscriber.groupBy({
        by: ["clientId"],
        _count: true,
      }),
    ]);

    const clientSubscriberCounts = await Promise.all(
      byClient.map(async (item) => {
        const client = await db.client.findUnique({
          where: { id: item.clientId },
          select: { name: true },
        });
        return {
          clientId: item.clientId,
          clientName: client?.name || "Unknown",
          count: item._count,
        };
      })
    );

    return {
      total,
      active,
      unsubscribed,
      byClient: clientSubscriberCounts.sort((a, b) => b.count - a.count),
    };
  } catch (error) {
    console.error("Error fetching subscriber stats:", error);
    return {
      total: 0,
      active: 0,
      unsubscribed: 0,
      byClient: [],
    };
  }
}

export async function getSubscriberGrowthTrendData() {
  try {
    const now = new Date();
    const sixMonthsAgo = subDays(now, 180);
    
    const subscribers = await db.subscriber.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const monthlyData: Record<string, number> = {};
    
    subscribers.forEach((subscriber) => {
      const monthKey = format(new Date(subscriber.createdAt), "MMM yyyy");
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    let cumulative = 0;
    return Object.entries(monthlyData)
      .map(([month, count]) => {
        cumulative += count;
        try {
          const parsedDate = parse(month, "MMM yyyy", new Date());
          return { month, count, cumulative, sortDate: parsedDate };
        } catch {
          return { month, count, cumulative, sortDate: new Date(0) };
        }
      })
      .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
      .map(({ month, count, cumulative }) => ({ month, count, cumulative }));
  } catch (error) {
    console.error("Error fetching subscriber growth trend data:", error);
    return [];
  }
}
