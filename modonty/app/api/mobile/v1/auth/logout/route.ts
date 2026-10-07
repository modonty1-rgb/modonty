import { z } from "zod";

import { endReaderSession } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { readBody } from "@/lib/mobile-api/request";

const bodySchema = z.object({ refreshToken: z.string().max(200).optional() }).default({});

/**
 * A6 — POST /api/mobile/v1/auth/logout · Bearer access token (or `{ refreshToken }` when the access
 * token has already expired). Revokes THIS session only; any later request with its tokens → 401.
 * A second logout with the same token still answers 200.
 *
 * (Device push rows — `ReaderDevice` — are V2 by Khalid's decision; nothing to disable yet.)
 */
export const POST = handle("auth-logout", async (request: Request) => {
  const body = await readBody(request, bodySchema);
  if ("response" in body) return body.response;

  const ended = await endReaderSession(request, body.value.refreshToken);
  if (!ended) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  return ok({ signedOut: true });
});
