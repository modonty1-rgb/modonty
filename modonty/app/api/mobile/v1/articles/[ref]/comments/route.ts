import { z } from "zod";

import { getArticleComments } from "@/app/(site)/articles/[slug]/data/get-article-comments";
import { submitCommentAs } from "@/lib/comments/submit-comment-as";
import { validateCommentContent } from "@/lib/comments/validate-comment";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { rejectMalformedIds } from "@/lib/mobile-api/params";
import { readBody } from "@/lib/mobile-api/request";

/**
 * C6 — GET /api/mobile/v1/articles/:id/comments · public · no-store.
 * Approved comments, oldest first, with the name each reply answers — `getArticleComments`, the
 * read the web loads after the article paints. Uncapped, exactly like the web.
 */
export const GET = handle("article-comments", async (_request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  const { ref: id } = await params;
  const malformed = rejectMalformedIds([id], MESSAGES.articleNotFound);
  if (malformed) return malformed;

  const comments = await getArticleComments(id);
  if (!comments) return fail("NOT_FOUND", MESSAGES.articleNotFound);
  return ok({ comments });
});

const commentSchema = z.object({
  slug: z.string().trim().min(1).max(200),
  // Length/content rules are the web's (`validateCommentContent` inside submitCommentAs).
  content: z.string().max(5000),
});

/**
 * E4 — POST /api/mobile/v1/articles/:id/comments · Bearer.
 * `submitCommentAs` — the web's comment logic: validated, sanitized, saved PENDING until the
 * partner approves, Telegram + GA4 after the response.
 */
export const POST = handle("article-comment-create", async (request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);

  const { ref: id } = await params;
  const malformed = rejectMalformedIds([id], MESSAGES.articleNotFound);
  if (malformed) return malformed;

  const body = await readBody(request, commentSchema);
  if ("response" in body) return body.response;

  // Same validator submitCommentAs runs; checked first only to answer in Arabic (its own texts
  // are English — the web form never shows them, it blocks an empty/over-long comment itself).
  const validation = validateCommentContent(body.value.content);
  if (!validation.valid) {
    return fail(
      "VALIDATION_ERROR",
      body.value.content.trim().length === 0 ? MESSAGES.commentEmpty : MESSAGES.commentTooLong,
      { reason: validation.error },
    );
  }

  const result = await submitCommentAs(reader, id, body.value.slug, body.value.content);
  if (!result.success) {
    if (result.error === "Article not found") return fail("NOT_FOUND", MESSAGES.articleNotFound);
    return fail("INTERNAL_ERROR", MESSAGES.internal);
  }
  const c = result.data!;
  return ok(
    {
      comment: {
        id: c.id,
        content: c.content,
        status: c.status,
        createdAt: c.createdAt,
        parentId: c.parentId,
        author: c.author,
      },
      // The web form's own confirmation (CommentFormDialogContent.tsx).
      message: "وصل تعليقك — يظهر بعد مراجعة الشريك.",
    },
    undefined,
    { status: 201 },
  );
});
