import "server-only";

import { getMarketCatalog, type CatalogTerm } from "@modonty/shared/lib/commercial/get-market-catalog";

import { db } from "@/lib/db";
import { MARKETS, type Market } from "./markets";

/** باقةٌ كما تعرضها شاشات العملاء المحتملين — صفٌّ من `CommercialPlan` بسعر سوقٍ واحد. */
export interface PlanOption {
  slug: string;
  name: string;
  /** سعر الشهر بالوحدة الكبرى، شامل الضريبة — `CommercialPlanPrice.monthlyBase` لهذا السوق. */
  monthlyBase: number;
  /** عملة صفّ السعر نفسه (`SAR` · `EGP`) — لا تُشتقّ من الدولة. */
  currency: string;
  articlesPerMonth: number | null;
  /** «للمؤسسات» — وسمُ فئةٍ على الباقة. */
  badge: string | null;
  /** «الأكثر اختياراً» — الباقة التي تُقدَّم أوّلاً. */
  featuredBadge: string | null;
}

/** مدّةٌ مفعّلة من `CommercialTermPolicy`: الأشهر المدفوعة وهديّتها و«الأنسب». */
export type TermOption = CatalogTerm;

export interface LeadCatalog {
  plans: Record<Market, PlanOption[]>;
  terms: TermOption[];
}

/**
 * الباقات والمدد من **كتالوج البيع** — لا من `modonty_plans` ولا من جدول مدّةٍ في الكود.
 *
 * ٢٣ سبتمبر ٢٠٢٦ — خالد: مصدرٌ واحد. كانت الشاشة تقرأ `ModontyPlan` (نسخة أسعار جبر سيو)
 * و`pricing-durations.ts` (٣ · ٦ · ١٢ وهديّتها مكتوبةً في الكود)، فتقول المندوبة سعراً
 * ومدّةً غير ما تبيعه `pay.modonty.com` وشاشة «اشتراك جديد». والقراءة هنا بـ`getMarketCatalog`
 * نفسها التي تقرأ بها صفحة الدفع ومعاينة الأدمن — لا قارئٌ ثالث.
 *
 * والمدد سياسةٌ واحدة لكلّ الباقات (`PAY-Q3`) لا يفلترها السوق، فتؤخذ من أوّل سوق.
 */
export async function getLeadCatalog(): Promise<LeadCatalog> {
  const catalogs = await Promise.all(MARKETS.map((market) => getMarketCatalog(db, market)));

  const plans = { SA: [], EG: [] } as Record<Market, PlanOption[]>;
  MARKETS.forEach((market, i) => {
    plans[market] = catalogs[i].plans.map((p) => ({
      slug: p.slug,
      name: p.name,
      monthlyBase: p.monthlyBase,
      currency: p.currency,
      articlesPerMonth: p.articlesPerMonth,
      badge: p.badge,
      featuredBadge: p.featuredBadge,
    }));
  });

  return { plans, terms: catalogs[0]?.terms ?? [] };
}
