"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ClientCtaMode, ConversionType, CTAType } from "@prisma/client";
import { bookingSchema, type BookingFormData } from "../helpers/schemas/booking-schema";
import { notifyTelegram } from "@/lib/telegram/notify";
import { createConversion } from "@/lib/conversion-tracking";
import {
  trackBookingAttempt,
  trackBookingFailed,
  trackBookingSubmit,
  trackBookingWhatsappClick,
  trackBookingFormStart,
  type BookingFailReason,
} from "@/lib/analytics/events-registry";
import { getVisitorContext } from "@/lib/analytics/visitor-cookie";
import { getGeoFromHeaders } from "@/lib/analytics/geo-headers";
import { sendEmail } from "@/lib/email/resend-client";
import { bookingNotificationEmail } from "@/lib/email/templates/booking-notification";

export type BookingSource =
  | "article_dock"
  | "article_card"
  | "client_page"
  | "client_list";

interface BookingContext {
  clientId: string;
  articleId?: string | null;
  source: BookingSource;
  /** Visitor ticked the YMYL acknowledgment. Required server-side when client.isYmyl. */
  disclaimerAccepted?: boolean;
  /** Visitor opted in to Modonty's newsletter (separate, explicit, PDPL opt-in). */
  marketingConsent?: boolean;
}

/** Local 05…/01… → E.164 (+9665…/+201…). Other forms get a leading +. */
function normalizePhone(raw: string): string {
  const v = raw.replace(/[\s-]/g, "");
  if (/^05\d{8}$/.test(v)) return "+966" + v.slice(1);
  if (/^01\d{9}$/.test(v)) return "+20" + v.slice(1);
  if (/^9665\d{8}$/.test(v) || /^201\d{9}$/.test(v)) return "+" + v;
  return v.startsWith("+") ? v : "+" + v;
}

/**
 * Failures that never reach `submitBookingRequest` — the form blocked them first
 * (client-side zod, or the YMYL disclaimer gate). Without this the visitor simply
 * vanishes: no row, no event, nothing to explain the drop-off.
 */
export async function trackBookingBlocked(
  ctx: BookingContext,
  reason: Extract<BookingFailReason, "invalid_input" | "disclaimer_required">
): Promise<void> {
  const funnel = {
    client_id: ctx.clientId,
    booking_source: ctx.source,
    ...(ctx.articleId ? { article_id: ctx.articleId } : {}),
  };
  void trackBookingAttempt(funnel);
  void trackBookingFailed({ ...funnel, reason });
}

/**
 * WhatsApp lead — recorded the instant the visitor taps the WhatsApp CTA, BEFORE they
 * leave to wa.me. Modonty's proof-of-delivery: «we handed the provider a lead».
 * Deduped to ONE lead per (visitor × client × session): repeat taps in the same visit
 * don't inflate the count; a genuine return visit (new session) counts as a fresh lead.
 * Anonymous by design — the phone/name live in the WhatsApp chat, not with us.
 */
export async function recordWhatsappLead(ctx: {
  clientId: string;
  source: BookingSource;
  articleId?: string | null;
}): Promise<void> {
  // GA4 counts every click (analytics); the DB lead stays deduped (one source of truth).
  void trackBookingWhatsappClick({
    client_id: ctx.clientId,
    booking_source: ctx.source,
    ...(ctx.articleId ? { article_id: ctx.articleId } : {}),
  });

  try {
    const { clientId: visitorId, sessionId } = await getVisitorContext();

    // Dedup: same visitor + client + session → already recorded this visit.
    const existing = await db.bookingRequest.findFirst({
      where: { clientId: ctx.clientId, channel: "whatsapp", visitorId, sessionId },
      select: { id: true },
    });
    if (existing) return;

    const h = await headers();
    const geo = getGeoFromHeaders(h);
    const ipAddress =
      h.get("x-forwarded-for")?.split(",")[0].trim() ||
      h.get("x-real-ip") ||
      h.get("cf-connecting-ip") ||
      null;

    await db.bookingRequest.create({
      data: {
        clientId: ctx.clientId,
        articleId: ctx.articleId ?? null,
        source: ctx.source,
        channel: "whatsapp",
        status: "new",
        visitorId,
        sessionId,
        country: geo.country,
        city: geo.city,
        ipAddress,
        userAgent: h.get("user-agent") || null,
      },
      select: { id: true },
    });
    // No provider notification here by design: the visitor's message reaches the provider
    // on WhatsApp directly. The console row is the record; Telegram would be duplicate.
  } catch {
    // recording must never block the WhatsApp handoff
  }
}

