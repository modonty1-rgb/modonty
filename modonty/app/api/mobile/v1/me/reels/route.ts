import { z } from "zod";

import { getMyReels } from "@/app/(fullscreen)/reels/data/get-my-reels";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { readQuery } from "@/lib/mobile-api/request";

const querySchema = z.object({ kind: z.enum(["LIKE", "FAVORITE"]).default("LIKE") });

/**
 * A13 — GET /api/mobile/v1/me/reels?kind=LIKE|FAVORITE · Bearer.
 * `getMyReels` — the reels sheet's «أعجبني / حفظته» lists: published reels only, newest first,
 * at most 60 (the web's own cap).
 */
export const GET = handle("me-reels", async (request: Request) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  const query = readQuery(request, querySchema);
  if ("response" in query) return query.response;
  return ok({ items: await getMyReels(reader.id, query.value.kind) });
});
