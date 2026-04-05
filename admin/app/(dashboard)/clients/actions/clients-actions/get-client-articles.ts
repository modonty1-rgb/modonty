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

    const viewsMap = articleIds.length > 0
      ? new Map(
          (await db.analytics.groupBy({
            by: ["articleId"],
            where: { articleId: { in: articleIds } },
            _count: { id: true },
          })).map((v) => [v.articleId, v._count.id])
        )
      : new Map<string, number>();

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
  } catch (error) {
    console.error("Error fetching client articles:", error);
    return [];
  }
}

