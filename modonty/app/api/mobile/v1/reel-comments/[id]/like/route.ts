import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { ACTION_MESSAGES } from "@/lib/mobile-api/messages-actions";
import { rejectMalformedIds } from "@/lib/mobile-api/params";
import { toggleReelCommentLikeAs } from "@/lib/reels/toggle-reel-comment-like-as";

/**
 * E18 — POST /api/mobile/v1/reel-comments/:id/like (toggle) · Bearer.
 * `toggleReelCommentLikeAs` — the web sheet's logic: the comment must sit on a published reel,
 * like ↔ unlike (a stray dislike row flips to a like), Telegram on a new like, count recounted.
 */
export const POST = handle("reel-comment-like", async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);

  const { id } = await params;
  const malformed = rejectMalformedIds([id], ACTION_MESSAGES.reelCommentNotFound);
  if (malformed) return malformed;

  const result = await toggleReelCommentLikeAs(reader.id, id);
  if (!result.success) {
    return result.error === "Comment not found"
      ? fail("NOT_FOUND", ACTION_MESSAGES.reelCommentNotFound)
      : fail("INTERNAL_ERROR", MESSAGES.internal);
  }
  return ok({ liked: result.liked, likesCount: result.likes });
});
