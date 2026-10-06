import "server-only";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { isPublicArticle } from "./is-public-article";
import { fireEngagement } from "./fire-engagement";
import { incrementCounters } from "@/lib/counters/increment-counters";
import type { ReaderActor } from "@/lib/users/reader-actor";

/**
 * حفظ/إلغاء حفظ مقال باسم قارئ معروف — جسم `favoriteArticle` (الويب) كما هو بعد فصل الهويّة.
 * يناديه الأكشن ونقطة التطبيق. ليس Server Action عن قصد.
 */
export async function favoriteArticleAs(actor: Pick<ReaderActor, "id" | "name">, articleId: string, articleSlug: string) {
  try {
    const userId = actor.id;

    // An article that belongs to a client's own website is not ours to collect
    // interactions for — see assert-public-article.ts.
    if (!(await isPublicArticle(articleId))) {
      return { success: false, error: "Article not found" };
    }

    const existing = await db.articleFavorite.findFirst({
      where: { articleId, userId },
      select: { id: true },
    });

    // Same rule as likes (like-article.ts): the counter moves only when a row really changed,
    // with one atomic `$inc` outside any transaction (incrementCounters).
    if (existing) {
      const { count: removed } = await db.articleFavorite.deleteMany({ where: { id: existing.id } });
      await incrementCounters("articles", articleId, { favoritesCount: -removed });
    } else {
      const created = await db.articleFavorite
        .create({ data: { articleId, userId } })
        .then(() => true)
        .catch((e: unknown) => {
          const err = e as { code?: string; message?: string };
          const isUnique = err?.code === "P2002" || (typeof err?.message === "string" && err.message.includes("Unique constraint failed"));
          if (!isUnique) throw e;
          return false;
        });
      await incrementCounters("articles", articleId, { favoritesCount: created ? 1 : 0 });
    }
    const updated = await db.article.findUniqueOrThrow({ where: { id: articleId }, select: { favoritesCount: true } });

    revalidatePath(`/articles/${articleSlug}`);
    if (!existing) {
      fireEngagement(articleId, "articleFavorite", "article_favorite", { id: userId, name: actor.name ?? null });
    }
    return {
      success: true,
      data: { favorites: updated.favoritesCount, favorited: !existing },
    };
  } catch {
    return { success: false, error: "Failed to update favorite" };
  }
}
