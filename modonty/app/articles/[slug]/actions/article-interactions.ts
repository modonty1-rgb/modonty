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

    const existingLike = await db.articleLike.findUnique({
      where: {
        articleId_userId: {
          articleId,
          userId,
        },
      },
    });

    if (existingLike) {
      await db.articleLike.delete({
        where: {
          articleId_userId: {
            articleId,
            userId,
          },
        },
      });
    } else {
      await db.articleDislike.deleteMany({
        where: {
          articleId,
          userId,
        },
      });
      try {
        await db.articleLike.create({
          data: {
            articleId,
            userId,
          },
        });
      } catch (e: unknown) {
        const err = e as { code?: string; message?: string };
        const isUniqueViolation = err?.code === "P2002" || (typeof err?.message === "string" && err.message.includes("Unique constraint failed"));
        if (!isUniqueViolation) throw e;
      }
    }

    const [likes, dislikes] = await Promise.all([
      db.articleLike.count({ where: { articleId } }),
      db.articleDislike.count({ where: { articleId } }),
    ]);

    revalidatePath(`/articles/${articleSlug}`);

    return {
      success: true,
      data: { likes, dislikes, liked: !existingLike },
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

    const existingDislike = await db.articleDislike.findUnique({
      where: {
        articleId_userId: {
          articleId,
          userId,
        },
      },
    });

    if (existingDislike) {
      await db.articleDislike.delete({
        where: {
          articleId_userId: {
            articleId,
            userId,
          },
        },
      });
    } else {
      await db.articleLike.deleteMany({
        where: {
          articleId,
          userId,
        },
      });
      try {
        await db.articleDislike.create({
          data: {
            articleId,
            userId,
          },
        });
      } catch (e: unknown) {
        const err = e as { code?: string; message?: string };
        const isUniqueViolation = err?.code === "P2002" || (typeof err?.message === "string" && err.message.includes("Unique constraint failed"));
        if (!isUniqueViolation) throw e;
      }
    }

    const [likes, dislikes] = await Promise.all([
      db.articleLike.count({ where: { articleId } }),
      db.articleDislike.count({ where: { articleId } }),
    ]);

    revalidatePath(`/articles/${articleSlug}`);

    return {
      success: true,
      data: { likes, dislikes, disliked: !existingDislike },
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

    const existingFavorite = await db.articleFavorite.findUnique({
      where: {
        articleId_userId: {
          articleId,
          userId,
        },
      },
    });

    if (existingFavorite) {
      await db.articleFavorite.delete({
        where: {
          articleId_userId: {
            articleId,
            userId,
          },
        },
      });
    } else {
      await db.articleFavorite.create({
        data: {
          articleId,
          userId,
        },
      });
    }

    const favorites = await db.articleFavorite.count({ where: { articleId } });

    revalidatePath(`/articles/${articleSlug}`);

    return {
      success: true,
      data: { favorites, favorited: !existingFavorite },
    };
  } catch (error) {
    return { success: false, error: "Failed to update favorite" };
  }
}
