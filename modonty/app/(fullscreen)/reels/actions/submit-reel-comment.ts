"use server";

import { auth } from "@/lib/auth";
import { submitReelCommentAs } from "@/lib/reels/submit-reel-comment-as";

/**
 * A visitor's comment on a reel — signed-in only, lands PENDING until the partner approves.
 * Web door: identity from the session cookie, logic in `submitReelCommentAs` (shared with the mobile API).
 */
export async function submitReelComment(mediaId: string, content: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }
    const result = await submitReelCommentAs(session.user.id, mediaId, content);
    return result.success ? { success: true, message: result.message } : { success: false, error: result.error };
  } catch (error) {
    console.error("[submitReelComment]", error);
    return { success: false, error: "Failed to submit comment" };
  }
}
