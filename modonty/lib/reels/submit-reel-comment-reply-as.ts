import "server-only";

import { CommentStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { notifyTelegram } from "@/lib/telegram/notify-telegram";
import { sanitizeComment, validateCommentContent } from "@/lib/comments/validate-comment";
import { fireClientEvent } from "@modonty/shared/lib/mobile-push";

/**
 * A reply to a reel comment for a known reader — the body of `submitReelCommentReply` with the
 * identity passed in. Flat storage with `parentId`, PENDING until the console approves.
 * Not a Server Action on purpose.
 */
export async function submitReelCommentReplyAs(
  userId: string,
  mediaId: string,
  parentCommentId: string,
  content: string
) {
  try {
    const reel = await db.media.findFirst({
      where: { id: mediaId, inReels: true, reelStatus: "PUBLISHED" },
      select: { id: true, title: true, clientId: true },
    });
    if (!reel) return { success: false, error: "Reel not found" };

    const validation = validateCommentContent(content);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const parent = await db.mediaComment.findUnique({
      where: { id: parentCommentId },
      select: { id: true, mediaId: true },
    });
    if (!parent || parent.mediaId !== mediaId) {
      return { success: false, error: "Parent comment not found" };
    }

    const reply = await db.mediaComment.create({
      data: {
        content: sanitizeComment(content),
        mediaId,
        authorId: userId,
        parentId: parentCommentId,
        status: CommentStatus.PENDING,
      },
      select: { id: true, author: { select: { name: true } } },
    });

    fireClientEvent(reel.clientId, { kind: "media_comment", mediaId, commentId: reply.id });
    if (reel.clientId) {
      notifyTelegram(reel.clientId, "commentReply", {
        title: reel.title ?? "ريل",
        body: `${reply.author?.name ?? "زائر"}: ${content}`,
      }).catch((e: unknown) => console.error("[submitReelCommentReplyAs] telegram", e));
    }

    return {
      success: true,
      replyId: reply.id,
      message: "وصل ردّك — يظهر بعد مراجعة الشريك",
    };
  } catch (error) {
    console.error("[submitReelCommentReplyAs]", error);
    return { success: false, error: "Failed to submit reply" };
  }
}
