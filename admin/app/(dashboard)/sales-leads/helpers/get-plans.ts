import "server-only";

import { db } from "@/lib/db";

export interface PlanOption {
  /** `SubscriptionTier` المقابلة — هي ما يُكتب في `SalesLead.expectedTier`. */
  tier: string;
  slug: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  articlesLabel: string;
  order: number;
  /** «للمؤسسات» — وسمُ فئةٍ على الباقة. */
  badge: string | null;
  /** «الأكثر اختياراً ✦» — الباقة التي تُقدَّم أوّلاً. */
  featuredBadge: string | null;
}

/**
 * باقات السوق الواحد بأسعارها — من **جدولنا** `modonty_plans`.
 *
 * ── لماذا جدولنا لا `Plan` ───────────────────────────────────────────────────────────────
 * خالد (٤ سبتمبر): «الـtable تبع الـprice اللي موجود في جبر سيو، اعمل واحد عندنا typical
 * identical. هنشتغل عليه الآن، وبعدين لما نحوّل جبر سيو هننقل عليه».
 *
 * كانت القراءة أمراً خاماً على مجموعة `Plan` — يملكها جبر سيو ويكتب فيها. أي: بلا أنواع، وبلا
 * قدرةٍ على التعديل من الأدمن، وكسرٌ صامت لو غيّرت جبر سيو شكل صفوفها. والآن الجدول لنا،
 * والصفوف الثمانية منسوخةٌ إليه حرفياً.
 *
 * ── الاستعلام مطابقٌ للأصل ───────────────────────────────────────────────────────────────
 * `where: { country, visible: true }` + `orderBy: displayOrder` — نفس ما تفعله جبر سيو
 * (`jbrseo.com/app/actions/pricing.ts:37`). التطابق مقصود كي يصير النقل نسخاً لا ترجمة.
 *
 * ── ما ليس في هذا الجدول ─────────────────────────────────────────────────────────────────
 * العرض التأسيسي (٣ · ٦ · ١٢ شهراً وشهور المكافأة) ليس بياناً هنا ولا هناك — هو طبقة عرضٍ
 * فوق السعر (`price-section-types.ts:PricingUI`). فما يُعرض للمندوبة سعر الباقة الأساسي،
 * وحساب مدّة الصفقة شغلٌ لاحق.
 */

/** جسر السلَق ← الباقة. مكتوبٌ هنا لأن الصفّ الرابط في `subscription_tier_configs` قد يغيب. */
const TIER_BY_SLUG: Record<string, string> = {
  free: "BASIC",
  presence: "BASIC",
  starter: "STANDARD",
  growth: "PRO",
  scale: "PREMIUM",
};

export async function getPlans(): Promise<Record<"SA" | "EG", PlanOption[]>> {
  const rows = await db.modontyPlan.findMany({
    // المخفيّة مستبعدة: `presence` مطفأة في السوقين، وباقةٌ لا تُعرض للعميل لا تُباع له.
    where: { visible: true },
    orderBy: [{ country: "asc" }, { displayOrder: "asc" }],
    select: {
      country: true, slug: true, name: true,
      priceMonthly: true, priceYearly: true, articlesLabel: true, displayOrder: true,
      badge: true, featuredBadge: true,
    },
    take: 50,
  });

  const out: Record<"SA" | "EG", PlanOption[]> = { SA: [], EG: [] };
  for (const r of rows) {
    if (r.country !== "SA" && r.country !== "EG") continue;
    out[r.country].push({
      tier: TIER_BY_SLUG[r.slug] ?? "STANDARD",
      slug: r.slug,
      name: r.name,
      priceMonthly: r.priceMonthly,
      priceYearly: r.priceYearly,
      articlesLabel: r.articlesLabel,
      order: r.displayOrder,
      badge: r.badge,
      featuredBadge: r.featuredBadge,
    });
  }
  return out;
}
