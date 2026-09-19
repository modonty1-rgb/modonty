import type { NextRequest } from "next/server";
import { ArticleStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { arabicCurrency, arabicLongDateLatin } from "@/lib/mobile-api/arabic-format";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";
import { getActiveOrderForClient } from "@/lib/subscription/active-order";

const statusLabels: Record<string, string> = { ACTIVE: "نشط", PENDING: "بانتظار التفعيل", EXPIRED: "منتهي", SUSPENDED: "معلّق", CANCELLED: "ملغي" };
const positiveStatuses = new Set(["ACTIVE"]);
const dangerStatuses = new Set(["EXPIRED", "CANCELLED"]);



export async function GET(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [client, articlesPublishedThisMonth, activeOrder] = await Promise.all([
    db.client.findUnique({
      where: { id: session.clientId },
      select: {
        subscriptionStatus: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        articlesPerMonth: true,
        addressCountry: true,
      },
    }),
    db.article.count({ where: { clientId: session.clientId, status: ArticleStatus.PUBLISHED, createdAt: { gte: startOfMonth } } }),
    getActiveOrderForClient(session.clientId),
  ]);

  const screen = { screenTitle: "تفاصيل الاشتراك", backLabel: "رجوع إلى الرئيسية" };
  const empty = { title: "ما فيه اشتراك مفعّل", description: "اشتراكك ما بدأ بعد، فما فيه تفاصيل نعرضها.", actionLabel: "كلّم الدعم" };

  if (!client) return fail("NOT_FOUND", "ما لقينا حسابك.");
  // «غياب الاشتراك» = never activated: no start and no end date on the client row.
  if (!client.subscriptionStartDate && !client.subscriptionEndDate) {
    return ok({ ...screen, subscription: null, empty });
  }

  // الثلاثة كانت تُشتقّ، وصارت تُقرأ من الطلب الساري (MONEY-FLOW · قاعدة المصدر الواحد):
  //   العملة كانت من `addressCountry` — وهو حقلٌ يُعدَّل، فتصحيحُ عنوان عميلٍ مصريّ كان
  //     ينقل مبلغه من الجنيه إلى الريال والرقم لم يتغيّر.
  //   الدورة كانت من `billingCycle` — تقول «سنوي» والطلب يقول ٦ أشهر.
  //   السعر كان من كتالوجٍ حيّ — فتغييرُه اليوم يعيد كتابة ما دفعه العميل أمس.
  // `CheckoutOrder.currency` نصٌّ في السكيما، و`arabicCurrency` تقبل «SAR|EGP» فقط.
  // فعملةٌ غيرُهما لا تُطبع برمزٍ مُخمَّن — يسقط المبلغُ كلُّه، لأنّ رقماً بعملةٍ خاطئة
  // أسوأُ من لا رقم (ممنوع التخمين في المال).
  const knownCurrency = (c: string): c is "SAR" | "EGP" => c === "SAR" || c === "EGP";
  const paidTotal =
    activeOrder && knownCurrency(activeOrder.currency)
      ? arabicCurrency(activeOrder.totalMinor / 100, activeOrder.currency)
      : null;
  const termLabel = activeOrder
    ? `${activeOrder.paidMonths} شهر${activeOrder.bonusServiceMonths ? ` + ${activeOrder.bonusServiceMonths} هديّة` : ""}`
    : null;

  const today = new Date();
  const daysRemaining = client.subscriptionEndDate ? Math.max(Math.ceil((client.subscriptionEndDate.getTime() - today.getTime()) / 86_400_000), 0) : null;
  const durationDays = client.subscriptionStartDate && client.subscriptionEndDate
    ? Math.max(Math.ceil((client.subscriptionEndDate.getTime() - client.subscriptionStartDate.getTime()) / 86_400_000), 0)
    : null;

  const articlesPerMonth = client.articlesPerMonth ?? null;
  const articlesRemaining = articlesPerMonth === null ? null : Math.max(articlesPerMonth - articlesPublishedThisMonth, 0);

  const planPaymentRows = [
    { label: "الباقة", value: activeOrder?.planName ?? "—" },
    { label: "المدفوع", value: paidTotal ?? "—" },
    { label: "المدّة", value: termLabel ?? "—" },
  ];
  const periodRows = [
    client.subscriptionStartDate ? { label: "تاريخ البداية", value: arabicLongDateLatin(client.subscriptionStartDate) } : null,
    client.subscriptionEndDate ? { label: "تاريخ النهاية", value: arabicLongDateLatin(client.subscriptionEndDate) } : null,
    durationDays === null ? null : { label: "مدة الاشتراك", value: `${durationDays} يوماً` },
  ].filter((row): row is { label: string; value: string } => row !== null);

  return ok({
    ...screen,
    empty: null,
    subscription: {
      status: client.subscriptionStatus,
      statusLabel: statusLabels[client.subscriptionStatus] ?? client.subscriptionStatus,
      statusTone: positiveStatuses.has(client.subscriptionStatus) ? "positive" : dangerStatuses.has(client.subscriptionStatus) ? "danger" : "warning",
      daysRemainingLabel: daysRemaining === null ? null : `${daysRemaining} يوماً متبقياً`,
      planPayment: { title: "الباقة والدفع", rows: planPaymentRows },
      usage: articlesPerMonth === null || articlesRemaining === null ? null : {
        title: "الاستخدام الشهري",
        remainingLabel: "المقالات المتبقية",
        valueLabel: `${articlesRemaining} من ${articlesPerMonth}`,
        /**
         * الشريط يقيس ما يقوله الرقم بجانبه: **المتبقّي**.
         *
         * كان يرسل `usedPercent`، فمع «٨ من ٨ المقالات المتبقية» يظهر الشريط **فارغاً** —
         * والفارغ يُقرأ «ما بقي شيء»، وهو عكس المعنى تماماً. الرقم والشريط الآن مقياس واحد:
         * ممتلئ = رصيدك كامل، ويفرغ كلّما نُشر مقال.
         */
        remainingPercent: articlesPerMonth === 0 ? 0 : Math.max(Math.round(((articlesRemaining ?? 0) / articlesPerMonth) * 100), 0),
        note: articlesPublishedThisMonth === 0 ? "لم يُنشر أي مقال هذا الشهر" : `نُشر ${articlesPublishedThisMonth} مقالاً هذا الشهر`,
      },
      period: periodRows.length === 0 ? null : { title: "المدة", rows: periodRows },
    },
  });
}
