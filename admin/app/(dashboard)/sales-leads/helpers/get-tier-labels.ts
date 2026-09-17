import "server-only";

import { getPlans } from "./get-plans";

/**
 * أسماء الباقات كما هي في `modonty_plans` — لا كما اختُرعت في الكود.
 *
 * كانت `TIER_LABEL` في `funnel.ts` تقول `PRO → "الاحترافية"`. فمَن اختارت «الزخم» في شاشة
 * التأسيس قرأت «الاحترافية» في صفحة العميل: اسمان لباقةٍ واحدة، وأحدهما لا وجود له في أيّ
 * عرضٍ أُرسل لعميل. وهو نفس عطل قائمة المصادر — قائمةٌ في الكود بجانب جدولٍ في القاعدة.
 *
 * وتُبنى من `getPlans` لا باستعلامٍ ثانٍ: نسخُ القائمة هنا يخلق مصدراً ثانياً يفترق عنها
 * عند أوّل باقةٍ جديدة. والمفتاح هو سلَق الباقة منذ سقوط الإنم (١٧ سبتمبر ٢٠٢٦).
 *
 * والاسم واحدٌ في السوقين وإن اختلف سعره، فخريطةٌ واحدة تكفي.
 */
export async function getTierLabels(): Promise<Record<string, string>> {
  const plans = await getPlans();
  const out: Record<string, string> = {};
  for (const p of [...plans.SA, ...plans.EG]) out[p.slug] = p.name;
  return out;
}
