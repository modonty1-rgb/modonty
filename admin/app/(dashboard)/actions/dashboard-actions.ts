"use server";


import { InvoicePaymentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { getClientSubscriptions } from "@/lib/subscription/get-client-subscriptions";
import { subDays, addDays, startOfDay, startOfMonth, endOfMonth, format, parse, startOfWeek } from "date-fns";

import { NOT_INTERNAL } from "../clients/segment/segments";

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


export async function getDashboardAlerts() {
  try {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);

    /**
     * **الانتهاءُ والحصّةُ من الطلب الساري** (٢٣ سبتمبر ٢٠٢٦ — مصدرٌ واحد): كان التنبيهُ يقرأ
     * `subscriptionEndDate` و`subscriptionStatus` و`articlesPerMonth` من الكرت، و«منتهٍ» فيه
     * `status: EXPIRED` لا يكتبه أحد — فكان فارغاً دائماً والمنتهون الحقيقيّون أحد عشر.
     * والحسابُ الداخليّ خارجُ تنبيه التجديد كما كان.
     */
    const [subs, names] = await Promise.all([
      getClientSubscriptions(NOT_INTERNAL, now),
      db.client.findMany({ where: NOT_INTERNAL, select: { id: true, name: true }, take: 5000 }),
    ]);
    const nameOf = new Map(names.map((c) => [c.id, c.name]));
    const all = [...subs.values()];
    const expiringSubscriptions = all
      .filter((s) => s.status === "ACTIVE" && s.daysLeft !== null && s.daysLeft >= 0 && s.daysLeft <= 7)
      .sort((a, b) => (a.endsAt?.getTime() ?? 0) - (b.endsAt?.getTime() ?? 0))
      .slice(0, 10)
      .map((s) => ({ id: s.clientId, name: nameOf.get(s.clientId) ?? "—", subscriptionEndDate: s.endsAt }));
    const expiredSubscriptions = all
      .filter((s) => s.status === "EXPIRED")
      .slice(0, 10)
      .map((s) => ({ id: s.clientId, name: nameOf.get(s.clientId) ?? "—", subscriptionStatus: s.status }));
    const clientsAtLimit = all
      .filter((s) => s.status === "ACTIVE" && s.articlesPerMonth !== null)
      .slice(0, 20)
      .map((s) => ({ id: s.clientId, name: nameOf.get(s.clientId) ?? "—", articlesPerMonth: s.articlesPerMonth }));

    const [overduePayments] = await Promise.all([
      // Clients carrying an outstanding invoice. `Client.paymentStatus` is never written
      // OVERDUE by any code path, so filtering on it listed nobody — the invoices are the
      // truth (same rule as the counter, the Accounts page and the segment).
      db.invoice
        .findMany({
          where: {
            NOT: { paymentStatus: InvoicePaymentStatus.PAID },
            OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
          },
          select: { clientId: true },
          take: 500,
        })
        .then((rows) =>
          db.client.findMany({
            where: { AND: [{ id: { in: [...new Set(rows.map((r) => r.clientId))] } }, NOT_INTERNAL] },
            // سقط `paymentStatus` من الانتقاء (١٧ سبتمبر ٢٠٢٦): الصفُّ مُنتقًى أصلاً
            // لأنّ له فاتورةً غيرَ مسدَّدة، فحقلُ الكرت لا يضيف جواباً — كان يقول
            // «مسدَّد» لهم جميعاً.
            select: { id: true, name: true },
            take: 10,
          })
        ),
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

export async function getVisitorEngagementStats() {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 0 });
    const thirtyDaysAgo = startOfDay(subDays(now, 30));

    const [
      // totals (all time)
      totalLikes,
      totalDislikes,
      totalFavorites,
      totalComments,
      totalReplies,
      totalShares,
      // today
      likesToday,
      dislikesToday,
      favoritesToday,
      commentsToday,
      sharesToday,
      // this week
      likesWeek,
      dislikesWeek,
      favoritesWeek,
      commentsWeek,
      sharesWeek,
      // shares by platform (last 30 days)
      sharesByPlatform,
      // top shared article (last 30 days)
      topSharedArticles,
    ] = await Promise.all([
      db.articleLike.count(),
      db.articleDislike.count(),
      db.articleFavorite.count(),
      db.comment.count({ where: { status: "APPROVED", parentId: null } }),
      db.comment.count({ where: { status: "APPROVED", parentId: { not: null } } }),
      db.share.count(),
      // today
      db.articleLike.count({ where: { createdAt: { gte: todayStart } } }),
      db.articleDislike.count({ where: { createdAt: { gte: todayStart } } }),
      db.articleFavorite.count({ where: { createdAt: { gte: todayStart } } }),
      db.comment.count({ where: { createdAt: { gte: todayStart }, parentId: null } }),
      db.share.count({ where: { createdAt: { gte: todayStart } } }),
      // this week
      db.articleLike.count({ where: { createdAt: { gte: weekStart } } }),
      db.articleDislike.count({ where: { createdAt: { gte: weekStart } } }),
      db.articleFavorite.count({ where: { createdAt: { gte: weekStart } } }),
      db.comment.count({ where: { createdAt: { gte: weekStart }, parentId: null } }),
      db.share.count({ where: { createdAt: { gte: weekStart } } }),
      // platform breakdown
      db.share.groupBy({
        by: ["platform"],
        _count: { _all: true },
        where: { createdAt: { gte: thirtyDaysAgo } },
        orderBy: { _count: { platform: "desc" } },
      }),
      // top shared articles (last 30 days)
      db.share.groupBy({
        by: ["articleId"],
        _count: { _all: true },
        where: { articleId: { not: null }, createdAt: { gte: thirtyDaysAgo } },
        orderBy: { _count: { articleId: "desc" } },
        take: 3,
      }),
    ]);

    // Resolve article titles for top shared
    const topSharedWithTitles = await Promise.all(
      topSharedArticles
        .filter((s) => s.articleId !== null)
        .map(async (s) => {
          const article = await db.article.findUnique({
            where: { id: s.articleId! },
            select: { id: true, title: true },
          });
          return { articleId: s.articleId!, title: article?.title ?? "Unknown", count: s._count._all };
        })
    );

    return {
      totals: { likes: totalLikes, dislikes: totalDislikes, favorites: totalFavorites, comments: totalComments, replies: totalReplies, shares: totalShares },
      today: { likes: likesToday, dislikes: dislikesToday, favorites: favoritesToday, comments: commentsToday, shares: sharesToday },
      week: { likes: likesWeek, dislikes: dislikesWeek, favorites: favoritesWeek, comments: commentsWeek, shares: sharesWeek },
      sharesByPlatform: sharesByPlatform.map((s) => ({ platform: s.platform, count: s._count._all })),
      topSharedArticles: topSharedWithTitles,
    };
  } catch (error) {
    console.error("Error fetching visitor engagement stats:", error);
    return {
      totals: { likes: 0, dislikes: 0, favorites: 0, comments: 0, replies: 0, shares: 0 },
      today: { likes: 0, dislikes: 0, favorites: 0, comments: 0, shares: 0 },
      week: { likes: 0, dislikes: 0, favorites: 0, comments: 0, shares: 0 },
      sharesByPlatform: [],
      topSharedArticles: [],
    };
  }
}

export async function getEngagementQueue() {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 0 });
    const yesterday = startOfDay(subDays(now, 1));

    const [
      pendingComments,
      newContactMessages,
      pendingFAQsAudience,
      pendingFAQsTeam,
      viewsToday,
      viewsYesterday,
      viewsThisWeek,
      recentPendingComments,
      recentContactMessages,
      recentPendingFAQs,
    ] = await Promise.all([
      // counts
      db.comment.count({ where: { status: "PENDING" } }),
      db.contactMessage.count({ where: { status: "new" } }),
      // سؤال القارئ وسؤال الفريق صنفان لا صنف. العدّ الواحد كان يخلطهما فيقول «643
      // ينتظر ردّك» بينما القرّاء اثنان — رقمٌ يُتجاهَل لأنه دائماً هائل، فيضيع فيه
      // السؤال الحقيقي. مقيس على modonty_dev ٢٩ أغسطس: manual 641 · user 2.
      db.articleFAQ.count({ where: { status: "PENDING", source: { in: ["user", "chatbot"] } } }),
      db.articleFAQ.count({ where: { status: "PENDING", source: { notIn: ["user", "chatbot"] } } }),
      db.articleView.count({ where: { createdAt: { gte: todayStart } } }),
      db.articleView.count({ where: { createdAt: { gte: yesterday, lt: todayStart } } }),
      db.articleView.count({ where: { createdAt: { gte: weekStart } } }),
      // recent items for preview
      db.comment.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          content: true,
          createdAt: true,
          author: { select: { name: true } },
          article: { select: { id: true, title: true } },
        },
      }),
      db.contactMessage.findMany({
        where: { status: "new" },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          name: true,
          subject: true,
          createdAt: true,
        },
      }),
      db.articleFAQ.findMany({
        // المعاينة تحت عدّاد الجمهور، فتتبعه: لا تعرض سؤالاً كتبه الفريق.
        where: { status: "PENDING", source: { in: ["user", "chatbot"] } },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          question: true,
          createdAt: true,
          articleId: true,
        },
      }).then(async (faqs) => {
        if (faqs.length === 0) return [];
        const articleIds = faqs.map((f) => f.articleId);
        const articles = await db.article.findMany({
          where: { id: { in: articleIds } },
          select: { id: true, title: true },
        });
        const articleMap = new Map(articles.map((a) => [a.id, a]));
        return faqs
          .filter((f) => articleMap.has(f.articleId))
          .map((f) => ({
            id: f.id,
            question: f.question,
            createdAt: f.createdAt,
            article: articleMap.get(f.articleId)!,
          }));
      }),
    ]);

    const viewsTrend = viewsYesterday > 0
      ? Math.round(((viewsToday - viewsYesterday) / viewsYesterday) * 100)
      : viewsToday > 0 ? 100 : 0;

    return {
      pendingComments,
      newContactMessages,
      pendingFAQsAudience,
      pendingFAQsTeam,
      views: { today: viewsToday, yesterday: viewsYesterday, thisWeek: viewsThisWeek, trend: viewsTrend },
      recentPendingComments,
      recentContactMessages,
      recentPendingFAQs,
    };
  } catch (error) {
    console.error("Error fetching engagement queue:", error);
    return {
      pendingComments: 0,
      newContactMessages: 0,
      pendingFAQsAudience: 0,
      pendingFAQsTeam: 0,
      views: { today: 0, yesterday: 0, thisWeek: 0, trend: 0 },
      recentPendingComments: [],
      recentContactMessages: [],
      recentPendingFAQs: [],
    };
  }
}
