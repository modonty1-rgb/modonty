import { z } from "zod";

import { getProfileBookings } from "@/app/(site)/users/profile/helpers/profile-bookings";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { readQuery } from "@/lib/mobile-api/request";

const querySchema = z.object({ limit: z.coerce.number().int().min(1).max(50).default(20) });

/**
 * A13 — GET /api/mobile/v1/me/bookings?limit · Bearer.
 * `getProfileBookings` — the profile «حجوزاتي» tab: this reader's own booking requests across all
 * partners, newest first, capped at 50. (Only requests sent while signed in carry the reader's id.)
 */
export const GET = handle("me-bookings", async (request: Request) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  const query = readQuery(request, querySchema);
  if ("response" in query) return query.response;
  return ok({ items: await getProfileBookings(reader.id, query.value.limit) });
});
