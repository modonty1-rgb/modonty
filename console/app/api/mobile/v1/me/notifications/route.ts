import type { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";
import { readBody } from "@/lib/mobile-api/request";
import { eventToggles, isClientEventKind, mergeEventPreference, mergeNotificationPreferences, notificationToggles, readNotificationPreferences } from "@modonty/shared/lib/mobile-push";

/** S13 — saving one notification switch. One switch per call, so a failure names its own row. */
/** المفتاح مجموعة (التطبيق الأقدم) أو حدث واحد من الكتالوج (٦ أكتوبر ٢٠٢٦). */
const input = z.object({
  key: z.string().refine((key) => key === "actionable" || key === "activity" || isClientEventKind(key), "إعداد غير معروف."),
  enabled: z.boolean(),
});

export async function PATCH(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const parsed = await readBody(request, input);
  if ("response" in parsed) return parsed.response;
  const current = await db.client.findUnique({ where: { id: session.clientId }, select: { notificationPreferences: true } });
  if (!current) return fail("UNAUTHORIZED", "الحساب لم يعد متاحًا.");
  const updated = await db.client.update({
    where: { id: session.clientId },
    data: {
      notificationPreferences: isClientEventKind(parsed.value.key)
        ? mergeEventPreference(current.notificationPreferences, parsed.value.key, parsed.value.enabled)
        : mergeNotificationPreferences(current.notificationPreferences, parsed.value.key as "actionable" | "activity", parsed.value.enabled),
    },
    select: { notificationPreferences: true },
  });
  const preferences = readNotificationPreferences(updated.notificationPreferences);
  return ok({ notifications: notificationToggles(preferences), notificationEvents: eventToggles(preferences) });
}
