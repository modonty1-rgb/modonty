import type { NextRequest } from "next/server";
import { ArticleStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { arabicCurrency, arabicLongDateLatin } from "@/lib/mobile-api/arabic-format";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";

const statusLabels: Record<string, string> = { ACTIVE: "نشط", PENDING: "بانتظار التفعيل", EXPIRED: "منتهي", SUSPENDED: "معلّق", CANCELLED: "ملغي" };
const positiveStatuses = new Set(["ACTIVE"]);
const dangerStatuses = new Set(["EXPIRED", "CANCELLED"]);

type PricePoint = { mo: number; yr: number };

/**
 * `pricing` is the ONLY price source we read.
 *
 * `SubscriptionTierConfig.price` (Float) is deliberately NOT used as a fallback:
 * its four seeded values (0 · 499 · 1299 · 2999) are identical to `pricing.SA.mo`,
 * so it is a MONTHLY list figure. Showing it on a subscription screen — where the
 * client reads what they pay — would misstate the charge.
 *
 * `pricing.yr` is documented in admin/app/(dashboard)/subscription-tiers/lib/pricing.ts
 * as the MONTHLY equivalent of the annual plan, not the annual total. We therefore
 * publish the monthly rate with a label that says which plan it belongs to, and we
 * never multiply it out into a yearly total we cannot derive from the schema.
 */
function pricePointFor(pricing: unknown, isEgypt: boolean): PricePoint | null {
  if (!pricing || typeof pricing !== "object" || !("SA" in pricing) || !("EG" in pricing)) return null;
  const record = pricing as { SA?: Partial<PricePoint>; EG?: Partial<PricePoint> };
  const point = isEgypt ? record.EG : record.SA;
  if (typeof point?.mo !== "number" || typeof point?.yr !== "number") return null;
  return { mo: point.mo, yr: point.yr };
}

export async function GET(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [client, articlesPublishedThisMonth] = await Promise.all([
    db.client.findUnique({
      where: { id: session.clientId },
      select: {
        subscriptionStatus: true,
        subscriptionTier: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        articlesPerMonth: true,
        billingCycle: true,
        addressCountry: true,
        subscriptionTierConfig: { select: { name: true, pricing: true } },
      },
    }),
    db.article.count({ where: { clientId: session.clientId, status: ArticleStatus.PUBLISHED, createdAt: { gte: startOfMonth } } }),
  ]);

  const screen = { screenTitle: "تفاصيل الاشتراك", backLabel: "رجوع إلى الرئيسية" };
  const empty = { title: "ما فيه اشتراك مفعّل", description: "اشتراكك ما بدأ بعد، فما فيه تفاصيل نعرضها.", actionLabel: "كلّم الدعم" };

  if (!client) return fail("NOT_FOUND", "ما لقينا حسابك.");
  // «غياب الاشتراك» = never activated: no start and no end date on the client row.
  if (!client.subscriptionStartDate && !client.subscriptionEndDate) {
    return ok({ ...screen, subscription: null, empty });
  }

  // `addressCountry` is null for most clients, and `pricing` carries exactly two
  // buckets (SA · EG). Anything that is not explicitly Egypt reads the SA bucket,
  // which is Modonty's home currency.
  const isEgypt = /مصر|egypt|\beg\b/i.test(client.addressCountry ?? "");
  const currency = isEgypt ? "EGP" : "SAR";
  const isAnnual = client.billingCycle !== "monthly";
  const cycleLabel = isAnnual ? "سنوي" : "شهري";
  const point = pricePointFor(client.subscriptionTierConfig?.pricing, isEgypt);
  const monthlyAmount = point === null ? null : isAnnual ? point.yr : point.mo;
  const priceDisplay = monthlyAmount === null ? null : arabicCurrency(monthlyAmount, currency);
  const priceRowLabel = isAnnual ? "سعر الشهر على الخطة السنوية" : "سعر الشهر";

  const today = new Date();
  const daysRemaining = client.subscriptionEndDate ? Math.max(Math.ceil((client.subscriptionEndDate.getTime() - today.getTime()) / 86_400_000), 0) : null;
  const durationDays = client.subscriptionStartDate && client.subscriptionEndDate
    ? Math.max(Math.ceil((client.subscriptionEndDate.getTime() - client.subscriptionStartDate.getTime()) / 86_400_000), 0)
    : null;

  const articlesPerMonth = client.articlesPerMonth ?? null;
  const articlesRemaining = articlesPerMonth === null ? null : Math.max(articlesPerMonth - articlesPublishedThisMonth, 0);

  const planPaymentRows = [
    { label: "الباقة", value: client.subscriptionTierConfig?.name ?? client.subscriptionTier },
    { label: "الدفع", value: priceDisplay === null ? cycleLabel : `${cycleLabel} · ${priceDisplay}` },
  ];
  const periodRows = [
    client.subscriptionStartDate ? { label: "تاريخ البداية", value: arabicLongDateLatin(client.subscriptionStartDate) } : null,
    client.subscriptionEndDate ? { label: "تاريخ النهاية", value: arabicLongDateLatin(client.subscriptionEndDate) } : null,
    durationDays === null ? null : { label: "مدة الاشتراك", value: `${durationDays} يوماً` },
    priceDisplay === null ? null : { label: priceRowLabel, value: priceDisplay },
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
