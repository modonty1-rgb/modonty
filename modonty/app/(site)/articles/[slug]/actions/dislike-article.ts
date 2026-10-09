"use server";

import { auth } from "@/lib/auth";
import { dislikeArticleAs } from "@/lib/articles/dislike-article-as";
import type { EngagementResult } from "@/lib/articles/engagement-result";

/** Web door: identity from the session cookie, logic in `dislikeArticleAs` (shared with the mobile API). */
export async function dislikeArticle(articleId: string, articleSlug: string): Promise<EngagementResult<{ likes: number; dislikes: number; disliked: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }
    return await dislikeArticleAs({ id: session.user.id, name: session.user.name ?? null }, articleId, articleSlug);
  } catch (error) {
    console.error("[dislikeArticle]", error);
    return { success: false, error: "Failed to update dislike" };
  }
}
