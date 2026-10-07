import { z } from "zod";

import { getProfileDisliked } from "@/app/(site)/users/profile/helpers/profile-disliked";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { readQuery } from "@/lib/mobile-api/request";

const querySchema = z.object({ limit: z.coerce.number().int().min(1).max(50).default(20) });

/**
 * A13 — GET /api/mobile/v1/me/disliked?limit · Bearer.
 * `getProfileDisliked` — the profile «لم يعجبني» tab: partner + article + comment dislikes merged,
 * newest first, capped at 50.
 */
export const GET = handle("me-disliked", async (request: Request) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  const query = readQuery(request, querySchema);
  if ("response" in query) return query.response;
  return ok({ items: await getProfileDisliked(reader.id, query.value.limit) });
});
