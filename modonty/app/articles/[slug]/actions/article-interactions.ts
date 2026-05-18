"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { notifyTelegram } from "@/lib/telegram/notify";
import type { TelegramEventKey } from "@/lib/telegram/events";
import {
  trackArticleLike,
  trackArticleDislike,
  trackArticleFavorite,
} from "@/lib/analytics/events-registry";

type ArticleGA4EventName = "article_like" | "article_dislike" | "article_favorite";

function fireEngagement(
  articleId: string,
  telegramKey: TelegramEventKey,
  ga4EventName: ArticleGA4EventName,
  actor: { id?: string; name: string | null },
): void {
  db.article
    .findUnique({
      where: { id: articleId },
      select: {
        clientId: true,
        title: true,
        slug: true,
        client: { select: { slug: true, name: true, industry: { select: { name: true } } } },
        author: { select: { id: true, name: true } },
        category: { select: { slug: true, name: true } },
        tags: { select: { tag: { select: { name: true } } }, take: 1 },
      },
    })
    .then((art) => {
      if (!art) return;
      if (art.clientId) {
        notifyTelegram(art.clientId, telegramKey, {
          title: art.title,
          meta: actor.name ? { من: actor.name } : undefined,
        });
      }
      const params = {
        article_id: articleId,
        article_slug: art.slug,
        article_title: art.title.slice(0, 100),
        author_id: art.author?.id,
        author_name: art.author?.name ?? undefined,
        category_slug: art.category?.slug,
        category_name: art.category?.name,
        tag_primary: art.tags[0]?.tag?.name,
        client_id: art.clientId ?? undefined,
        client_slug: art.client?.slug,
        client_name: art.client?.name,
        client_industry: art.client?.industry?.name,
      };
      const options = actor.id ? { userId: actor.id } : undefined;
      if (ga4EventName === "article_like") void trackArticleLike(params, options);
      else if (ga4EventName === "article_dislike") void trackArticleDislike(params, options);
      else void trackArticleFavorite(params, options);
    })
    .catch(() => {});
}

export async function likeArticle(articleId: string, articleSlug: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    const existing = await db.articleLike.findFirst({
      where: { articleId, userId },
      select: { id: true },
    });

    let updated;
    if (existing) {
      // Unlike: remove like, decrement counter
      await db.articleLike.delete({ where: { id: existing.id } }).catch(() => {});
      updated = await db.article.update({
        where: { id: articleId },
        data: { likesCount: { decrement: 1 } },
        select: { likesCount: true, dislikesCount: true },
      });
    } else {
      // Like: remove any existing dislike, create like, update counters
      const existingDislike = await db.articleDislike.findFirst({
        where: { articleId, userId },
        select: { id: true },
      });
      await db.articleDislike.deleteMany({ where: { articleId, userId } });
      await db.articleLike.create({
        data: { articleId, userId, sessionId: `user:${userId}` },
      }).catch((e: unknown) => {
        const err = e as { code?: string; message?: string };
        const isUnique = err?.code === "P2002" || (typeof err?.message === "string" && err.message.includes("Unique constraint failed"));
        if (!isUnique) throw e;
      });
      updated = await db.article.update({
        where: { id: articleId },
        data: {
          likesCount: { increment: 1 },
          ...(existingDislike ? { dislikesCount: { decrement: 1 } } : {}),
        },
        select: { likesCount: true, dislikesCount: true },
      });
    }

    revalidatePath(`/articles/${articleSlug}`);
    if (!existing) {
      fireEngagement(articleId, "articleLike", "article_like", { id: userId, name: session.user.name ?? null });
    }
    return {
      success: true,
      data: { likes: updated.likesCount, dislikes: updated.dislikesCount, liked: !existing },
    };
  } catch {
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

export async function favoriteArticle(articleId: string, articleSlug: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

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
