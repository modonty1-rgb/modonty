import { z } from "zod";

import { favoriteArticleAs } from "@/lib/articles/favorite-article-as";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { rejectMalformedIds } from "@/lib/mobile-api/params";
import { readBody } from "@/lib/mobile-api/request";

const bodySchema = z.object({ slug: z.string().trim().min(1).max(200) });

/**
 * E3 — POST /api/mobile/v1/articles/:id/favorite (toggle) · Bearer.
 * `favoriteArticleAs` — the web action's logic, unchanged.
 */
export const POST = handle("article-favorite", async (request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);

  const { ref: id } = await params;
  const malformed = rejectMalformedIds([id], MESSAGES.articleNotFound);
  if (malformed) return malformed;

  const body = await readBody(request, bodySchema);
  if ("response" in body) return body.response;

  const result = await favoriteArticleAs(reader, id, body.value.slug);
  if (!result.success) {
    return result.error === "Article not found"
      ? fail("NOT_FOUND", MESSAGES.articleNotFound)
      : fail("INTERNAL_ERROR", MESSAGES.internal);
  }
  return ok({ favorited: result.data.favorited, favoritesCount: result.data.favorites });
});
