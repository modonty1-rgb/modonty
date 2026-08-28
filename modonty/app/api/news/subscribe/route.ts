import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import type { ApiResponse } from "@/lib/types";
import { getOrCreateSessionId, createConversion } from "@/lib/analytics/conversion-tracking";
import { ConversionType } from "@prisma/client";
import { sendEmail } from "@/lib/email/resend-client";
import { newsletterWelcomeEmail } from "@modonty/shared/lib/email/templates/newsletter-welcome";
import { sendAdminTelegram } from "@modonty/shared/lib/telegram/client";
import { isSubscribeRateLimited } from "./is-subscribe-rate-limited";
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

export async function POST(request: NextRequest) {
  try {
    /**
     * The signup bucket. Vercel overwrites `x-forwarded-for` with the address it actually
     * accepted the connection from and refuses to forward an external one
     * (vercel.com/docs/headers/request-headers), so the caller cannot pick their own bucket.
     * The LAST entry is read, not the first: a forged list is prepended by the sender and
     * appended to by each proxy, so only the tail was written by infrastructure we run.
     */
    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",") ?? [];
    const clientIp = forwardedFor[forwardedFor.length - 1]?.trim() || "unknown";
    if (isSubscribeRateLimited(clientIp, Date.now())) {
      return NextResponse.json(
        { success: false, error: "محاولات كثيرة. جرّب بعد شوي." } as ApiResponse<never>,
        { status: 429 }
      );
    }

    const parsed = subscribeSchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "البريد الإلكتروني غير صحيح" } as ApiResponse<never>,
        { status: 400 }
      );
    }

    const normalizedEmail = parsed.data.email.toLowerCase();

    const existing = await db.newsSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        data: { message: "تم الاشتراك مسبقاً" },
      } as ApiResponse<{ message: string }>);
    }

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
    sendAdminTelegram(`🔔 <b>مشترك جديد — نشرة مدونتي</b>\n📧 ${normalizedEmail}\n📅 ${now}`).catch(() => null);

    // Send welcome email — non-blocking, failure doesn't affect subscription
    newsletterWelcomeEmail({ email: normalizedEmail })
      .then((mail) => sendEmail({ to: normalizedEmail, ...mail }))
      .catch((err) =>
      console.error("[news/subscribe] Welcome email failed:", err)
    );

    const sessionId = await getOrCreateSessionId();
    await createConversion({
      type: ConversionType.NEWSLETTER,
      sessionId,
    });

    return NextResponse.json({
      success: true,
      data: { message: "تم الاشتراك بنجاح" },
    } as ApiResponse<{ message: string }>);
  } catch (error) {
    console.error("[news/subscribe] Error:", error);
    return NextResponse.json(
      { success: false, error: "فشل الاشتراك" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
