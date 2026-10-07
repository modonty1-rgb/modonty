import { readDeviceId, deviceSessionId } from "@/lib/mobile-api/device";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { ACTION_MESSAGES } from "@/lib/mobile-api/messages-actions";
import { subscribeToNewsletter } from "@/lib/newsletter/subscribe-to-newsletter";
// The web route's own limiter module — one in-memory bucket for both doors.
import { isSubscribeRateLimited } from "@/app/api/news/subscribe/is-subscribe-rate-limited";

/**
 * E19 — POST /api/mobile/v1/newsletter · public + X-Device-Id (required) · body `{ email }`.
 * `subscribeToNewsletter` — the web sign-up's logic: same per-IP limiter bucket, unique email (a
 * repeat answers «already» without a second welcome mail), admin Telegram, welcome email,
 * NEWSLETTER conversion keyed on the device instead of the visit cookie.
 */
export const POST = handle("newsletter-subscribe", async (request: Request) => {
  const deviceId = readDeviceId(request);
  if (!deviceId) return fail("VALIDATION_ERROR", MESSAGES.deviceRequired);

  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",") ?? [];
  const clientIp = forwardedFor[forwardedFor.length - 1]?.trim() || "unknown";
  if (isSubscribeRateLimited(clientIp, Date.now())) return fail("RATE_LIMITED", ACTION_MESSAGES.subscribeRateLimited);

  const result = await subscribeToNewsletter({
    body: await request.json().catch(() => null),
    resolveSessionId: async () => deviceSessionId(deviceId),
  });

  if (result === "invalid") return fail("VALIDATION_ERROR", ACTION_MESSAGES.invalidEmail);
  return ok({
    subscribed: true,
    alreadySubscribed: result === "exists",
    // The web route's own texts (`api/news/subscribe/route.ts`).
    message: result === "exists" ? "تم الاشتراك مسبقاً" : "تم الاشتراك بنجاح",
  });
});
