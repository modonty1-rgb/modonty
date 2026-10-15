"use server";

import { db } from "@/lib/db";
import { CommentStatus } from "@prisma/client";

export async function recalculateArticleCounts(): Promise<{
  success: boolean;
  articlesUpdated?: number;
  error?: string;
}> {
  try {
    const [likeGroups, dislikeGroups, favoriteGroups, commentGroups, viewGroups, articles] =
      await Promise.all([
        db.articleLike.groupBy({ by: ["articleId"], _count: true }),
        db.articleDislike.groupBy({ by: ["articleId"], _count: true }),
        db.articleFavorite.groupBy({ by: ["articleId"], _count: true }),
        db.comment.groupBy({
          by: ["articleId"],
          where: { status: CommentStatus.APPROVED },
          _count: true,
        }),
        db.articleView.groupBy({ by: ["articleId"], _count: true }),
        db.article.findMany({ select: { id: true } }),
      ]);

    const toMap = (groups: { articleId: string; _count: number }[]) =>
      Object.fromEntries(groups.map((g) => [g.articleId, g._count]));

    const likesMap = toMap(likeGroups);
    const dislikesMap = toMap(dislikeGroups);
    const favoritesMap = toMap(favoriteGroups);
    const commentsMap = toMap(commentGroups);
    const viewsMap = toMap(viewGroups);

    // One Mongo command for every article, not one `update` call each racing for a pool
    // connection (N+1 found 15 Oct 2026 — 348 concurrent writes on modonty_dev; Atlas
    // connection exhaustion from exactly this shape is a documented past incident).
    // Same `$runCommandRaw` batched-update pattern already used in
    // database/actions/prune-dead-meta-tags.ts.
    if (articles.length) {
      await db.$runCommandRaw({
        update: "articles",
        ordered: false,
        updates: articles.map((article) => ({
          q: { _id: { $oid: article.id } },
          u: {
            $set: {
              likesCount: likesMap[article.id] ?? 0,
              dislikesCount: dislikesMap[article.id] ?? 0,
              favoritesCount: favoritesMap[article.id] ?? 0,
              commentsCount: commentsMap[article.id] ?? 0,
              viewsCount: viewsMap[article.id] ?? 0,
            },
          },
        })),
      });
    }

    return { success: true, articlesUpdated: articles.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Recalculation failed";
    return { success: false, error: message };
  }
}
