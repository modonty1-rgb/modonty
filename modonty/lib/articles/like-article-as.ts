import "server-only";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { isPublicArticle } from "@/lib/articles/is-public-article";
import { fireEngagement } from "@/lib/articles/fire-engagement";
import { incrementCounters } from "@/lib/counters/increment-counters";
import type { ReaderActor } from "@/lib/users/reader-actor";
import type { EngagementResult } from "@/lib/articles/engagement-result";

/**
 * إعجاب/إلغاء إعجاب مقال باسم قارئ معروف — جسم `likeArticle` (الويب) كما هو، بعد فصل الهويّة.
 * يناديه الأكشن (من كوكي الجلسة) ونقطة التطبيق (من Bearer). ليس Server Action عن قصد.
 */
export async function likeArticleAs(actor: Pick<ReaderActor, "id" | "name">, articleId: string, articleSlug: string): Promise<EngagementResult<{ likes: number; dislikes: number; liked: boolean }>> {
  try {
    const userId = actor.id;

    // An article that belongs to a client's own website is not ours to collect
    // interactions for — see assert-public-article.ts.
    if (!(await isPublicArticle(articleId))) {
      return { success: false, error: "Article not found" };
    }

    const existing = await db.articleLike.findFirst({
      where: { articleId, userId },
      select: { id: true },
    });

    // The counter moves only when a row really changed, with one atomic `$inc` outside any
    // transaction (incrementCounters). Before (29 Sep 2026, 50 simultaneous likes): a swallowed
    // duplicate still incremented, and Prisma's transactional update aborted on write conflicts —
    // stored=12 against 39 rows.
    if (existing) {
      // Unlike: only the request that actually removed the row moves the counter.
      const { count: removed } = await db.articleLike.deleteMany({ where: { id: existing.id } });
      await incrementCounters("articles", articleId, { likesCount: -removed });
    } else {
      // Like: remove any existing dislike, create like, update counters
      const { count: undisliked } = await db.articleDislike.deleteMany({ where: { articleId, userId } });
      const created = await db.articleLike
        .create({ data: { articleId, userId, sessionId: `user:${userId}` } })
        .then(() => true)
        .catch((e: unknown) => {
          const err = e as { code?: string; message?: string };
          const isUnique = err?.code === "P2002" || (typeof err?.message === "string" && err.message.includes("Unique constraint failed"));
          if (!isUnique) throw e;
          return false; // another tab of the same reader got there first
        });
      await incrementCounters("articles", articleId, { likesCount: created ? 1 : 0, dislikesCount: -undisliked });
    }
    const updated = await db.article.findUniqueOrThrow({
      where: { id: articleId },
      select: { likesCount: true, dislikesCount: true },
    });

    revalidatePath(`/articles/${articleSlug}`);
    if (!existing) {
      fireEngagement(articleId, "articleLike", "article_like", { id: userId, name: actor.name ?? null });
    }
    return {
      success: true,
      data: { likes: updated.likesCount, dislikes: updated.dislikesCount, liked: !existing },
    };
  } catch {
    return { success: false, error: "Failed to update like" };
  }
}
