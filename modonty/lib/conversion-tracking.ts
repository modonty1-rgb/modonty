import { db } from "@/lib/db";
import { cookies } from "next/headers";
import type { ConversionType } from "@prisma/client";
import { notifyTelegram } from "@/lib/telegram/notify";
import { trackConversionComplete } from "@/lib/analytics/events-registry";

const VIEW_SESSION_COOKIE = "modonty_view_sid";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

// Arabic labels for the Telegram notification (enum values are English).
const CONVERSION_TYPE_AR: Record<ConversionType, string> = {
  SIGNUP: "تسجيل حساب",
  CONTACT_FORM: "نموذج تواصل",
  DOWNLOAD: "تنزيل",
  NEWSLETTER: "اشتراك بالنشرة",
  PURCHASE: "شراء",
  TRIAL_START: "بدء تجربة",
  DEMO_REQUEST: "طلب عرض توضيحي",
  PHONE_CLICK: "ضغط رقم الجوال",
  EMAIL_CLICK: "ضغط البريد",
  DIRECTORY_VIEW: "مشاهدة الدليل",
  BOOKING: "حجز",
  LINK_CLICK: "ضغط رابط خارجي",
};

export async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(VIEW_SESSION_COOKIE)?.value;
  if (!sessionId) {
    sessionId = `view-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    cookieStore.set(VIEW_SESSION_COOKIE, sessionId, {
      maxAge: SESSION_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }
  return sessionId;
}

export interface CreateConversionData {
  type: ConversionType;
  userId?: string;
  clientId?: string;
  articleId?: string;
  sessionId?: string;
  value?: number;
  currency?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string | null;
}

export async function createConversion(data: CreateConversionData): Promise<void> {
  await db.conversion.create({
    data: {
      type: data.type,
      userId: data.userId,
      clientId: data.clientId,
      articleId: data.articleId,
      sessionId: data.sessionId,
      value: data.value,
      currency: data.currency,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      referrer: data.referrer ?? undefined,
    },
  });

  if (data.clientId) {
    notifyTelegram(data.clientId, "conversion", {
      meta: {
        النوع: CONVERSION_TYPE_AR[data.type] ?? String(data.type),
        ...(data.value ? { القيمة: `${data.value} ${data.currency ?? ""}`.trim() } : {}),
      },
      ipAddress: data.ipAddress ?? null,
    }).catch(() => {});
  }

  void trackConversionComplete(
    {
      client_id: data.clientId,
      conversion_type: String(data.type),
    },
    { userId: data.userId },
  );
}
