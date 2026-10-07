"use server";

import { auth } from "@/lib/auth";
import { submitReelCommentReplyAs } from "@/lib/reels/submit-reel-comment-reply-as";

/**
 * A reply to a reel comment — PENDING until the console approves.
 * Web door: identity from the session cookie, logic in `submitReelCommentReplyAs` (shared with the mobile API).
 */
export async function submitReelCommentReply(
  mediaId: string,
  parentCommentId: string,
  content: string
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }
    const result = await submitReelCommentReplyAs(session.user.id, mediaId, parentCommentId, content);
    return result.success ? { success: true, message: result.message } : { success: false, error: result.error };
  } catch (error) {
    console.error("[submitReelCommentReply]", error);
    return { success: false, error: "Failed to submit reply" };
  }
}
