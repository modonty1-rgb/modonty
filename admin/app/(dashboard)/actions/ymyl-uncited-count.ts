"use server";

import { unstable_cache } from "next/cache";

import { db } from "@/lib/db";
import { getArticleSegment } from "../articles/segment/segments";

/**
 * Count of medical (YMYL) articles with an empty citations list — the same `where`
 * the /articles/segment/ymyl-uncited list uses, so the dashboard number and the rows
 * behind it can never disagree. Cached 60s; shares the article-status-counts tag so
 * article mutations invalidate it.
 */
export const getYmylUncitedCount = unstable_cache(
  async (): Promise<number> => {
    const segment = getArticleSegment("ymyl-uncited");
    if (!segment) return 0;
    return db.article.count({ where: segment.where });
  },
  ["ymyl-uncited-count"],
  { revalidate: 60, tags: ["article-status-counts"] },
);
