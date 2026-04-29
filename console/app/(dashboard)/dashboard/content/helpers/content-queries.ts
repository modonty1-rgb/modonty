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

/**
 * Aggregate stats for the Content overview page:
 *  - Total published all-time
 *  - Pipeline (counts by status: DRAFT / WRITING / SCHEDULED)
 *  - Latest 5 published articles with category + date
 *  - Next scheduled article (if any)
 */
export async function getContentOverview(clientId: string) {
  const [totalPublished, pipelineCounts, latest, nextScheduled] = await Promise.all([
    db.article.count({
      where: { clientId, status: ArticleStatus.PUBLISHED },
    }),
    db.article.groupBy({
      by: ["status"],
      where: { clientId },
      _count: { _all: true },
    }),
    db.article.findMany({
      where: { clientId, status: ArticleStatus.PUBLISHED },
      select: {
        id: true,
        title: true,
        slug: true,
        datePublished: true,
        category: { select: { name: true } },
        featuredImage: { select: { url: true, altText: true } },
      },
      orderBy: { datePublished: "desc" },
      take: 5,
    }),
    db.article.findFirst({
      where: {
        clientId,
        status: ArticleStatus.SCHEDULED,
        datePublished: { gt: new Date() },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        datePublished: true,
      },
      orderBy: { datePublished: "asc" },
    }),
  ]);

  // Map pipeline status counts → object
  const pipeline = {
    draft: 0,
    writing: 0,
    scheduled: 0,
  };
  for (const row of pipelineCounts) {
    const s = row.status;
    if (s === "DRAFT") pipeline.draft = row._count._all;
    else if (s === "WRITING") pipeline.writing = row._count._all;
    else if (s === "SCHEDULED") pipeline.scheduled = row._count._all;
  }

  return {
    totalPublished,
    pipeline,
    latest,
    nextScheduled,
  };
}
