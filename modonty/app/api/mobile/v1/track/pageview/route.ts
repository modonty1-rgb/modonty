import { z } from "zod";

import { recordPageView } from "@/lib/analytics/record-page-view";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { deviceSessionId, readDeviceId } from "@/lib/mobile-api/device";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { readBody } from "@/lib/mobile-api/request";

const bodySchema = z.object({ path: z.string().min(1).max(500) });

/**
 * T1 — POST /api/mobile/v1/track/pageview · public + X-Device-Id (required).
 * `recordPageView` — the web tracker's rule (article/partner paths are owned by their own
 * trackers; a refresh of the same path is not a new view), keyed on the device. The web's
 * User-Agent bot filter does not apply to an app's fixed UA; a request without `X-App-Version`
 * is treated as a non-app caller and skipped, the way the web skips a bot.
 */
export const POST = handle("track-pageview", async (request: Request) => {
  const deviceId = readDeviceId(request);
  if (!deviceId) return fail("VALIDATION_ERROR", MESSAGES.deviceRequired);

  const body = await readBody(request, bodySchema);
  if ("response" in body) return body.response;

  const result = await recordPageView({
    rawPath: body.value.path,
    isBot: () => !request.headers.get("x-app-version")?.trim(),
    userAgent: request.headers.get("user-agent"),
    referrer: null,
    resolveSessionId: async () => deviceSessionId(deviceId),
    resolveUserId: async () => (await readerFromRequest(request))?.id,
  });

  if (result.recorded) return ok({ recorded: true, skipped: null });
  if (result.reason === "invalid") return fail("VALIDATION_ERROR", MESSAGES.invalidBody);
  return ok({ recorded: false, skipped: result.reason });
});
