import "server-only";

import { getMarketCatalog } from "@modonty/shared/lib/commercial/get-market-catalog";

import { db } from "@/lib/db";
import type { Market } from "./markets";
import { resolveLeadPlan } from "./resolve-lead-plan";

export interface LeadDealColumns {
  expectedTier: string | null;
  expectedMonthly: number | null;
  expectedMonths: number | null;
  currency: string | null;
}

export type ResolvedLeadDeal =
  | { ok: true; data: LeadDealColumns }
  | { ok: false; fieldErrors: Record<string, string[]> };

/**
 * أعمدة الصفقة كما تُكتب — من الكتالوج على السيرفر، لا ممّا أرسلته الشاشة.
 *
 * ٢٣ سبتمبر ٢٠٢٦ — خالد: مصدرٌ واحد. الشاشة ترسل **سلَق الباقة والمدّة** فقط، وهنا يُقرأ
 * سعرها وعملتها من `CommercialPlanPrice` لسوق العميل، وتُفحص المدّة على `CommercialTermPolicy`
 * المفعّلة — بـ`getMarketCatalog` نفسها التي تبيع بها `/pay`. كما يفعل أكشن «اشتراك جديد»:
 * ما يُحفظ هو ما يبيعه الكتالوج، لا رقمٌ مرّ عبر المتصفّح.
 *
 * `expectedMonthly` يُكتب لقطةً لسعر يوم الحفظ ولا تقرؤه الشاشات: العرض يُسعَّر من الكتالوج
 * اليوم (`priceLeadDeal`). وبلا باقة تُكتب `null` صراحةً — `undefined` في بريزما «لا تمسّ»،
 * فكان إلغاء الباقة في التعديل يُبقي سعرها القديم في الصفّ.
 */
export async function resolveLeadDeal(input: {
  expectedTier?: string;
  expectedMonths?: number;
  countryCode?: Market;
  currency?: string;
}): Promise<ResolvedLeadDeal> {
  if (!input.expectedTier) {
    return {
      ok: true,
      data: {
        expectedTier: null,
        expectedMonthly: null,
        expectedMonths: input.expectedMonths ?? null,
        currency: input.currency ?? null,
      },
    };
  }

  if (!input.countryCode) {
    return { ok: false, fieldErrors: { expectedTier: ["حدّدي الدولة أوّلاً — السعر يتبع السوق"] } };
  }

  const catalog = await getMarketCatalog(db, input.countryCode);
  const plan = resolveLeadPlan(input.expectedTier, catalog.plans);
  if (!plan) {
    return {
      ok: false,
      fieldErrors: { expectedTier: ["الباقة ليست منشورة في هذا السوق — اختاري باقة"] },
    };
  }

  const term = catalog.terms.find((t) => t.paidMonths === input.expectedMonths);
  if (!term) {
    return {
      ok: false,
      fieldErrors: { expectedMonths: ["المدّة غير مفعّلة في «الباقات والأسعار» — اختاري مدّة"] },
    };
  }

  return {
    ok: true,
    data: {
      expectedTier: plan.slug,
      expectedMonthly: plan.monthlyBase,
      expectedMonths: term.paidMonths,
      currency: plan.currency,
    },
  };
}
