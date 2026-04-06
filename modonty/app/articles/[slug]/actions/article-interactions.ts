"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function likeArticle(articleId: string, articleSlug: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    // Check-exists-first pattern to avoid race conditions
    const existing = await db.articleLike.findFirst({
      where: { articleId, userId },
      select: { id: true },
    });

    if (existing) {
      await db.articleLike.delete({ where: { id: existing.id } }).catch(() => {
        // Already deleted by concurrent request — safe to ignore
      });
    } else {
      await db.articleDislike.deleteMany({ where: { articleId, userId } });
      await db.articleLike.create({
        data: { articleId, userId, sessionId: `user:${userId}` },
      }).catch((e: unknown) => {
        const err = e as { code?: string; message?: string };
        const isUniqueViolation = err?.code === "P2002" || (typeof err?.message === "string" && err.message.includes("Unique constraint failed"));
        if (!isUniqueViolation) throw e;
      });
    }

    const [likes, dislikes] = await Promise.all([
      db.articleLike.count({ where: { articleId } }),
      db.articleDislike.count({ where: { articleId } }),
    ]);

    revalidatePath(`/articles/${articleSlug}`);

    return {
      success: true,
      data: { likes, dislikes, liked: !existing },
    };
  } catch (error) {
    return { success: false, error: "Failed to update like" };
  }
}

export async function dislikeArticle(articleId: string, articleSlug: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    // Check-exists-first pattern to avoid race conditions
    const existing = await db.articleDislike.findFirst({
      where: { articleId, userId },
      select: { id: true },
    });

    if (existing) {
      await db.articleDislike.delete({ where: { id: existing.id } }).catch(() => {
        // Already deleted by concurrent request — safe to ignore
      });
    } else {
      await db.articleLike.deleteMany({ where: { articleId, userId } });
      await db.articleDislike.create({
        data: { articleId, userId, sessionId: `user:${userId}` },
      }).catch((e: unknown) => {
        const err = e as { code?: string; message?: string };
        const isUniqueViolation = err?.code === "P2002" || (typeof err?.message === "string" && err.message.includes("Unique constraint failed"));
        if (!isUniqueViolation) throw e;
      });
    }

    const [likes, dislikes] = await Promise.all([
      db.articleLike.count({ where: { articleId } }),
      db.articleDislike.count({ where: { articleId } }),
    ]);

    revalidatePath(`/articles/${articleSlug}`);

    return {
      success: true,
      data: { likes, dislikes, disliked: !existing },
    };
  } catch (error) {
    return { success: false, error: "Failed to update dislike" };
  }
}

export async function favoriteArticle(articleId: string, articleSlug: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    // Check-exists-first pattern to avoid race conditions
    const existing = await db.articleFavorite.findFirst({
      where: { articleId, userId },
      select: { id: true },
    });

    if (existing) {
      await db.articleFavorite.delete({ where: { id: existing.id } }).catch(() => {
        // Already deleted by concurrent request — safe to ignore
      });
    } else {
      await db.articleFavorite.create({
        data: { articleId, userId },
      }).catch((e: unknown) => {
        const err = e as { code?: string; message?: string };
        const isUniqueViolation = err?.code === "P2002" || (typeof err?.message === "string" && err.message.includes("Unique constraint failed"));
        if (!isUniqueViolation) throw e;
      });
    }

    const favorites = await db.articleFavorite.count({ where: { articleId } });

    revalidatePath(`/articles/${articleSlug}`);

    return {
      success: true,
      data: { favorites, favorited: !existing },
    };
  } catch (error) {
    return { success: false, error: "Failed to update favorite" };
  }
}
