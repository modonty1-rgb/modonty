"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

import { isPublicArticle } from "./is-public-article";
import { fireEngagement } from "./fire-engagement";

export async function favoriteArticle(articleId: string, articleSlug: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    // An article that belongs to a client's own website is not ours to collect
    // interactions for — see assert-public-article.ts.
    if (!(await isPublicArticle(articleId))) {
      return { success: false, error: "Article not found" };
    }

    const existing = await db.articleFavorite.findFirst({
      where: { articleId, userId },
      select: { id: true },
    });

    let updated;
    if (existing) {
      await db.articleFavorite.delete({ where: { id: existing.id } }).catch(() => {});
      updated = await db.article.update({
        where: { id: articleId },
        data: { favoritesCount: { decrement: 1 } },
        select: { favoritesCount: true },
      });
    } else {
      await db.articleFavorite.create({
        data: { articleId, userId },
      }).catch((e: unknown) => {
        const err = e as { code?: string; message?: string };
        const isUnique = err?.code === "P2002" || (typeof err?.message === "string" && err.message.includes("Unique constraint failed"));
        if (!isUnique) throw e;
      });
      updated = await db.article.update({
        where: { id: articleId },
        data: { favoritesCount: { increment: 1 } },
        select: { favoritesCount: true },
      });
    }

    revalidatePath(`/articles/${articleSlug}`);
    if (!existing) {
      fireEngagement(articleId, "articleFavorite", "article_favorite", { id: userId, name: session.user.name ?? null });
    }
    return {
      success: true,
      data: { favorites: updated.favoritesCount, favorited: !existing },
    };
  } catch {
    return { success: false, error: "Failed to update favorite" };
  }
}
