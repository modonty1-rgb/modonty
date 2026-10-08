import "server-only";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { isPublicArticle } from "@/lib/articles/is-public-article";
import { fireEngagement } from "@/lib/articles/fire-engagement";
import type { ReaderActor } from "@/lib/users/reader-actor";

/**
 * «لا يعجبني» مقال (toggle) باسم قارئ معروف — جسم `dislikeArticle` (الويب) كما هو بعد فصل الهويّة.
 * يناديه الأكشن (من كوكي الجلسة) ونقطة التطبيق (من Bearer). ليس Server Action عن قصد.
 */
export async function dislikeArticleAs(actor: Pick<ReaderActor, "id" | "name">, articleId: string, articleSlug: string) {
  try {
    const userId = actor.id;

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
      await db.articleDislike.delete({ where: { id: existing.id } }).catch((e: unknown) => {
        // Another tab removed it first — the counter still follows, exactly as on the web.
        console.error("[dislikeArticleAs] delete raced", e);
      });
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
      fireEngagement(articleId, "articleDislike", "article_dislike", { id: userId, name: actor.name ?? null });
    }
    return {
      success: true,
      data: { likes: updated.likesCount, dislikes: updated.dislikesCount, disliked: !existing },
    };
  } catch (error) {
    console.error("[dislikeArticleAs]", error);
    return { success: false, error: "Failed to update dislike" };
  }
}
