import "server-only";
import { unstable_cache } from "next/cache";
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
 * ── الوصلة صارت السلَق، لا الإنم (١٧ سبتمبر ٢٠٢٦) ──
 * كانت تمرّ بـ`CommercialPlan.tier` لأنّ سلَق الباقة كان هاشاً (`plan-4e07fc71`) لا
 * يصلح مفتاحاً مقروءاً. وقد صار للباقات سلَقٌ ذو معنى (`intilaqa` · `zakham` ·
 * `riyada`)، فسقط الوسيط: يُبحَث بالسلَق مباشرةً.
 *
 * وهذا ما كان يحبس الكتالوج في **أربع باقاتٍ للأبد**: الإنم أربع قيم، وحارسُ النشر
 * يمنع باقتين منشورتين على القيمة الواحدة. بسقوطه يصير العدد مفتوحاً.
 *
 * `مجاني`/`free` لا مقابل له في الكتالوج — يرجع `null`، وصفحات الدليل تتحمّله
 * (التوقيع يرجع `null` أصلاً حين لا تُوجد الباقة).
 */
/**
 * معرّفُ صفحات الدليل → سلَقُ الباقة في الكتالوج.
 *
 * المفتاح الخارجيّ (`starter`…) يبقى كما هو حتى لا تتغيّر نداءات الصفحات، والترجمة
 * في موضعٍ واحد. وباقةٌ جديدة تُضاف بسطرٍ هنا — أو بلا سطرٍ أصلاً إن وافق اسمُها سلَقَها.
 */
const PLAN_SLUG_BY_JBRSEO_ID: Record<string, string> = {
  starter: "intilaqa",
  growth: "zakham",
  scale: "riyada",
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
    const slug = PLAN_SLUG_BY_JBRSEO_ID[jbrseoId] ?? jbrseoId;

    const plan = await db.commercialPlan.findFirst({
      where: { slug, isPublished: true },
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
