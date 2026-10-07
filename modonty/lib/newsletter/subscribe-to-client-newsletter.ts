import "server-only";

import { ConversionType } from "@prisma/client";
import { z } from "zod";

import { db } from "@/lib/db";
import { createConversion } from "@/lib/analytics/conversion-tracking";
import { notifyTelegram } from "@/lib/telegram/notify-telegram";
import { trackNewsletterSubscribe } from "@/lib/analytics/events-registry";
import { sendAdminTelegram } from "@modonty/shared/lib/telegram/client";
import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";
import { fireClientEvent } from "@modonty/shared/lib/mobile-push";

const subscribeSchema = z.object({
  email: z.string().email().max(254),
  clientId: z.string().min(1),
});

export type ClientNewsletterResult = "invalid" | "rate_limited" | "exists" | "created";

/**
 * Subscribe an email to one partner's newsletter — the body of `POST /api/subscribers`, shared by
 * the web route (conversion keyed on the visit cookie) and the mobile API (keyed on the device).
 * Same limit for both: 5 sign-ups per email per hour, counted in the DB.
 */
export async function subscribeToClientNewsletter(input: {
  body: unknown;
  headers: Headers;
  resolveSessionId: () => Promise<string>;
}): Promise<ClientNewsletterResult> {
  const parsed = subscribeSchema.safeParse(input.body);
  if (!parsed.success) return "invalid";

  const { email, clientId } = parsed.data;

  // Rate limit: max 5 subscription attempts per email per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await db.subscriber.count({
    where: { email, subscribedAt: { gt: oneHourAgo } },
  });
  if (recentCount >= 5) return "rate_limited";

  // Check if already subscribed for this client
  const existing = await db.subscriber.findFirst({
    where: { email, clientId },
    select: { id: true },
  });
  if (existing) return "exists";

  const [, client] = await Promise.all([
    db.subscriber.create({
      data: {
        email,
        clientId,
        subscribed: true,
        subscribedAt: new Date(),
        consentGiven: true,
        consentDate: new Date(),
      },
      select: { id: true },
    }),
    db.client.findUnique({
      where: { id: clientId },
      select: { slug: true, name: true, industry: { select: { name: true } } },
    }),
  ]);

  // Notify Telegram group (admin) — non-blocking
  const now = new Date().toLocaleString(SITE_LOCALE, { timeZone: "Asia/Riyadh", dateStyle: "short", timeStyle: "short" });
  sendAdminTelegram(`🔔 <b>مشترك جديد</b>\n📧 ${email}\n🏢 ${client?.name || clientId}\n📅 ${now}`).catch((e: unknown) =>
    console.error("[subscribeToClientNewsletter] admin telegram", e),
  );

  // Notify Client's Telegram (per-client) — non-blocking
  const ip =
    input.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    input.headers.get("x-real-ip") ||
    input.headers.get("cf-connecting-ip") ||
    null;
  fireClientEvent(clientId, { kind: "subscriber" });
  notifyTelegram(clientId, "clientSubscribe", {
    meta: { البريد: email },
    ipAddress: ip,
    headers: input.headers,
  }).catch((e: unknown) => console.error("[subscribeToClientNewsletter] telegram", e));

  await createConversion({
    type: ConversionType.NEWSLETTER,
    clientId,
    sessionId: await input.resolveSessionId(),
  });

  void trackNewsletterSubscribe({
    client_id: clientId,
    client_slug: client?.slug,
    client_name: client?.name,
    client_industry: client?.industry?.name,
  });

  return "created";
}
