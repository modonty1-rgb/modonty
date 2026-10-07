import "server-only";

import { db } from "@/lib/db";
import { notifyTelegram } from "@/lib/telegram/notify-telegram";

/**
 * Toggle a like on one reel comment for a known reader — the body of `toggleReelCommentLike` with
 * the identity passed in. The rail has no dislike, so a stray `isLike:false` row (if one ever
 * appears) is simply flipped to a like instead of blocking the tap. Not a Server Action on purpose:
 * `CommentReaction.userId` is nullable, so the caller's signed-in check is what keeps it owned.
 */
export async function toggleReelCommentLikeAs(userId: string, commentId: string) {
  try {
    const comment = await db.mediaComment.findFirst({
      where: { id: commentId, media: { inReels: true, reelStatus: "PUBLISHED" } },
      select: { id: true, media: { select: { clientId: true, title: true } } },
    });
    if (!comment) return { success: false as const, error: "Comment not found" };

    const existing = await db.commentReaction.findFirst({
      where: { commentId, userId },
      select: { id: true, isLike: true },
    });

    let liked: boolean;
    if (existing?.isLike) {
      await db.commentReaction.delete({ where: { id: existing.id } });
      liked = false;
    } else if (existing) {
      await db.commentReaction.update({ where: { id: existing.id }, data: { isLike: true } });
      liked = true;
    } else {
      await db.commentReaction.create({
        data: { commentId, userId, isLike: true },
      });
      liked = true;
    }

    const likes = await db.commentReaction.count({ where: { commentId, isLike: true } });

    if (liked && comment.media.clientId) {
      notifyTelegram(comment.media.clientId, "commentLike", {
        title: comment.media.title ?? "ريل",
      }).catch((e: unknown) => console.error("[toggleReelCommentLikeAs] telegram", e));
    }

    return { success: true as const, liked, likes };
  } catch (error) {
    console.error("[toggleReelCommentLikeAs]", error);
    return { success: false as const, error: "Failed to update like" };
  }
}
