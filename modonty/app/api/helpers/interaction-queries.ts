/**
 * Interaction database query helpers
 * Used by API routes and Server Components
 */

import { db } from "@/lib/db";
import type { InteractionCounts } from "./types";

export async function getArticleInteractions(articleId: string): Promise<InteractionCounts> {
  const counts = await db.article.findUnique({
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
  });

  if (!counts) {
    return {
      likes: 0,
      dislikes: 0,
      comments: 0,
      favorites: 0,
      views: 0,
    };
  }

  return {
    likes: counts._count.likes || 0,
    dislikes: counts._count.dislikes || 0,
    comments: counts._count.comments || 0,
    favorites: counts._count.favorites || 0,
    views: 0,
  };
}

export async function getInteractionsCounts(articleIds: string[]): Promise<Record<string, InteractionCounts>> {
  if (articleIds.length === 0) {
    return {};
  }

  const articles = await db.article.findMany({
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
  });

  const result: Record<string, InteractionCounts> = {};

  articles.forEach((article) => {
    result[article.id] = {
      likes: article._count.likes || 0,
      dislikes: article._count.dislikes || 0,
      comments: article._count.comments || 0,
      favorites: article._count.favorites || 0,
      views: 0,
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
