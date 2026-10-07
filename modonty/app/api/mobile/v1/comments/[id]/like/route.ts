import { ArticleStatus, CommentStatus } from "@prisma/client";
import { z } from "zod";

import { db } from "@/lib/db";
import { likeCommentAs } from "@/lib/comments/like-comment-as";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { ACTION_MESSAGES } from "@/lib/mobile-api/messages-actions";
import { rejectMalformedIds } from "@/lib/mobile-api/params";
import { readBody } from "@/lib/mobile-api/request";

const bodySchema = z.object({
  /** Accepted for symmetry with E1; the article's own slug (read below) is what gets revalidated. */
  slug: z.string().trim().max(200).optional(),
});

/**
 * E5 — POST /api/mobile/v1/comments/:id/like (toggle) · Bearer.
 * `likeCommentAs` — the web action's logic: removes a dislike, revalidates the article, Telegram +
 * GA4 on a new like. Counts are recounted from the rows (the web's own answer).
 *
 * The web never checks the comment exists (the button only renders under a loaded comment); a
 * crafted id must not grow a like row on a pending comment or a missing one, so the route checks
 * the same visibility C6 uses: approved, on a published article.
 */
export const POST = handle("comment-like", async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);

  const { id } = await params;
  const malformed = rejectMalformedIds([id], ACTION_MESSAGES.commentNotFound);
  if (malformed) return malformed;

  const body = await readBody(request, bodySchema);
  if ("response" in body) return body.response;

  const comment = await db.comment.findFirst({
    where: { id, status: CommentStatus.APPROVED, article: { status: ArticleStatus.PUBLISHED } },
    select: { article: { select: { slug: true } } },
  });
  if (!comment) return fail("NOT_FOUND", ACTION_MESSAGES.commentNotFound);

  const result = await likeCommentAs(reader, id, comment.article.slug);
  if (!result.success || !result.data) return fail("INTERNAL_ERROR", MESSAGES.internal);
  return ok({ liked: result.data.liked, likesCount: result.data.likes, dislikesCount: result.data.dislikes });
});
