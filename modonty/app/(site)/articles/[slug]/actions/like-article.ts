"use server";

import { auth } from "@/lib/auth";
import { likeArticleAs } from "@/lib/articles/like-article-as";
import type { EngagementResult } from "@/lib/articles/engagement-result";

/** Web door: identity from the session cookie, logic in `likeArticleAs` (shared with the mobile API). */
export async function likeArticle(articleId: string, articleSlug: string): Promise<EngagementResult<{ likes: number; dislikes: number; liked: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }
    return await likeArticleAs({ id: session.user.id, name: session.user.name ?? null }, articleId, articleSlug);
  } catch {
    return { success: false, error: "Failed to update like" };
  }
}
