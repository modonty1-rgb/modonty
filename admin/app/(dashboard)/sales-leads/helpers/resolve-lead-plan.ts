/**
 * سلَقُ باقةٍ كُتب على `ModontyPlan` → سلَقُها في `CommercialPlan`.
 *
 * ٢٣ سبتمبر ٢٠٢٦ — خالد: مصدرٌ واحد. `SalesLead.expectedTier` كان يخزّن سلَق `modonty_plans`
 * (`starter` · `growth` · `scale`)، والكتالوج سلَقه `intilaqa` · `zakham` · `riyada` بنفس
 * الأسماء (الانطلاقة · الزخم · الريادة). فالصفّ القديم يُترجَم عند القراءة، ويُكتب بسلَق
 * الكتالوج عند أوّل حفظ — بلا ترحيل ولا عمودٍ جديد.
 *
 * وليست سعراً ولا مدّة: مفاتيح متقاعدة فقط. و`presence` لا مقابل له — كان مخفيّاً فلم يُختر.
 *
 * ⚠ السلَقُ المقروء (`zakham`…) لم يصل الإنتاجَ بعد — هناك ما زال هاشاً (`plan-f1854bef`)،
 * فالترجمةُ لا تجد باقتها. ولا صفَّ اليوم يحمل سلَقاً قديماً (٢٦ عميلاً محتملاً، كلُّها فارغة،
 * مقيسٌ ٢٣ سبتمبر ٢٠٢٦)، والجديدُ يُكتب بسلَق الكتالوج كما هو.
 */
const LEGACY_PLAN_SLUG: Record<string, string> = {
  starter: "intilaqa",
  growth: "zakham",
  scale: "riyada",
};

/** باقة العميل المحتمل من باقات سوقه — أو `null` إن لم تعد في الكتالوج. */
export function resolveLeadPlan<P extends { slug: string }>(
  stored: string | null | undefined,
  plans: readonly P[],
): P | null {
  if (!stored) return null;
  const slug = LEGACY_PLAN_SLUG[stored] ?? stored;
  return plans.find((p) => p.slug === slug) ?? null;
}
