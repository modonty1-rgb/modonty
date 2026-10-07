import { z } from "zod";

import { recordClientView } from "@/lib/analytics/record-client-view";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { deviceSessionId, readDeviceId } from "@/lib/mobile-api/device";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { decodeSlug } from "@/lib/mobile-api/params";
import { readBody } from "@/lib/mobile-api/request";

const bodySchema = z.object({ referrer: z.string().max(2000).nullish() }).default({});

/**
 * E11 — POST /api/mobile/v1/partners/:slug/view · public + X-Device-Id (required) · Bearer optional.
 * `recordClientView` — the web route's counting rule, keyed on the device instead of the cookie.
 */
export const POST = handle("partner-view", async (request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  const deviceId = readDeviceId(request);
  if (!deviceId) return fail("VALIDATION_ERROR", MESSAGES.deviceRequired);

  const slug = decodeSlug((await params).ref);
  if (!slug) return fail("NOT_FOUND", MESSAGES.partnerNotFound);

  const body = await readBody(request, bodySchema);
  if ("response" in body) return body.response;

  const result = await recordClientView({
    slug,
    referrer: body.value.referrer?.trim() || null,
    headers: request.headers,
    resolveSessionId: async () => deviceSessionId(deviceId),
    resolveUserId: async () => (await readerFromRequest(request))?.id,
  });

  if (!result.found) return fail("NOT_FOUND", MESSAGES.partnerNotFound);
  if (result.deduplicated) return ok({ counted: false, ga4: null });
  return ok({ counted: true, ga4: result.ga4 });
});
