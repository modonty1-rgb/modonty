/**
 * حالُ الاشتراك اليوم — من يوم التفعيل زائدَ شهورِ الخدمة (المدفوعة + الهديّة).
 *
 * خالد (١٨ سبتمبر ٢٠٢٦): «عمود يبيّن حالة الاشتراك من تاريخ التفعيل لحدّ اليوم حسب
 * عدد الأشهر». يُحسب ولا يُخزَّن: التخزينُ يخلق رقماً يكذب أوّلَ ما تُعدَّل المدّة.
 *
 * `serviceMonths = paidMonths + bonusServiceMonths` هو نفس المفهوم في
 * `shared/lib/commercial/term-pricing.ts` — الهديّةُ خدمةٌ تُحتسب وإن لم تُدفع.
 *
 * و«قرب الانتهاء» يُقرأ من `lib/orders/renewal-window.ts` — رقمٌ واحدٌ تتبعه كلُّ شاشة.
 */
export type SubscriptionState = "active" | "expiring" | "expired" | "unknown";

export interface SubscriptionStanding {
  state: SubscriptionState;
  endsAt: Date | null;
  /** موجبٌ = باقٍ · سالبٌ = مضى على الانتهاء · null = لا تفعيل. */
  daysLeft: number | null;
}

import { RENEWAL_SOON_DAYS } from "@/lib/orders/renewal-window";

const DAY_MS = 24 * 60 * 60 * 1000;

export function getSubscriptionStanding(
  input: { activatedAt: Date | null; paidMonths: number; bonusServiceMonths: number },
  now: Date = new Date(),
): SubscriptionStanding {
  if (!input.activatedAt) return { state: "unknown", endsAt: null, daysLeft: null };
  const endsAt = new Date(input.activatedAt);
  endsAt.setMonth(endsAt.getMonth() + input.paidMonths + input.bonusServiceMonths);
  const daysLeft = Math.ceil((endsAt.getTime() - now.getTime()) / DAY_MS);
  const state: SubscriptionState = daysLeft < 0 ? "expired" : daysLeft <= RENEWAL_SOON_DAYS ? "expiring" : "active";
  return { state, endsAt, daysLeft };
}
