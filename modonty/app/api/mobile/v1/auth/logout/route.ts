import { z } from "zod";

import { endReaderSession } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { readBody } from "@/lib/mobile-api/request";
import { disableReaderDevices } from "@modonty/shared/lib/reader-push/disable-reader-devices";

const bodySchema = z
  .object({
    refreshToken: z.string().max(200).optional(),
    /** This phone's X-Device-Id — its push rows (`ReaderDevice`) are disabled with the session. */
    deviceId: z.string().regex(/^[A-Za-z0-9-]{8,64}$/).optional(),
  })
  .default({});

/**
 * A6 — POST /api/mobile/v1/auth/logout · Bearer access token (or `{ refreshToken }` when the access
 * token has already expired). Revokes THIS session only; any later request with its tokens → 401.
 * A second logout with the same token still answers 200. With `deviceId`, the reader's push rows
 * for that phone are disabled too (fixes console audit item 3: pushes kept arriving after logout).
 */
export const POST = handle("auth-logout", async (request: Request) => {
  const body = await readBody(request, bodySchema);
  if ("response" in body) return body.response;

  const userId = await endReaderSession(request, body.value.refreshToken);
  if (!userId) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  if (body.value.deviceId) await disableReaderDevices({ userId, deviceId: body.value.deviceId }, "SignedOut");
  return ok({ signedOut: true });
});
