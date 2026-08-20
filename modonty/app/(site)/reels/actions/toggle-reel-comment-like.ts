"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifyTelegram } from "@/lib/telegram/notify-telegram";

/**
 * Toggle a like on one reel comment. Signed-in only — `CommentReaction.userId` is nullable
 * in the schema (it also serves anonymous flows), so this guard is the only thing keeping
 * a reel comment like owned by a real account, same as favorites in reel-interactions.
 * The rail has no dislike, so a stray `isLike:false` row (if one ever appears) is simply
 * flipped to a like instead of blocking the tap.
 */
export async function toggleReelCommentLike(commentId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false as const, error: "Unauthorized" };

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
      }).catch(() => {});
    }

    return { success: true as const, liked, likes };
  } catch {
    return { success: false as const, error: "Failed to update like" };
  }
}
