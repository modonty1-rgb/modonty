import { z } from "zod";

import { bearerFrom, refreshReaderSession } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { readBody } from "@/lib/mobile-api/request";

const bodySchema = z.object({ refreshToken: z.string().max(200).optional() }).default({});

/**
 * A5 — POST /api/mobile/v1/auth/refresh · the refresh token as `Authorization: Bearer <token>`
 * (or `{ refreshToken }` in the body). Rotates it: the new pair replaces the old, and replaying
 * the old one revokes the whole session.
 */
export const POST = handle("auth-refresh", async (request: Request) => {
  const body = await readBody(request, bodySchema);
  if ("response" in body) return body.response;

  const token = body.value.refreshToken ?? bearerFrom(request);
  if (!token) return fail("UNAUTHORIZED", MESSAGES.sessionExpired);

  const tokens = await refreshReaderSession(token);
  if (!tokens) return fail("UNAUTHORIZED", MESSAGES.sessionExpired);
  return ok(tokens);
});
