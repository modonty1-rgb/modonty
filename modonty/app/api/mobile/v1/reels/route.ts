import { z } from "zod";

import { getReelsPageFor } from "@/lib/reels/get-reels-page-for";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { handle, ok, PRIVATE_NO_STORE, PUBLIC_CACHE } from "@/lib/mobile-api/http";
import { readQuery } from "@/lib/mobile-api/request";

const querySchema = z.object({
  cursor: z.string().regex(/^[0-9a-f]{24}$/i).optional(),
  client: z.string().trim().max(200).optional(),
});

/**
 * C14 — GET /api/mobile/v1/reels?cursor&client · public, Bearer optional.
 * `getReelsPageFor` — the web's `loadMoreReels`: the cached feed page (6, newest first, cursor)
 * plus this reader's like/save flags. With a Bearer the answer is personal → no-store.
 */
export const GET = handle("reels", async (request: Request) => {
  const query = readQuery(request, querySchema);
  if ("response" in query) return query.response;

  const hasBearer = !!request.headers.get("authorization");
  const reader = hasBearer ? await readerFromRequest(request) : null;
  const page = await getReelsPageFor(reader?.id ?? null, query.value.cursor ?? null, query.value.client ?? null);
  return ok(page, hasBearer ? PRIVATE_NO_STORE : PUBLIC_CACHE);
});
