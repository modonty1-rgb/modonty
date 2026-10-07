import { CommentStatus } from "@prisma/client";
import { z } from "zod";

import { db } from "@/lib/db";
import { submitReplyAs } from "@/lib/comments/submit-reply-as";
import { validateCommentContent } from "@/lib/comments/validate-comment";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { ACTION_MESSAGES } from "@/lib/mobile-api/messages-actions";
import { rejectMalformedIds } from "@/lib/mobile-api/params";
import { readBody } from "@/lib/mobile-api/request";

const bodySchema = z.object({
  /** Accepted for symmetry with E4; the article's own slug (read below) is what gets revalidated. */
  slug: z.string().trim().max(200).optional(),
  // Length/content rules are the web's (`validateCommentContent` inside submitReplyAs).
  content: z.string().max(5000),
});

/**
 * E5 — POST /api/mobile/v1/comments/:id/replies · Bearer.
 * `submitReplyAs` — the web's reply logic: validated, sanitized, saved PENDING until the partner
 * approves, partner push + Telegram + GA4 after the response.
 *
 * The article is read from the parent comment (the web passes it from the page). Only an APPROVED
 * parent is answerable — the same comments the app can see (C6 returns approved only).
 */
export const POST = handle("comment-reply", async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);

  const { id } = await params;
  const malformed = rejectMalformedIds([id], ACTION_MESSAGES.commentNotFound);
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

  const parent = await db.comment.findFirst({
    where: { id, status: CommentStatus.APPROVED },
    select: { articleId: true, article: { select: { slug: true } } },
  });
  if (!parent) return fail("NOT_FOUND", ACTION_MESSAGES.commentNotFound);

  const result = await submitReplyAs(reader, parent.articleId, parent.article.slug, id, body.value.content);
  if (!result.success || !result.data) {
    if (result.error === "Article not found") return fail("NOT_FOUND", MESSAGES.articleNotFound);
    if (result.error === "Parent comment not found") return fail("NOT_FOUND", ACTION_MESSAGES.commentNotFound);
    return fail("INTERNAL_ERROR", MESSAGES.internal);
  }
  const r = result.data;
  return ok(
    {
      reply: {
        id: r.id,
        content: r.content,
        status: r.status,
        createdAt: r.createdAt,
        parentId: r.parentId,
        author: r.author,
      },
      message: ACTION_MESSAGES.replySent,
    },
    undefined,
    { status: 201 },
  );
});
