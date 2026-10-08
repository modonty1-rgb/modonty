import { SharePlatform } from "@prisma/client";
import { z } from "zod";

import { recordClientShare } from "@/lib/analytics/record-client-share";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { deviceSessionId, readDeviceId } from "@/lib/mobile-api/device";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { decodeSlug } from "@/lib/mobile-api/params";
import { readBody } from "@/lib/mobile-api/request";

const bodySchema = z.object({ platform: z.nativeEnum(SharePlatform) });

/**
 * E11 — POST /api/mobile/v1/partners/:slug/share · public + X-Device-Id (required) · Bearer optional.
 * `recordClientShare` — the web share route's logic (Share row · partner push · Telegram · GA4),
 * keyed on the device instead of the cookie.
 */
export const POST = handle("partner-share", async (request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  const deviceId = readDeviceId(request);
  if (!deviceId) return fail("VALIDATION_ERROR", MESSAGES.deviceRequired);

  const slug = decodeSlug((await params).ref);
  if (!slug) return fail("NOT_FOUND", MESSAGES.partnerNotFound);

  const body = await readBody(request, bodySchema);
  if ("response" in body) return body.response;

  const result = await recordClientShare({
    slug,
    platform: body.value.platform,
    sessionId: deviceSessionId(deviceId),
    resolveUserId: async () => (await readerFromRequest(request))?.id,
    headers: request.headers,
  });

  if (result === "not_found") return fail("NOT_FOUND", MESSAGES.partnerNotFound);
  return ok({ ok: true });
});
