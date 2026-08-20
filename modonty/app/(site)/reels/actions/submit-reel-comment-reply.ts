"use server";

import { CommentStatus } from "@prisma/client";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifyTelegram } from "@/lib/telegram/notify-telegram";
import { sanitizeComment, validateCommentContent } from "@/lib/comments/validate-comment";

/**
 * A reply to a reel comment — flat storage with `parentId`, exactly like article replies.
 * Same moderation contract as submitReelComment: PENDING until the console approves.
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
        authorId: session.user.id,
        parentId: parentCommentId,
        status: CommentStatus.PENDING,
      },
      select: { id: true, author: { select: { name: true } } },
    });

    if (reel.clientId) {
      notifyTelegram(reel.clientId, "commentReply", {
        title: reel.title ?? "ريل",
        body: `${reply.author?.name ?? "زائر"}: ${content}`,
      }).catch(() => {});
    }

    return {
      success: true,
      message: "وصل ردّك — يظهر بعد مراجعة الشريك",
    };
  } catch {
    return { success: false, error: "Failed to submit reply" };
  }
}
