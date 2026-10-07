"use server";

import { auth } from "@/lib/auth";
import { likeArticleAs } from "../helpers/like-article-as";

/** Web door: identity from the session cookie, logic in `likeArticleAs` (shared with the mobile API). */
export async function likeArticle(articleId: string, articleSlug: string) {
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
