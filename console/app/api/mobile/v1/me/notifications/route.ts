import type { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";
import { readBody } from "@/lib/mobile-api/request";
import { mergeNotificationPreferences, notificationToggles, readNotificationPreferences } from "../preference-groups";

/** S13 — saving one notification switch. One switch per call, so a failure names its own row. */
const input = z.object({ key: z.enum(["actionable", "activity"]), enabled: z.boolean() });

export async function PATCH(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const parsed = await readBody(request, input);
  if ("response" in parsed) return parsed.response;
  const current = await db.client.findUnique({ where: { id: session.clientId }, select: { notificationPreferences: true } });
  if (!current) return fail("UNAUTHORIZED", "الحساب لم يعد متاحًا.");
  const updated = await db.client.update({
    where: { id: session.clientId },
    data: { notificationPreferences: mergeNotificationPreferences(current.notificationPreferences, parsed.value.key, parsed.value.enabled) },
    select: { notificationPreferences: true },
  });
  return ok({ notifications: notificationToggles(readNotificationPreferences(updated.notificationPreferences)) });
}
