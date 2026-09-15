import "server-only";
import { unstable_cache } from "next/cache";
import { SubscriptionTier } from "@prisma/client";
import { db } from "@/lib/db";

export type Country = "SA" | "EG";

export interface TierPricingRow {
  jbrseoId: string;
  name: string;
  articlesPerMonth: number;
  monthly: number;
  yearly: number;
}

/**
 * سعر باقةٍ واحدة لصفحات دليل الفريق — **من كتالوج البيع، لا من النظام القديم**.
 *
 * ── لماذا تبدّل المصدر (خالد ١٥ سبتمبر ٢٠٢٦) ──
 * «مرجع السعر اللي هو الآن البيمنت الأخير، هذا هو السورس أوف ترووث للأسعار والباقات».
 * وكان يقرأ `SubscriptionTierConfig.price`، فيعرض «الزخم» بـ١٬٢٩٩ بينما المشتري يدفع
 * ١٬١٩٩ على `pay.modonty.com` — رقمٌ يقرؤه فريق المبيعات ويقوله للعميل.
 *
 * ── الوصلة `tier` لا `jbrseoId` ──
 * `CommercialPlan.tier` حقلٌ موجود يربط باقة البيع بتصنيف العميل التشغيلي
 * (`STANDARD` · `PRO` · `PREMIUM`)، ومقيسٌ حيّاً في القاعدتين: الانطلاقة⇢STANDARD ·
 * الزخم⇢PRO · الريادة⇢PREMIUM. والمفتاح الخارجي يبقى `jbrseoId` كما هو حتى لا
 * تتغيّر نداءات الصفحات، ويُترجَم هنا في موضعٍ واحد.
 *
 * `مجاني`/`free` لا مقابل له في الكتالوج — يرجع `null`، وصفحات الدليل تتحمّله
 * (التوقيع يرجع `null` أصلاً حين لا تُوجد الباقة).
 */
const TIER_BY_JBRSEO_ID: Record<string, SubscriptionTier> = {
  starter: SubscriptionTier.STANDARD,
  growth: SubscriptionTier.PRO,
  scale: SubscriptionTier.PREMIUM,
};

/**
 * ⚠ `yearly` = الشهريّ × ١٢، لا سعرَ سنويٍّ مخفَّضاً.
 *
 * النظام القديم كان يحمل رقمين (`mo` و`yr`)، ومن هنا جاء اختلاف ١٬٢٩٩ عن ١٬٠٣٩ بين
 * شاشتين. والكتالوج لا يخزّن سعراً سنوياً: الخصم فيه **شهورُ هدية** على صفّ المدّة
 * (`CommercialTermPolicy`)، لا سعرٌ ثانٍ للباقة. فالضرب في ١٢ هو الإجمالي الصادق
 * قبل الهدية — ومن يريد سعر المدّة يقرأ سياسة المدد لا هذا القارئ.
 */
export const getTierPricing = unstable_cache(
  async (
    jbrseoId: string,
    country: Country = "SA"
  ): Promise<TierPricingRow | null> => {
    const tier = TIER_BY_JBRSEO_ID[jbrseoId];
    if (!tier) return null;

    const plan = await db.commercialPlan.findFirst({
      where: { tier, isPublished: true },
      select: {
        name: true,
        articlesPerMonth: true,
        prices: {
          where: { market: country, isActive: true },
          select: { monthlyBase: true },
          take: 1,
        },
      },
    });

    const monthly = plan?.prices[0]?.monthlyBase;
    if (!plan || monthly == null) return null;

    return {
      jbrseoId,
      name: plan.name,
      articlesPerMonth: plan.articlesPerMonth ?? 0,
      monthly,
      yearly: monthly * 12,
    };
  },
  ["tier-pricing"],
  { revalidate: 3600, tags: ["tier-pricing", "commercial-catalog"] }
);
