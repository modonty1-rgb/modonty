"use server";

import { auth } from "@/lib/auth";
import { likeCommentAs } from "@/lib/comments/like-comment-as";

/** Web door: identity from the session cookie, logic in `likeCommentAs` (shared with the mobile API). */
export async function likeComment(commentId: string, articleSlug: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }
    return await likeCommentAs({ id: session.user.id }, commentId, articleSlug);
  } catch (error) {
    console.error("[likeComment]", error);
    return { success: false, error: "Failed to update like" };
  }
}
