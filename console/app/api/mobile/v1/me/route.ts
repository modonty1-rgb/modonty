import type { NextRequest } from "next/server";
import { SubscriptionStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";
import { notificationToggles, readNotificationPreferences } from "./preference-groups";

/**
 * S13 «حسابي».
 *
 * `client` keeps the exact shape the app already consumes — the account screen is additive,
 * not a rewrite of the session profile.
 */

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.ACTIVE]: "نشطة",
  [SubscriptionStatus.EXPIRED]: "منتهية",
  [SubscriptionStatus.CANCELLED]: "ملغاة",
  [SubscriptionStatus.PENDING]: "بانتظار التفعيل",
};

export async function GET(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const client = await db.client.findUnique({
    where: { id: session.clientId },
    select: { id: true, name: true, slug: true, email: true, notificationPreferences: true, subscriptionStatus: true, subscriptionTier: true, logoMedia: { select: { url: true, bunnyUrl: true, altText: true } } },
  });
  if (!client) return fail("UNAUTHORIZED", "الحساب لم يعد متاحًا.");
  const preferences = readNotificationPreferences(client.notificationPreferences);
  return ok({
    client,
    account: {
      name: client.name,
      email: client.email,
      planLabel: `باقة ${client.subscriptionTier} ${STATUS_LABELS[client.subscriptionStatus]}`,
      notifications: notificationToggles(preferences),
    },
    review: {
      title: "حسابي",
      backLabel: "رجوع",
      notificationsSectionTitle: "التنبيهات",
      helpSectionTitle: "المساعدة",
      supportTitle: "المساعدة والدعم",
      supportDescription: "تواصل مع فريق مودونتي من داخل التطبيق",
      logoutLabel: "تسجيل الخروج",
      logoutConfirmTitle: "تسجيل الخروج؟",
      logoutConfirmDescription: "بتخرج من حسابك على هذا الجوال، وبتحتاج تسجّل الدخول مرة ثانية.",
      logoutConfirmLabel: "خروج",
      cancelLabel: "إلغاء",
      savingLabel: "يُحفظ…",
      saveErrorTitle: "ما قدرنا نحفظ الإعداد",
      retryLabel: "إعادة المحاولة",
      errorTitle: "ما قدرنا نحمّل الحساب",
      offlineTitle: "ما في اتصال",
      offlineDescription: "تأكد من الإنترنت وجرّب مرة ثانية.",
    },
  });
}
