import { z } from "zod";

import { getChatHistory } from "@/app/(site)/modo-chat/data/get-chat-history";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { readQuery } from "@/lib/mobile-api/request";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().regex(/^[0-9a-f]{24}$/i).optional(),
});

/**
 * V3 — GET /api/mobile/v1/chat/history?limit&cursor · Bearer.
 * `getChatHistory` — the web history tab's read: this reader's saved Modo turns, newest first,
 * cursor = the last row id of the previous page. → `{ messages, nextCursor }`
 */
export const GET = handle("chat-history", async (request: Request) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  const query = readQuery(request, querySchema);
  if ("response" in query) return query.response;
  return ok(await getChatHistory(reader.id, query.value.limit, query.value.cursor ?? null));
});
