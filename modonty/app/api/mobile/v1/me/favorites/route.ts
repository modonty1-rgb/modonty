import { z } from "zod";

import { getProfileFavorites } from "@/app/(site)/users/profile/helpers/profile-favorites";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { readQuery } from "@/lib/mobile-api/request";

const querySchema = z.object({ limit: z.coerce.number().int().min(1).max(50).default(20) });

/**
 * A13 — GET /api/mobile/v1/me/favorites?limit · Bearer.
 * `getProfileFavorites` — the profile tab's read: newest saves first, published articles only,
 * capped at 50 (the web has no further pages either).
 */
export const GET = handle("me-favorites", async (request: Request) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  const query = readQuery(request, querySchema);
  if ("response" in query) return query.response;
  return ok({ items: await getProfileFavorites(reader.id, query.value.limit) });
});
