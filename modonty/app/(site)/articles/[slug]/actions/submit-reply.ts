"use server";

import { auth } from "@/lib/auth";
import { submitReplyAs } from "@/lib/comments/submit-reply-as";

/** Web door: identity from the session cookie, logic in `submitReplyAs` (shared with the mobile API). */
export async function submitReply(
  articleId: string,
  articleSlug: string,
  parentCommentId: string,
  content: string
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }
    return await submitReplyAs({ id: session.user.id }, articleId, articleSlug, parentCommentId, content);
  } catch (error) {
    console.error("[submitReply]", error);
    return { success: false, error: "Failed to submit reply" };
  }
}
