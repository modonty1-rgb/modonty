import "server-only";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

export type Country = "SA" | "EG";

export interface FeaturedPlanPricing {
  name: string;
  articlesPerMonth: number;
  monthly: number;
  yearly: number;
}

/**
 * **الباقةُ المميَّزة وسعرُها — لصفحات دليل الفريق، من كتالوج البيع** (خالد ١٥ سبتمبر ٢٠٢٦:
 * «مرجع السعر اللي هو الآن البيمنت الأخير، هذا هو السورس أوف ترووث للأسعار والباقات»).
 *
 * ── لماذا «المميَّزة» لا سلَقٌ مكتوب (٢٣ سبتمبر ٢٠٢٦ · خالد: مصدرٌ واحد) ──
 * كانت تبحث بـ`slug: "zakham"`، والسلَقُ في الإنتاج هاشٌ (`plan-f1854bef`): سكربتُ
 * `scripts/rename-plan-slugs.ts` لم يُشغَّل إلّا على قاعدة التطوير، والمزامنةُ من الإنتاج
 * أعادت الهاش. فكان الدليلُ بلا سعرٍ في الإنتاج وهو يقول «Momentum».
 *
 * والدليلُ يقصد الباقةَ التي يوصي بها البيع — وهي في الكتالوج صفٌّ بعلامة
 * `featuredBadge` («الأكثر اختياراً ✦»)، يُحرَّك من الأدمن. فتُقرأ هي باسمها وسعرها،
 * وتتبعها الجملُ أينما انتقلت العلامة. لا باقةَ مميَّزة أو لا سعرَ في السوق ← `null`،
 * وتُقال الجملةُ بلا رقم.
 *
 * ⚠ `yearly` = الشهريّ × ١٢، لا سعرَ سنويٍّ مخفَّضاً: الكتالوجُ لا يخزّن سعراً سنويّاً،
 * والخصمُ فيه شهورُ هديةٍ على صفّ المدّة (`CommercialTermPolicy`) لا سعرٌ ثانٍ للباقة.
 */
export const getFeaturedPlanPricing = unstable_cache(
  async (country: Country = "SA"): Promise<FeaturedPlanPricing | null> => {
    const plans = await db.commercialPlan.findMany({
      where: { isPublished: true, featuredBadge: { not: null } },
      orderBy: { displayOrder: "asc" },
      select: {
        name: true,
        featuredBadge: true,
        articlesPerMonth: true,
        prices: {
          where: { market: country, isActive: true },
          select: { monthlyBase: true },
          take: 1,
        },
      },
    });

    const plan = plans.find((p) => p.featuredBadge?.trim());
    const monthly = plan?.prices[0]?.monthlyBase;
    if (!plan || monthly == null) return null;

    return {
      name: plan.name,
      articlesPerMonth: plan.articlesPerMonth ?? 0,
      monthly,
      yearly: monthly * 12,
    };
  },
  ["featured-plan-pricing"],
  { revalidate: 3600, tags: ["tier-pricing", "commercial-catalog"] }
);
