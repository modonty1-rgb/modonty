import { updateArticleAnalytics } from "@/lib/analytics/update-article-analytics";
import { deviceSessionId, readDeviceId } from "@/lib/mobile-api/device";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { ACTION_MESSAGES } from "@/lib/mobile-api/messages-actions";
import { rejectMalformedIds } from "@/lib/mobile-api/params";

/**
 * E7 — PATCH /api/mobile/v1/analytics/:id · public + X-Device-Id (required).
 * Body (all optional): `{ timeOnPage≥0, scrollDepth 0–100, bounced, lcp≥0, cls≥0, inp≥0 }`.
 * `updateArticleAnalytics` — the web beacon's logic; the row (the `analyticsId` E6 returned) must
 * belong to this device (`Analytics.sessionId === "app:<deviceId>"`) instead of the cookie.
 */
export const PATCH = handle("analytics-update", async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const deviceId = readDeviceId(request);
  if (!deviceId) return fail("VALIDATION_ERROR", MESSAGES.deviceRequired);

  const { id } = await params;
  const malformed = rejectMalformedIds([id], ACTION_MESSAGES.analyticsNotFound);
  if (malformed) return malformed;

  let body: unknown;
  try {
    const text = await request.text();
    body = text.trim() ? JSON.parse(text) : {};
  } catch (error) {
    return fail("VALIDATION_ERROR", MESSAGES.invalidBody, error instanceof Error ? error.message : undefined);
  }

  const result = await updateArticleAnalytics(id, body, deviceSessionId(deviceId));
  if (result.kind === "invalid") return fail("VALIDATION_ERROR", MESSAGES.invalidBody, result.fields);
  if (result.kind === "not_found") return fail("NOT_FOUND", ACTION_MESSAGES.analyticsNotFound);
  if (result.kind === "forbidden") return fail("FORBIDDEN", ACTION_MESSAGES.analyticsForbidden);
  return ok({ ok: true });
});
