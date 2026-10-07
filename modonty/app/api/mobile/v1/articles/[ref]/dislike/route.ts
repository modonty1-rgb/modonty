import { z } from "zod";

import { dislikeArticleAs } from "@/lib/articles/dislike-article-as";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { rejectMalformedIds } from "@/lib/mobile-api/params";
import { readBody } from "@/lib/mobile-api/request";

const bodySchema = z.object({ slug: z.string().trim().min(1).max(200) });

/**
 * E2 — POST /api/mobile/v1/articles/:id/dislike (toggle) · Bearer.
 * `dislikeArticleAs` — the web action's logic: removes a like, moves both counters, revalidates the
 * article path, Telegram + GA4 on a new dislike.
 */
export const POST = handle("article-dislike", async (request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);

  const { ref: id } = await params;
  const malformed = rejectMalformedIds([id], MESSAGES.articleNotFound);
  if (malformed) return malformed;

  const body = await readBody(request, bodySchema);
  if ("response" in body) return body.response;

  const result = await dislikeArticleAs(reader, id, body.value.slug);
  if (!result.success || !result.data) {
    return result.error === "Article not found"
      ? fail("NOT_FOUND", MESSAGES.articleNotFound)
      : fail("INTERNAL_ERROR", MESSAGES.internal);
  }
  return ok({ disliked: result.data.disliked, likesCount: result.data.likes, dislikesCount: result.data.dislikes });
});
