import "server-only";

import { ArticleStatus } from "@prisma/client";

import { db } from "@/lib/db";

const MAX_SCOPE_ARTICLES = 30;

/** Published articles in a category — the corpus for a category-scoped answer. */
export async function getCategoryScopeArticles(categoryId: string) {
  return db.article.findMany({
    where: {
      categoryId,
      status: ArticleStatus.PUBLISHED,
      OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      // `content` is deliberately NOT selected: chunk embeddings are cached, and shipping
      // 30 full article bodies into every request was hundreds of kilobytes the answer
      // never read. Bodies load lazily, only for articles whose cache is cold.
      client: { select: { name: true, slug: true, ctaMode: true } },
    },
    orderBy: [{ datePublished: "desc" }, { createdAt: "desc" }],
    take: MAX_SCOPE_ARTICLES,
  });
}
