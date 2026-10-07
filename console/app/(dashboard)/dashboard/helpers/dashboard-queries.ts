import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";

export interface TrafficSourceData {
  source: string;
  count: number;
  percentage: number;
}

interface RecentActivity {
  type: "article" | "conversion" | "comment" | "subscriber";
  title: string;
  description: string;
  timestamp: Date;
}

export async function getTrafficSources(
  clientId: string,
  days: number = 30
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
