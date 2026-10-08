import { CommentStatus } from "@prisma/client";
import { z } from "zod";

import { db } from "@/lib/db";
import { validateCommentContent } from "@/lib/comments/validate-comment";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { ACTION_MESSAGES } from "@/lib/mobile-api/messages-actions";
import { rejectMalformedIds } from "@/lib/mobile-api/params";
import { readBody } from "@/lib/mobile-api/request";
import { submitReelCommentReplyAs } from "@/lib/reels/submit-reel-comment-reply-as";

// Length/content rules are the web's (`validateCommentContent` inside the As function).
const bodySchema = z.object({ content: z.string().max(5000) });

/**
 * E18 — POST /api/mobile/v1/reel-comments/:id/replies · Bearer.
 * `submitReelCommentReplyAs` — the web's reel-reply logic: PENDING until the console approves,
 * partner push + Telegram. The reel is read from the parent comment (the web passes it from the
 * sheet); only an APPROVED parent is answerable — the comments C17 shows.
 */
export const POST = handle("reel-comment-reply", async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);

  const { id } = await params;
  const malformed = rejectMalformedIds([id], ACTION_MESSAGES.reelCommentNotFound);
  if (malformed) return malformed;

  const body = await readBody(request, bodySchema);
  if ("response" in body) return body.response;

  const validation = validateCommentContent(body.value.content);
  if (!validation.valid) {
    return fail(
      "VALIDATION_ERROR",
      body.value.content.trim().length === 0 ? ACTION_MESSAGES.replyEmpty : ACTION_MESSAGES.replyTooLong,
      { reason: validation.error },
    );
  }

  const parent = await db.mediaComment.findFirst({
    where: { id, status: CommentStatus.APPROVED },
    select: { mediaId: true },
  });
  if (!parent) return fail("NOT_FOUND", ACTION_MESSAGES.reelCommentNotFound);

  const result = await submitReelCommentReplyAs(reader.id, parent.mediaId, id, body.value.content);
  if (!result.success) {
    if (result.error === "Reel not found") return fail("NOT_FOUND", MESSAGES.reelNotFound);
    if (result.error === "Parent comment not found") return fail("NOT_FOUND", ACTION_MESSAGES.reelCommentNotFound);
    return fail("INTERNAL_ERROR", MESSAGES.internal);
  }
  return ok(
    { replyId: result.replyId, status: "PENDING" as const, message: ACTION_MESSAGES.reelReplySent },
    undefined,
    { status: 201 },
  );
});
