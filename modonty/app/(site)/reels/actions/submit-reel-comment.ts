"use server";

import { CommentStatus } from "@prisma/client";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifyTelegram } from "@/lib/telegram/notify-telegram";
import { sanitizeComment, validateCommentContent } from "@/lib/comments/validate-comment";

/**
 * A visitor's comment on a reel — same contract as article comments: signed-in only,
 * lands PENDING, and shows to visitors only after the partner approves it from the
 * console. `Media.commentsCount` is NOT touched here on purpose: the console owns that
 * counter and moves it on the PENDING → APPROVED transition, so a pending comment never
 * inflates the public count.
 */
export async function submitReelComment(mediaId: string, content: string) {
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

    const comment = await db.mediaComment.create({
      data: {
        content: sanitizeComment(content),
        mediaId,
        authorId: session.user.id,
        status: CommentStatus.PENDING,
      },
      select: { id: true, author: { select: { name: true } } },
    });

    if (reel.clientId) {
      notifyTelegram(reel.clientId, "commentNew", {
        title: reel.title ?? "ريل",
        body: `${comment.author?.name ?? "زائر"}: ${content}`,
        link: {
          label: "مراجعة من اللوحة",
          url: "https://console.modonty.com/dashboard/comments",
        },
      }).catch(() => {});
    }

    return {
      success: true,
      message: "وصل تعليقك — يظهر بعد مراجعة الشريك",
    };
  } catch {
    return { success: false, error: "Failed to submit comment" };
  }
}
