/**
 * Interaction database query helpers
 * Used by API routes and Server Components
 */

import { db } from "@/lib/db";
import type { InteractionCounts } from "@/lib/types";

export async function getArticleInteractions(articleId: string): Promise<InteractionCounts> {
  const article = await db.article.findUnique({
    where: { id: articleId },
    select: {
      likesCount: true,
      dislikesCount: true,
      commentsCount: true,
      favoritesCount: true,
      viewsCount: true,
    },
  });

  if (!article) {
    return { likes: 0, dislikes: 0, comments: 0, favorites: 0, views: 0 };
  }

  return {
    likes: article.likesCount || 0,
    dislikes: article.dislikesCount || 0,
    comments: article.commentsCount || 0,
    favorites: article.favoritesCount || 0,
    views: article.viewsCount || 0,
  };
}

export async function getInteractionsCounts(articleIds: string[]): Promise<Record<string, InteractionCounts>> {
  if (articleIds.length === 0) {
    return {};
  }

  const articles = await db.article.findMany({
    where: { id: { in: articleIds } },
    select: {
      id: true,
      likesCount: true,
      dislikesCount: true,
      commentsCount: true,
      favoritesCount: true,
      viewsCount: true,
    },
  });

  const result: Record<string, InteractionCounts> = {};

  articles.forEach((article) => {
    result[article.id] = {
      likes: article.likesCount || 0,
      dislikes: article.dislikesCount || 0,
      comments: article.commentsCount || 0,
      favorites: article.favoritesCount || 0,
      views: article.viewsCount || 0,
    };
  });

  articleIds.forEach((id) => {
    if (!result[id]) {
      result[id] = { likes: 0, dislikes: 0, comments: 0, favorites: 0, views: 0 };
    }
  });

  return result;
}
