import { recordCtaClick } from "@/lib/analytics/record-cta-click";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { deviceSessionId, readDeviceId } from "@/lib/mobile-api/device";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";

/**
 * T2 — POST /api/mobile/v1/track/cta-click · public + X-Device-Id (required) · Bearer optional.
 * Body = the web's `ctaClickSchema`: `{ type: CTAType, label?≤300, targetUrl?≤2048, articleId?,
 * clientId?, timeOnPage?≥0, scrollDepth? 0–100 }`. `recordCtaClick` — the web route's logic, keyed
 * on the device instead of the cookie (article credit, 20/hour Telegram cap, owner check).
 */
export const POST = handle("track-cta-click", async (request: Request) => {
  const deviceId = readDeviceId(request);
  if (!deviceId) return fail("VALIDATION_ERROR", MESSAGES.deviceRequired);

  let body: unknown;
  try {
    const text = await request.text();
    body = text.trim() ? JSON.parse(text) : {};
  } catch (error) {
    return fail("VALIDATION_ERROR", MESSAGES.invalidBody, error instanceof Error ? error.message : undefined);
  }

  const result = await recordCtaClick({
    body,
    sessionId: deviceSessionId(deviceId),
    resolveUserId: async () => (await readerFromRequest(request))?.id,
    headers: request.headers,
  });
  if (result.kind === "invalid") return fail("VALIDATION_ERROR", MESSAGES.invalidBody, result.fields);
  return ok({ ok: true });
});
