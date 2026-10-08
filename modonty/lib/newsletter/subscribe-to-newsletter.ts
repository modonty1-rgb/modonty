import "server-only";

import { ConversionType } from "@prisma/client";
import { z } from "zod";

import { db } from "@/lib/db";
import { createConversion } from "@/lib/analytics/conversion-tracking";
import { sendEmail } from "@/lib/email/resend-client";
import { newsletterWelcomeEmail } from "@modonty/shared/lib/email/templates/newsletter-welcome";
import { sendAdminTelegram } from "@modonty/shared/lib/telegram/client";
import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

/**
 * `email.includes("@")` accepted `"@"` itself, a header injection, or a 100KB string — and the
 * address is what the welcome mail is addressed to, so anything that slipped through was a
 * message our domain sent on the attacker's behalf.
 */
const subscribeSchema = z.object({
  // 254 is the RFC 5321 ceiling for a full address; longer is never deliverable.
  email: z.string().trim().email().max(254),
});

export type NewsletterSubscribeResult = "invalid" | "exists" | "created";

/**
 * Modonty's own newsletter sign-up — the body of `POST /api/news/subscribe`, shared by the web
 * route (conversion keyed on the visit cookie) and the mobile API (keyed on the device). Each door
 * runs the per-IP limiter (`is-subscribe-rate-limited.ts`, one in-memory bucket) BEFORE calling
 * this; the durable guard is `NewsSubscriber.email` being unique — one address never gets a
 * second welcome mail.
 */
export async function subscribeToNewsletter(input: {
  body: unknown;
  resolveSessionId: () => Promise<string>;
}): Promise<NewsletterSubscribeResult> {
  const parsed = subscribeSchema.safeParse(input.body);
  if (!parsed.success) return "invalid";

  const normalizedEmail = parsed.data.email.toLowerCase();

  const existing = await db.newsSubscriber.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });
  if (existing) return "exists";

  await db.newsSubscriber.create({
    data: {
      email: normalizedEmail,
      subscribed: true,
      subscribedAt: new Date(),
      consentGiven: true,
      consentDate: new Date(),
    },
  });

  // Notify Telegram group — non-blocking
  const now = new Date().toLocaleString(SITE_LOCALE, { timeZone: "Asia/Riyadh", dateStyle: "short", timeStyle: "short" });
  sendAdminTelegram(`🔔 <b>مشترك جديد — نشرة مدونتي</b>\n📧 ${normalizedEmail}\n📅 ${now}`).catch((e: unknown) =>
    console.error("[subscribeToNewsletter] telegram", e),
  );

  // Send welcome email — non-blocking, failure doesn't affect subscription
  newsletterWelcomeEmail({ email: normalizedEmail })
    .then((mail) => sendEmail({ to: normalizedEmail, ...mail }))
    .catch((err) => console.error("[news/subscribe] Welcome email failed:", err));

  await createConversion({
    type: ConversionType.NEWSLETTER,
    sessionId: await input.resolveSessionId(),
  });

  return "created";
}
