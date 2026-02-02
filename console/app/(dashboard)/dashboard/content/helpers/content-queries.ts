import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";

export async function getClientArticles(clientId: string, limit = 50) {
  return db.article.findMany({
    where: { clientId },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      datePublished: true,
      createdAt: true,
      category: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getMonthlyArticleCount(clientId: string) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);

  return db.article.count({
    where: {
      clientId,
      createdAt: { gte: start },
      status: ArticleStatus.PUBLISHED,
    },
  });
}
