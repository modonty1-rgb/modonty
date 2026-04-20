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

    await Promise.all(
      articles.map((article) =>
        db.article.update({
          where: { id: article.id },
          data: {
            likesCount: likesMap[article.id] ?? 0,
            dislikesCount: dislikesMap[article.id] ?? 0,
            favoritesCount: favoritesMap[article.id] ?? 0,
            commentsCount: commentsMap[article.id] ?? 0,
            viewsCount: viewsMap[article.id] ?? 0,
          },
          select: { id: true },
        })
      )
    );

    return { success: true, articlesUpdated: articles.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Recalculation failed";
    return { success: false, error: message };
  }
}
