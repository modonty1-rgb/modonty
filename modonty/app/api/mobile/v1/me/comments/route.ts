import { z } from "zod";

import { getProfileComments } from "@/app/(site)/users/profile/helpers/profile-comments";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { PAGE_MAX, readQuery } from "@/lib/mobile-api/request";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(PAGE_MAX).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

/**
 * A13 — GET /api/mobile/v1/me/comments?page&limit · Bearer.
 * `getProfileComments` — the profile «تعليقاتي» tab: every comment of this reader except DELETED
 * (pending ones included, with their status), newest first, offset pages.
 * → `{ comments, pagination: { page, limit, total, totalPages } }`
 */
export const GET = handle("me-comments", async (request: Request) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  const query = readQuery(request, querySchema);
  if ("response" in query) return query.response;
  return ok(await getProfileComments(reader.id, query.value.page, query.value.limit));
});
