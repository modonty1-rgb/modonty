// ── نسخة طبق الأصل من `jbrseo.com/lib/pricing-durations.ts` (٤ سبتمبر ٢٠٢٦) ──────────────
//
// خالد: «اعمل واحد عندنا typical identical… وبعدين لما نحوّل جبر سيو هننقل عليه».
// لم يُغيَّر سطرٌ واحد تحت هذا الرأس: التطابق هو الغرض، وأي «تحسين» اليوم يصير فرقاً يوم النقل.
// المنطق كلّه مشتقّ من `priceMonthly` — لا جدول للمدد ولا حقل في السكيما.
//
// Single source of truth for the duration-based pricing model.
//
// Decision (2026-08-03, confirmed): no monthly billing. Plans are sold for
// 3 / 6 / 12 months. The incentive is FREE SERVICE MONTHS (not a price cut):
//   3 months  → +0 free  (3 service months)
//   6 months  → +1 free  (7 service months)   ← recommended default
//   12 months → +6 free  (18 service months ≈ 33% effective)
//
// The admin stores ONLY the monthly base price per country (`priceMonthly`).
// Everything below is derived — no yearly price, no discount % is stored.
// Prices are VAT-inclusive (15%); this module does not touch VAT.

export const PLAN_DURATIONS = [3, 6, 12] as const;
export type PlanDuration = (typeof PLAN_DURATIONS)[number];

/** Free service months granted per purchased duration. Product policy. */
export const FREE_MONTHS: Record<PlanDuration, number> = { 3: 0, 6: 1, 12: 6 };

/** The duration surfaced as "الموصى به" on the landing. */
export const RECOMMENDED_DURATION: PlanDuration = 6;

export type DurationPrice = {
  duration: PlanDuration;
  /** months the customer pays for (= duration) */
  paidMonths: number;
  /** bonus months granted free */
  freeMonths: number;
  /** total months of service delivered (paid + free) */
  serviceMonths: number;
  /** amount charged once, VAT-inclusive = monthly × duration */
  total: number;
  /** headline "per month" the customer effectively pays = total / serviceMonths */
  effectiveMonthly: number;
  /** savings vs paying the monthly rate for every service month */
  savingsPct: number;
};

function assertDuration(d: number): asserts d is PlanDuration {
  if (!PLAN_DURATIONS.includes(d as PlanDuration)) {
    throw new Error(`Invalid plan duration: ${d}`);
  }
}

/** Price breakdown for one plan (given its monthly base) at one duration. */
export function priceForDuration(monthly: number, duration: PlanDuration): DurationPrice {
  assertDuration(duration);
  const freeMonths = FREE_MONTHS[duration];
  const serviceMonths = duration + freeMonths;
  const total = Math.round(monthly * duration);
  return {
    duration,
    paidMonths: duration,
    freeMonths,
    serviceMonths,
    total,
    effectiveMonthly: serviceMonths > 0 ? Math.round(total / serviceMonths) : total,
    savingsPct: serviceMonths > 0 ? Math.round((freeMonths / serviceMonths) * 100) : 0,
  };
}

/** All three durations for one plan's monthly base. */
export function allDurationPrices(monthly: number): DurationPrice[] {
  return PLAN_DURATIONS.map((d) => priceForDuration(monthly, d));
}

/** Guard for a value coming from a URL/query (`?duration=6`). */
export function isPlanDuration(v: unknown): v is PlanDuration {
  return typeof v === "number" && PLAN_DURATIONS.includes(v as PlanDuration);
}

/** Parse a duration from a query/string/stored value ("6", "6m", 6) → 3|6|12. */
export function parseDuration(v: unknown): PlanDuration {
  const n = typeof v === "string" ? Number(v.replace(/[^0-9]/g, "")) : v;
  return isPlanDuration(n) ? n : RECOMMENDED_DURATION;
}
