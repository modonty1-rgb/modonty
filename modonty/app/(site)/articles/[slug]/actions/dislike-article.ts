"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

import { isPublicArticle } from "@/lib/articles/is-public-article";
import { fireEngagement } from "@/lib/articles/fire-engagement";

export async function dislikeArticle(articleId: string, articleSlug: string) {
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

    const existing = await db.articleDislike.findFirst({
      where: { articleId, userId },
      select: { id: true },
    });

    let updated;
    if (existing) {
      // Undislike: remove dislike, decrement counter
      await db.articleDislike.delete({ where: { id: existing.id } }).catch(() => {});
      updated = await db.article.update({
        where: { id: articleId },
        data: { dislikesCount: { decrement: 1 } },
        select: { likesCount: true, dislikesCount: true },
      });
    } else {
      // Dislike: remove any existing like, create dislike, update counters
      const existingLike = await db.articleLike.findFirst({
        where: { articleId, userId },
        select: { id: true },
      });
      await db.articleLike.deleteMany({ where: { articleId, userId } });
      await db.articleDislike.create({
        data: { articleId, userId, sessionId: `user:${userId}` },
      }).catch((e: unknown) => {
        const err = e as { code?: string; message?: string };
        const isUnique = err?.code === "P2002" || (typeof err?.message === "string" && err.message.includes("Unique constraint failed"));
        if (!isUnique) throw e;
      });
      updated = await db.article.update({
        where: { id: articleId },
        data: {
          dislikesCount: { increment: 1 },
          ...(existingLike ? { likesCount: { decrement: 1 } } : {}),
        },
        select: { likesCount: true, dislikesCount: true },
      });
    }

    revalidatePath(`/articles/${articleSlug}`);
    if (!existing) {
      fireEngagement(articleId, "articleDislike", "article_dislike", { id: userId, name: session.user.name ?? null });
    }
    return {
      success: true,
      data: { likes: updated.likesCount, dislikes: updated.dislikesCount, disliked: !existing },
    };
  } catch {
    return { success: false, error: "Failed to update dislike" };
  }
}
