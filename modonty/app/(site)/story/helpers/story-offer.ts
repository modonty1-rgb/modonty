import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";

/**
 * ما تقوله /story عن العرض والباقات — من كتالوج البيع، لا من نصٍّ في الكود.
 *
 * كان «ادفع ١٢ احصل على ١٨» و«٤ باقات» مكتوبَين في `SalesPitchPage.tsx`، والكتالوج
 * (`CommercialTermPolicy` · `CommercialPlan`) يحرَّر من الأدمن ويبيع منه pay.modonty.com.
 * فلو تغيّرت هديّة السنة أو عدد الباقات، بقيت القصة تعد بما لا يُباع.
 * ٢٣ سبتمبر ٢٠٢٦ — خالد: مصدرٌ واحد.
 *
 * الغياب يبقى غياباً: لا صفّ سنويّ نشط بهديّة ⇒ `annualOffer = null`، ولا باقة منشورة
 * ⇒ `planCount = null` — والواجهة تقول جملةً بلا رقم.
 *
 * الكاش `minutes`: وسم `commercial-catalog` لا يُبطَل على مدونتي (خرج من
 * `/api/revalidate/tag` حين انتقلت صفحة البيع إلى تطبيق الدفع)، فالمدى القصير هو ما
 * يحصر تأخّر تعديل الأدمن هنا.
 */

/** عرض المؤسسين على عقد السنة كما في التسجيل الصوتي («عقد سنة، وعليه … هدية»). */
const ANNUAL_PAID_MONTHS = 12;

export interface StoryOffer {
  /** شهور السنة المدفوعة ومجموعها مع الهديّة — `null` حين لا عرض بشهور هديّة. */
  annualOffer: { paidMonths: number; totalMonths: number } | null;
  /** عدد الباقات المعروضة للبيع في السوق الأوسع كتالوجاً — `null` حين لا رقم يُقال. */
  planCount: number | null;
}

export async function getStoryOffer(): Promise<StoryOffer> {
  "use cache";
  cacheTag("commercial-catalog");
  cacheLife("minutes");

  const [annualTerm, activePrices] = await Promise.all([
    db.commercialTermPolicy.findFirst({
      where: { paidMonths: ANNUAL_PAID_MONTHS, isActive: true },
      select: { paidMonths: true, bonusServiceMonths: true },
    }),
    // نفس شرط صفحة البيع (`get-market-catalog.ts`) وهو **لكلّ سوق**: باقةٌ منشورة لها سعرٌ
    // نشط فيه. سعرٌ واحد لكلّ باقة في السوق (`@@unique([planId, market])`)، فعددُ الصفوف
    // في السوق = باقاته. ولا يُجمع السوقان: باقةٌ تُباع في مصر وحدها لا يراها السعوديّ.
    db.commercialPlanPrice.findMany({
      where: { isActive: true, plan: { isPublished: true } },
      select: { market: true },
      take: 500,
    }),
  ]);

  const perMarket = new Map<string, number>();
  for (const p of activePrices) perMarket.set(p.market, (perMarket.get(p.market) ?? 0) + 1);
  const planCount = Math.max(0, ...perMarket.values());

  return {
    annualOffer:
      annualTerm && annualTerm.bonusServiceMonths > 0
        ? {
            paidMonths: annualTerm.paidMonths,
            totalMonths: annualTerm.paidMonths + annualTerm.bonusServiceMonths,
          }
        : null,
    planCount: planCount > 0 ? planCount : null,
  };
}
