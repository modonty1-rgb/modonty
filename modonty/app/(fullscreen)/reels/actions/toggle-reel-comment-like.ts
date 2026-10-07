"use server";

import { auth } from "@/lib/auth";
import { toggleReelCommentLikeAs } from "@/lib/reels/toggle-reel-comment-like-as";

/**
 * Toggle a like on one reel comment. Signed-in only — `CommentReaction.userId` is nullable
 * in the schema (it also serves anonymous flows), so this guard is the only thing keeping
 * a reel comment like owned by a real account, same as favorites in reel-interactions.
 * Web door: identity from the session cookie, logic in `toggleReelCommentLikeAs` (shared with the mobile API).
 */
export async function toggleReelCommentLike(commentId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false as const, error: "Unauthorized" };
    return await toggleReelCommentLikeAs(userId, commentId);
  } catch (error) {
    console.error("[toggleReelCommentLike]", error);
    return { success: false as const, error: "Failed to update like" };
  }
}
