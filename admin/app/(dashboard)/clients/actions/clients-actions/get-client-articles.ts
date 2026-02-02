"use server";

import { db } from "@/lib/db";

export async function getClientArticles(clientId: string) {
  try {
    const articles = await db.article.findMany({
      where: {
        clientId,
      },
      include: {
        category: { select: { name: true } },
        author: { select: { name: true } },
      },
      orderBy: [
        { datePublished: "desc" },
        { createdAt: "desc" },
      ],
    });

    const articleIds = articles.map((a) => a.id);

    if (articleIds.length > 0) {
      const viewsCounts = await db.analytics.groupBy({
        by: ["articleId"],
        where: {
          articleId: { in: articleIds },
        },
        _count: {
          id: true,
        },
      });

      const viewsMap = new Map(viewsCounts.map((v) => [v.articleId, v._count.id]));

      return articles.map((article) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        status: article.status,
        createdAt: article.createdAt,
        datePublished: article.datePublished,
        scheduledAt: article.scheduledAt,
        category: article.category,
        author: article.author,
        views: viewsMap.get(article.id) || 0,
      }));
    }

    return articles.map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      status: article.status,
      createdAt: article.createdAt,
      datePublished: article.datePublished,
      scheduledAt: article.scheduledAt,
      category: article.category,
      author: article.author,
      views: 0,
    }));
  } catch (error) {
    console.error("Error fetching client articles:", error);
    return [];
  }
}

