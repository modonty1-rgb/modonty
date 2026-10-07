import "server-only";

import { ArticleStatus } from "@prisma/client";

import { db } from "@/lib/db";

const SIBLING_CANDIDATES = 15;

/** Published articles in the same category, minus the one being read — the reranker's candidates. */
export async function getSiblingArticles(categoryId: string, excludeArticleId: string) {
  return db.article.findMany({
    where: {
      categoryId,
      id: { not: excludeArticleId },
      status: ArticleStatus.PUBLISHED,
      OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      client: { select: { name: true, slug: true } },
    },
    orderBy: [{ datePublished: "desc" }, { createdAt: "desc" }],
    take: SIBLING_CANDIDATES,
  });
}
