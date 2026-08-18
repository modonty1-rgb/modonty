import { ArticleStatus } from "@prisma/client";

import { db } from "@/lib/db";

/**
 * Published articles OUTSIDE one category — what Modo offers when the visitor's question has
 * wandered away from the article they are reading.
 *
 * Promoted out of the articles route for the same reason as `getArticleForChat`: its only caller
 * is `modo-chat`, and a route may not import from a sibling route.
 */
export async function getArticlesForOutOfScopeSearch(
  excludeCategoryId: string | null,
  limit: number
) {
  const where: Record<string, unknown> = {
    status: ArticleStatus.PUBLISHED,
    OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
  };
  if (excludeCategoryId) {
    where.categoryId = { not: excludeCategoryId };
  }

  return db.article.findMany({
    where,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      client: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true } },
    },
    orderBy: [{ datePublished: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}
