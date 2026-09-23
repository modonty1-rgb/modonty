import type { NextRequest } from "next/server";
import { isCollectedOrder } from "@modonty/shared/lib/payments/collected";
import { ArticleStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { arabicCurrency, arabicLongDateLatin } from "@/lib/mobile-api/arabic-format";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";
import { getClientSubscription } from "@/lib/subscription/get-client-subscription";
import { formatTermLabel } from "@modonty/shared/lib/commercial/term-label";

const statusLabels: Record<string, string> = { ACTIVE: "نشط", PENDING: "بانتظار التفعيل", EXPIRED: "منتهي", SUSPENDED: "معلّق", CANCELLED: "ملغي" };
const positiveStatuses = new Set(["ACTIVE"]);
const dangerStatuses = new Set(["EXPIRED", "CANCELLED"]);



export async function GET(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // الاشتراكُ كلُّه من الطلب الساري — البدايةُ والنهايةُ والحالةُ والحصّة معاً، لا من الكرت.
  const [sub, articlesPublishedThisMonth] = await Promise.all([
    getClientSubscription(session.clientId),
    db.article.count({ where: { clientId: session.clientId, status: ArticleStatus.PUBLISHED, createdAt: { gte: startOfMonth } } }),
  ]);
  const activeOrder = sub.order;

  const screen = { screenTitle: "تفاصيل الاشتراك", backLabel: "رجوع إلى الرئيسية" };
  const empty = { title: "ما فيه اشتراك مفعّل", description: "اشتراكك ما بدأ بعد، فما فيه تفاصيل نعرضها.", actionLabel: "كلّم الدعم" };

  // «غياب الاشتراك» = لا طلبَ ساري — لم يُفعَّل بعد.
  if (!activeOrder) {
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
    // الطلبُ المستردُّ لا يُعرض مبلغُه «مدفوعاً» — قاعدةُ `shared/lib/payments/collected.ts`.
    activeOrder && isCollectedOrder(activeOrder) && knownCurrency(activeOrder.currency)
      ? arabicCurrency(activeOrder.totalMinor / 100, activeOrder.currency)
      : null;
  // «٦ أشهر + شهر هدية» — صياغةُ الفاتورة وكرت الإعدادات نفسُها (٢٣ سبتمبر ٢٠٢٦ · خالد: مصدرٌ واحد).
  const termLabel = activeOrder
    ? formatTermLabel(activeOrder.paidMonths, activeOrder.bonusServiceMonths)
    : null;

  const daysRemaining = sub.daysLeft === null ? null : Math.max(sub.daysLeft, 0);
  const durationDays = sub.startedAt && sub.endsAt
    ? Math.max(Math.ceil((sub.endsAt.getTime() - sub.startedAt.getTime()) / 86_400_000), 0)
    : null;

  const articlesPerMonth = sub.articlesPerMonth;
  const articlesRemaining = articlesPerMonth === null ? null : Math.max(articlesPerMonth - articlesPublishedThisMonth, 0);

  const planPaymentRows = [
    { label: "الباقة", value: activeOrder?.planName ?? "—" },
    { label: "المدفوع", value: paidTotal ?? "—" },
    { label: "المدّة", value: termLabel ?? "—" },
  ];
  const periodRows = [
    // البدايةُ تُختم بوصول أوّل مقال — قبله يُقال ذلك صراحةً بدل خانةٍ ناقصة.
    { label: "تاريخ البداية", value: sub.startedAt ? arabicLongDateLatin(sub.startedAt) : "مع أوّل مقال" },
    sub.endsAt ? { label: "تاريخ النهاية", value: arabicLongDateLatin(sub.endsAt) } : null,
    durationDays === null ? null : { label: "مدة الاشتراك", value: `${durationDays} يوماً` },
  ].filter((row): row is { label: string; value: string } => row !== null);

  return ok({
    ...screen,
    empty: null,
    subscription: {
      status: sub.status,
      statusLabel: statusLabels[sub.status] ?? sub.status,
      statusTone: positiveStatuses.has(sub.status) ? "positive" : dangerStatuses.has(sub.status) ? "danger" : "warning",
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
