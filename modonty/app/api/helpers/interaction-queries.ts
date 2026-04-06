/**
 * Interaction database query helpers
 * Used by API routes and Server Components
 */

import { db } from "@/lib/db";
import type { InteractionCounts } from "@/lib/types";

export async function getArticleInteractions(articleId: string): Promise<InteractionCounts> {
  const [counts, viewCount] = await Promise.all([
    db.article.findUnique({
      where: { id: articleId },
      select: {
        _count: {
          select: {
            likes: true,
            dislikes: true,
            favorites: true,
            comments: true,
          },
        },
      },
    }),
    db.articleView.count({
      where: { articleId },
    }),
  ]);

  if (!counts) {
    return {
      likes: 0,
      dislikes: 0,
      comments: 0,
      favorites: 0,
      views: viewCount,
    };
  }

  return {
    likes: counts._count.likes || 0,
    dislikes: counts._count.dislikes || 0,
    comments: counts._count.comments || 0,
    favorites: counts._count.favorites || 0,
    views: viewCount,
  };
}

export async function getInteractionsCounts(articleIds: string[]): Promise<Record<string, InteractionCounts>> {
  if (articleIds.length === 0) {
    return {};
  }

  const [articles, viewCounts] = await Promise.all([
    db.article.findMany({
      where: {
        id: {
          in: articleIds,
        },
      },
      select: {
        id: true,
        _count: {
          select: {
            likes: true,
            dislikes: true,
            favorites: true,
            comments: true,
          },
        },
      },
    }),
    db.articleView.groupBy({
      by: ["articleId"],
      where: {
        articleId: {
          in: articleIds,
        },
      },
      _count: true,
    }),
  ]);

  const viewCountMap: Record<string, number> = {};
  viewCounts.forEach((vc) => {
    viewCountMap[vc.articleId] = vc._count;
  });

  const result: Record<string, InteractionCounts> = {};

  articles.forEach((article) => {
    result[article.id] = {
      likes: article._count.likes || 0,
      dislikes: article._count.dislikes || 0,
      comments: article._count.comments || 0,
      favorites: article._count.favorites || 0,
      views: viewCountMap[article.id] || 0,
    };
  });

  // Ensure all requested IDs have a result (even if 0 counts)
  articleIds.forEach((id) => {
    if (!result[id]) {
      result[id] = {
        likes: 0,
        dislikes: 0,
        comments: 0,
        favorites: 0,
        views: 0,
      };
    }
  });

  return result;
}
