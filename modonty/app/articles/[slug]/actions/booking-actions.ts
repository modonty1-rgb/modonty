"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ClientCtaMode, ConversionType, CTAType, UserRole } from "@prisma/client";
import { bookingSchema, type BookingFormData } from "../helpers/schemas/booking-schema";
import { notifyTelegram } from "@/lib/telegram/notify";
import { createConversion } from "@/lib/conversion-tracking";

export type BookingSource =
  | "article_dock"
  | "article_card"
  | "client_page"
  | "client_list";

interface BookingContext {
  clientId: string;
  articleId?: string | null;
  source: BookingSource;
}

/** Local 05…/01… → E.164 (+9665…/+201…). Other forms get a leading +. */
function normalizePhone(raw: string): string {
  const v = raw.replace(/[\s-]/g, "");
  if (/^05\d{8}$/.test(v)) return "+966" + v.slice(1);
  if (/^01\d{9}$/.test(v)) return "+20" + v.slice(1);
  if (/^9665\d{8}$/.test(v) || /^201\d{9}$/.test(v)) return "+" + v;
  return v.startsWith("+") ? v : "+" + v;
}

export async function submitBookingRequest(
  data: BookingFormData,
  ctx: BookingContext
): Promise<{ success: boolean; error?: string }> {
  // 1. Auth — booking requires a logged-in visitor (warm, identified lead)
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "يجب تسجيل الدخول للحجز" };
  }

  // 2. Validate
  const parsed = bookingSchema.safeParse(data);
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return {
      success: false,
      error: f.phone?.[0] ?? f.preferredAt?.[0] ?? f.message?.[0] ?? "البيانات غير صالحة",
    };
  }

  // 3. Client must exist + be in FORM mode (never accept bookings for NONE/LINK)
  const client = await db.client.findUnique({
    where: { id: ctx.clientId },
    select: { id: true, name: true, slug: true, userId: true, ctaMode: true },
  });
  if (!client) return { success: false, error: "الشركة غير موجودة" };
  if (client.ctaMode !== ClientCtaMode.FORM) {
    return { success: false, error: "الحجز غير متاح لهذه الشركة" };
  }

  // 4. Anti-spam — one booking per (user × client) per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await db.bookingRequest.count({
    where: { userId: session.user.id, clientId: client.id, createdAt: { gte: oneHourAgo } },
  });
  if (recent > 0) {
    return {
      success: false,
      error: "أرسلت طلب حجز لهذه الشركة مؤخراً — انتظر قليلاً قبل إرسال طلب جديد.",
    };
  }

  const phone = normalizePhone(parsed.data.phone);
  const preferredAt = parsed.data.preferredAt ? new Date(parsed.data.preferredAt) : null;
  const message = (parsed.data.message || "").trim() || null;

  // Request context (IP + UA snapshot)
  const h = await headers();
  const ipAddress =
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    h.get("x-real-ip") ||
    h.get("cf-connecting-ip") ||
    null;
  const userAgent = h.get("user-agent") || null;

  const name = session.user.name ?? "";
  const email = session.user.email ?? "";

  // 5. Persist the lead
  let bookingId: string;
  try {
    const booking = await db.bookingRequest.create({
      data: {
        clientId: client.id,
        articleId: ctx.articleId ?? null,
        userId: session.user.id,
        source: ctx.source,
        name,
        email,
        phone,
        preferredAt,
        message,
        status: "new",
        ipAddress,
        userAgent,
      },
      select: { id: true },
    });
    bookingId = booking.id;
  } catch {
    return { success: false, error: "تعذّر حفظ طلب الحجز، حاول مرة ثانية." };
  }

  // 6. Internal notification → client owner (fallback to an admin)
  try {
    let recipientUserId = client.userId;
    if (!recipientUserId) {
      const admin = await db.user.findFirst({ where: { role: UserRole.ADMIN }, select: { id: true } });
      recipientUserId = admin?.id ?? null;
    }
    if (recipientUserId) {
      await db.notification.create({
        data: {
          userId: recipientUserId,
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

  // 8. Conversion (records Conversion row + GA4 conversion_complete + opt-in conversion Telegram)
  await createConversion({
    type: ConversionType.BOOKING,
    userId: session.user.id,
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
        userId: session.user.id,
      },
    })
    .catch(() => {});

  return { success: true };
}
