"use server";

import { auth } from "@/lib/auth";
import { submitCommentAs } from "../helpers/submit-comment-as";

/** Web door: identity from the session cookie, logic in `submitCommentAs` (shared with the mobile API). */
export async function submitComment(
  articleId: string,
  articleSlug: string,
  content: string
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }
    return await submitCommentAs({ id: session.user.id }, articleId, articleSlug, content);
  } catch (error) {
    return { success: false, error: "Failed to submit comment" };
  }
}
