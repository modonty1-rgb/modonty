"use server";

import { auth } from "@/lib/auth";
import { favoriteArticleAs } from "./favorite-article-as";

/** Web door: identity from the session cookie, logic in `favoriteArticleAs` (shared with the mobile API). */
export async function favoriteArticle(articleId: string, articleSlug: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }
    return await favoriteArticleAs({ id: session.user.id, name: session.user.name ?? null }, articleId, articleSlug);
  } catch {
    return { success: false, error: "Failed to update favorite" };
  }
}
