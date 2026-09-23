import { buildTermPricing } from "@modonty/shared/lib/commercial/term-pricing";

import type { LeadCatalog, PlanOption } from "./get-lead-catalog";
import { MARKETS, type Market } from "./markets";
import { resolveLeadPlan } from "./resolve-lead-plan";

export interface LeadDeal {
  /** الباقة من كتالوج سوق العميل — `null` حين لا باقة أو لم تعد تُباع. */
  plan: PlanOption | null;
  /** إجماليّ المدّة = سعر الشهر × الأشهر المدفوعة. `null` حين لا تُسعَّر الصفقة. */
  total: number | null;
  /** عملة صفّ السعر — لا عملة العميل المخزّنة. */
  currency: string | null;
  paidMonths: number | null;
  /** المدفوعة + هديّة المدّة من سياسة المدد. */
  serviceMonths: number | null;
}

/**
 * قيمة الصفقة من الكتالوج **اليوم** — لا من `expectedMonthly` المخزَّن.
 *
 * ٢٣ سبتمبر ٢٠٢٦ — خالد: مصدرٌ واحد. السعر من `CommercialPlanPrice` لسوق العميل، والمدّة
 * وهديّتها من `CommercialTermPolicy` المفعّلة، والحساب بـ`buildTermPricing` نفسها التي تحسب بها
 * بطاقة `/pay`. فتعديل سعرٍ أو مدّةٍ في «الباقات والأسعار» يصل القائمة والرفّ والفانل معاً.
 *
 * مدّةٌ أُطفئت أو باقةٌ لم تعد منشورة ⇒ `total: null` («غير محدّد»): صفقةٌ لا يبيعها الكتالوج
 * اليوم لا تُحسب في الفانل برقمٍ قديم.
 */
export function priceLeadDeal(
  lead: { expectedTier: string | null; expectedMonths: number | null; countryCode: string | null },
  catalog: LeadCatalog,
): LeadDeal {
  const market = (MARKETS as readonly string[]).includes(lead.countryCode ?? "")
    ? (lead.countryCode as Market)
    : null;
  const plan = market ? resolveLeadPlan(lead.expectedTier, catalog.plans[market]) : null;
  const term = catalog.terms.find((t) => t.paidMonths === lead.expectedMonths) ?? null;

  if (!plan || !term) {
    return { plan, total: null, currency: null, paidMonths: term?.paidMonths ?? null, serviceMonths: null };
  }

  const pricing = buildTermPricing({
    monthlyBase: plan.monthlyBase,
    paidMonths: term.paidMonths,
    bonusServiceMonths: term.bonusServiceMonths,
  });

  return {
    plan,
    total: pricing.totalMinor / 100,
    currency: plan.currency,
    paidMonths: pricing.paidMonths,
    serviceMonths: pricing.serviceMonths,
  };
}
