import "server-only";

import { CommentStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { trackReelCommentSubmit } from "@/lib/analytics/events-registry";
import { notifyTelegram } from "@/lib/telegram/notify-telegram";
import { sanitizeComment, validateCommentContent } from "@/lib/comments/validate-comment";
import { fireClientEvent } from "@modonty/shared/lib/mobile-push";

/**
 * A reader's comment on a reel for a known reader — the body of `submitReelComment` with the
 * identity passed in. Same contract as article comments: lands PENDING, shows only after the
 * partner approves it from the console. `Media.commentsCount` is NOT touched here on purpose: the
 * console owns that counter and moves it on the PENDING → APPROVED transition.
 * Not a Server Action on purpose.
 */
export async function submitReelCommentAs(userId: string, mediaId: string, content: string) {
  try {
    const reel = await db.media.findFirst({
      where: { id: mediaId, inReels: true, reelStatus: "PUBLISHED" },
      select: { id: true, title: true, clientId: true, reelSlug: true, bunnyVideoId: true, client: { select: { slug: true, name: true } } },
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
        authorId: userId,
        status: CommentStatus.PENDING,
      },
      select: { id: true, author: { select: { name: true } } },
    });

    fireClientEvent(reel.clientId, { kind: "media_comment", mediaId: reel.id, commentId: comment.id });
    if (reel.clientId) {
      notifyTelegram(reel.clientId, "commentNew", {
        title: reel.title ?? "ريل",
        body: `${comment.author?.name ?? "زائر"}: ${content}`,
        link: {
          label: "مراجعة من اللوحة",
          url: "https://console.modonty.com/dashboard/comments",
        },
      }).catch((e: unknown) => console.error("[submitReelCommentAs] telegram", e));
    }

    // Fired on submission, not on approval: the reader ENGAGED here, and a comment that the
    // partner later rejects still cost them the intent we are measuring.
    void trackReelCommentSubmit(
      {
        reel_id: reel.id,
        reel_slug: reel.reelSlug ?? reel.id,
        reel_kind: reel.bunnyVideoId ? "video" : "image",
        client_id: reel.clientId ?? undefined,
        client_slug: reel.client?.slug,
        client_name: reel.client?.name,
      },
      { userId },
    );

    return {
      success: true,
      commentId: comment.id,
      message: "وصل تعليقك — يظهر بعد مراجعة الشريك",
    };
  } catch (error) {
    console.error("[submitReelCommentAs]", error);
    return { success: false, error: "Failed to submit comment" };
  }
}
