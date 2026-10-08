import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { readBody } from "@/lib/mobile-api/request";
import { getAlertSettingsAs } from "@/lib/users/get-alert-settings-as";
import { alertsInput, updateAlertSettingsAs } from "@/lib/users/update-alert-settings-as";

/**
 * A12 — GET /api/mobile/v1/me/alerts · Bearer.
 * `getAlertSettingsAs` — the «التنبيهات» section's read: `{ email, phone, marketingEmails, topics:
 * { [topicId]: channel[] } }` (topics/channels from `lib/users/alert-topics.ts`).
 */
export const GET = handle("me-alerts", async (request: Request) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  const settings = await getAlertSettingsAs(reader.id);
  if (!settings) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  return ok(settings);
});

/**
 * A12 — PUT /api/mobile/v1/me/alerts · Bearer · `{ marketingEmails, topics: { [topicId]: channel[] },
 * phoneDial?, phone? }` (the web form's own payload, `alertsInput`).
 * `updateAlertSettingsAs` — unknown topics/channels dropped, a phone (E.164) required only for
 * WhatsApp/SMS, consent dates kept unless channels change. → the fresh settings (as GET).
 */
export const PUT = handle("me-alerts-update", async (request: Request) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  const body = await readBody(request, alertsInput);
  if ("response" in body) return body.response;

  const result = await updateAlertSettingsAs(reader.id, body.value);
  if (!result.success) {
    if (result.error === "Unauthorized") return fail("UNAUTHORIZED", MESSAGES.unauthorized);
    if (result.error === "تعذّر الحفظ، حاول مرة ثانية") return fail("INTERNAL_ERROR", result.error);
    return fail("VALIDATION_ERROR", result.error ?? MESSAGES.invalidBody);
  }
  const settings = await getAlertSettingsAs(reader.id);
  if (!settings) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  return ok(settings);
});
