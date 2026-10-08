import { z } from "zod";

import { getProfileFollowing } from "@/app/(site)/users/profile/helpers/profile-following";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { readQuery } from "@/lib/mobile-api/request";

const querySchema = z.object({ limit: z.coerce.number().int().min(1).max(50).default(20) });

/**
 * A13 — GET /api/mobile/v1/me/following?limit · Bearer.
 * `getProfileFollowing` — the partners this reader follows, newest first, capped at 50 as on the web.
 */
export const GET = handle("me-following", async (request: Request) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  const query = readQuery(request, querySchema);
  if ("response" in query) return query.response;
  return ok({ items: await getProfileFollowing(reader.id, query.value.limit) });
});
