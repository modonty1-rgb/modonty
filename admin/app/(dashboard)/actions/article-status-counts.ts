"use server";

import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";

export type ArticleStatusCounts = Record<ArticleStatus, number>;

/**
 * Returns the number of articles per ArticleStatus across ALL clients.
 * Cached for 60s with tag "article-status-counts" so mutations
 * (publish / approve / archive) can invalidate via `revalidateTag`.
 */
export const getArticleStatusCounts = unstable_cache(
  async (): Promise<ArticleStatusCounts> => {
    const grouped = await db.article.groupBy({
      by: ["status"],
      _count: { _all: true },
    });

    const result: ArticleStatusCounts = {
      WRITING: 0,
      DRAFT: 0,
      AWAITING_APPROVAL: 0,
      NEEDS_REVISION: 0,
      SCHEDULED: 0,
      PUBLISHED: 0,
      ARCHIVED: 0,
    };

    for (const row of grouped) {
      result[row.status] = row._count._all;
    }

    return result;
  },
  ["article-status-counts"],
  { revalidate: 60, tags: ["article-status-counts"] },
);
