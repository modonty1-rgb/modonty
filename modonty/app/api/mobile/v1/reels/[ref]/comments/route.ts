import { z } from "zod";

import { getReelComments } from "@/app/(fullscreen)/reels/data/get-reel-comments";
import { db } from "@/lib/db";
import { validateCommentContent } from "@/lib/comments/validate-comment";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { ACTION_MESSAGES } from "@/lib/mobile-api/messages-actions";
import { rejectMalformedIds } from "@/lib/mobile-api/params";
import { readBody } from "@/lib/mobile-api/request";
import { submitReelCommentAs } from "@/lib/reels/submit-reel-comment-as";

/**
 * C17 — GET /api/mobile/v1/reels/:id/comments · public, Bearer optional · no-store.
 * `getReelComments(mediaId, userId)` — the read behind the web's comment sheet
 * (`fetchReelComments`): APPROVED only, oldest first, replies resolved (`parentId` +
 * `replyingTo`), at most 200, and with a valid Bearer this reader's `likedByMe` on each.
 * The reel must be a public one — same definition as the feed and the reaction routes.
 */
export const GET = handle("reel-comments", async (request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  const { ref: mediaId } = await params;
  const malformed = rejectMalformedIds([mediaId], MESSAGES.reelNotFound);
  if (malformed) return malformed;

  const [reel, reader] = await Promise.all([
    db.media.findFirst({ where: { id: mediaId, inReels: true, reelStatus: "PUBLISHED" }, select: { id: true } }),
    readerFromRequest(request),
  ]);
  if (!reel) return fail("NOT_FOUND", MESSAGES.reelNotFound);

  const comments = await getReelComments(mediaId, reader?.id ?? null);
  return ok({ comments });
});

// Length/content rules are the web's (`validateCommentContent` inside submitReelCommentAs).
const commentSchema = z.object({ content: z.string().max(5000) });

/**
 * E18 — POST /api/mobile/v1/reels/:id/comments · Bearer.
 * `submitReelCommentAs` — the web's reel-comment logic: validated, sanitized, saved PENDING until
 * the partner approves (the public count is the console's to move), partner push + Telegram + GA4.
 */
export const POST = handle("reel-comment-create", async (request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);

  const { ref: mediaId } = await params;
  const malformed = rejectMalformedIds([mediaId], MESSAGES.reelNotFound);
  if (malformed) return malformed;

  const body = await readBody(request, commentSchema);
  if ("response" in body) return body.response;

  const validation = validateCommentContent(body.value.content);
  if (!validation.valid) {
    return fail(
      "VALIDATION_ERROR",
      body.value.content.trim().length === 0 ? MESSAGES.commentEmpty : MESSAGES.commentTooLong,
      { reason: validation.error },
    );
  }

  const result = await submitReelCommentAs(reader.id, mediaId, body.value.content);
  if (!result.success) {
    if (result.error === "Reel not found") return fail("NOT_FOUND", MESSAGES.reelNotFound);
    return fail("INTERNAL_ERROR", MESSAGES.internal);
  }
  return ok(
    { commentId: result.commentId, status: "PENDING" as const, message: ACTION_MESSAGES.reelCommentSent },
    undefined,
    { status: 201 },
  );
});