/**
 * Fired on first interaction with the callback form (first field focus) — closes the
 * blind spot between «opened /book» and «pressed submit» so drop-off is finally visible.
 */
export async function trackBookingFormStartAction(ctx: {
  clientId: string;
  source: BookingSource;
  articleId?: string | null;
}): Promise<void> {
  void trackBookingFormStart({
    client_id: ctx.clientId,
    booking_source: ctx.source,
    ...(ctx.articleId ? { article_id: ctx.articleId } : {}),
  });
}

export async function submitBookingRequest(
  data: BookingFormData,
  ctx: BookingContext
): Promise<{ success: boolean; error?: string }> {
  // 0. Funnel: the visitor pressed the button. Recorded BEFORE any check, so a
  //    booking that dies in validation still shows up as intent. The gap between
  //    booking_attempt and booking_submit is where we lose people.
  const funnel = { client_id: ctx.clientId, booking_source: ctx.source, ...(ctx.articleId ? { article_id: ctx.articleId } : {}) };
  void trackBookingAttempt(funnel);

  const fail = (reason: BookingFailReason, error: string) => {
    void trackBookingFailed({ ...funnel, reason });
    return { success: false, error };
  };

  // 1. Validate
  const parsed = bookingSchema.safeParse(data);
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return fail(
      "invalid_input",
      f.phone?.[0] ?? f.preferredAt?.[0] ?? f.message?.[0] ?? "البيانات غير صالحة"
    );
  }

  // 2. Client must exist + be in FORM mode (never accept bookings for NONE/LINK)
  const client = await db.client.findUnique({
    where: { id: ctx.clientId },
    select: {
      id: true,
      name: true,
      slug: true,
      userId: true,
      ctaMode: true,
      isYmyl: true,
      user: { select: { email: true, name: true } },
    },
  });
  if (!client) return fail("client_not_found", "الشركة غير موجودة");
  if (client.ctaMode !== ClientCtaMode.FORM) {
    return fail("cta_not_form", "الحجز غير متاح لهذه الشركة");
  }
  // YMYL (medical/legal/financial) clients require the visitor to accept the
  // liability acknowledgment before a booking is recorded — enforced server-side
  // regardless of the UI, so the checkbox can't be bypassed.
  if (client.isYmyl && !ctx.disclaimerAccepted) {
    return fail("disclaimer_required", "يجب الموافقة على الإقرار قبل إرسال الطلب.");
  }

  // 3. Session is OPTIONAL — no login required; the phone number identifies the lead.
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const phone = normalizePhone(parsed.data.phone);
  const preferredAt = parsed.data.preferredAt ? new Date(parsed.data.preferredAt) : null;
  const message = (parsed.data.message || "").trim() || null;

  // Request context (IP + UA snapshot) — also used for anti-spam.
  const h = await headers();
  const ipAddress =
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    h.get("x-real-ip") ||
    h.get("cf-connecting-ip") ||
    null;
  const userAgent = h.get("user-agent") || null;

  // 4. Anti-spam (no auth) — one booking per (phone × client) per hour + per-IP burst cap.
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await db.bookingRequest.count({
    where: { clientId: client.id, phone, createdAt: { gte: oneHourAgo } },
  });
  if (recent > 0) {
    return fail(
      "rate_limited",
      "أرسلت طلب حجز لهذه الشركة مؤخراً — انتظر قليلاً قبل إرسال طلب جديد."
    );
  }
  if (ipAddress) {
    const ipBurst = await db.bookingRequest.count({
      where: { ipAddress, createdAt: { gte: oneHourAgo } },
    });
    if (ipBurst >= 8) {
      return fail("rate_limited", "وصلت للحد الأقصى من الطلبات مؤقتاً — حاول لاحقاً.");
    }
  }

  // Identity snapshot — form name (or session name) identifies the lead; email if logged in.
  const name = (parsed.data.name || "").trim() || session?.user?.name || "زائر";
  // Prefer the email the visitor typed; fall back to their session email if logged in.
  const email = (parsed.data.email || "").trim() || session?.user?.email || "";

  // 5. Persist the lead
  let bookingId: string;
  try {
    const booking = await db.bookingRequest.create({
      data: {
        clientId: client.id,
        articleId: ctx.articleId ?? null,
        userId,
        source: ctx.source,
        name,
        email,
        phone,
        preferredAt,
        message,
        status: "new",
        ipAddress,
        userAgent,
        disclaimerAccepted: ctx.disclaimerAccepted ?? false,
        disclaimerAcceptedAt: ctx.disclaimerAccepted ? new Date() : null,
      },
      select: { id: true },
    });
    bookingId = booking.id;
  } catch {
    return fail("db_write_failed", "تعذّر حفظ طلب الحجز، حاول مرة ثانية.");
  }

  // 6. Internal notification → a staff admin (bell icon). Staff live in their own
  //    table now, so the recipient is a staffId (not a users row).
  try {
    const admin = await db.staff.findFirst({ where: { role: "ADMIN" }, select: { id: true } });
    if (admin?.id) {
      await db.notification.create({
        data: {
          staffId: admin.id,
          clientId: client.id,
          type: "booking_request",
          title: "طلب حجز جديد",
          body: `${name || "زائر"} طلب حجزاً${message ? ` — ${message.slice(0, 80)}` : ""}`,
          relatedId: bookingId,
          readAt: null,
        },
      });
    }
  } catch {
    // notification failure must not block the lead
  }

  // 6b. Email the provider (doctor / business owner) — standard backup channel,
  //     always sent. Falls back to an admin address if the owner has no email.
  try {
    let recipientEmail = client.user?.email ?? null;
    if (!recipientEmail) {
      const admin = await db.staff.findFirst({
        where: { role: "ADMIN", email: { not: null } },
        select: { email: true },
      });
      recipientEmail = admin?.email ?? null;
    }
    if (recipientEmail) {
      const mail = bookingNotificationEmail({
        providerName: client.name,
        visitorName: name,
        phone,
        email,
        preferredAtLabel: preferredAt ? preferredAt.toLocaleString("ar-EG") : null,
        message,
        bookingsUrl: "https://console.modonty.com/dashboard/bookings",
      });
      await sendEmail({ to: recipientEmail, ...mail });
    }
  } catch {
    // email must never block the lead
  }

  // 7. Telegram (rich lead message — default-ON event; geo resolved inside notify)
  notifyTelegram(client.id, "bookingRequest", {
    title: "طلب حجز جديد",
    body: `${name || "زائر"} — ${phone}`,
    meta: {
      "البريد": email,
      ...(preferredAt ? { "الموعد المفضّل": preferredAt.toLocaleString("ar-EG") } : {}),
      ...(message ? { "ملاحظة": message.slice(0, 120) } : {}),
    },
    link: { label: "إدارة الحجوزات", url: "https://console.modonty.com/dashboard/bookings" },
    ipAddress,
    headers: h,
  }).catch(() => {});

  // 8. GA4 booking_submit — distinct event so Google's booking count matches
  //    our DB one-to-one (Khalid 2026-07-07: «Google = Database»).
  void trackBookingSubmit(
    {
      client_id: client.id,
      client_slug: client.slug,
      client_name: client.name,
      booking_source: ctx.source,
      ...(ctx.articleId ? { article_id: ctx.articleId } : {}),
    },
    userId ? { userId } : undefined,
  );

  // 8b. Conversion (records Conversion row + GA4 conversion_complete + opt-in conversion Telegram)
  await createConversion({
    type: ConversionType.BOOKING,
    userId: userId ?? undefined,
    clientId: client.id,
    articleId: ctx.articleId ?? undefined,
    ipAddress: ipAddress ?? undefined,
    userAgent: userAgent ?? undefined,
  }).catch(() => {});

  // 9. CTAClick (FORM)
  await db.cTAClick
    .create({
      data: {
        type: CTAType.FORM,
        label: "احجز الآن",
        articleId: ctx.articleId ?? undefined,
        clientId: client.id,
        userId: userId ?? undefined,
      },
    })
    .catch(() => {});

  // 10. Marketing opt-in → Modonty's own newsletter (NewsSubscriber). SEPARATE from the
  //     lead sent to the client; only when the visitor explicitly consented AND gave an
  //     email (PDPL explicit opt-in). Never blocks the booking.
  if (ctx.marketingConsent && email) {
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const existing = await db.newsSubscriber.findUnique({ where: { email: normalizedEmail } });
      if (!existing) {
        await db.newsSubscriber.create({
          data: {
            email: normalizedEmail,
            name: (parsed.data.name || "").trim() || null,
            subscribed: true,
            subscribedAt: new Date(),
            consentGiven: true,
            consentDate: new Date(),
          },
        });
      }
    } catch {
      // newsletter capture must never block the booking
    }
  }

  return { success: true };
}
