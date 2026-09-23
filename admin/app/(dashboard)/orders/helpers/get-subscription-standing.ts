/**
 * حالُ الاشتراك اليوم — من **بداية الخدمة** زائدَ شهورِها (المدفوعة + الهديّة).
 *
 * خالد (١٩ سبتمبر ٢٠٢٦): «المدّة تبدأ بعد أوّل أرتيكل» — فالساعةُ من `serviceStartedAt`
 * التي تُختم عند وصول أوّل مقال، لا من `activatedAt`. وطلبٌ مفعَّلٌ لم يصله مقالٌ بعد
 * حالُه `unknown`: لم تبدأ مدّتُه، فلا هو نشطٌ بالعدّ ولا منتهٍ.
 *
 * خالد (١٨ سبتمبر ٢٠٢٦): «عمود يبيّن حالة الاشتراك من تاريخ التفعيل لحدّ اليوم حسب
 * عدد الأشهر». يُحسب ولا يُخزَّن: التخزينُ يخلق رقماً يكذب أوّلَ ما تُعدَّل المدّة.
 *
 * `serviceMonths = paidMonths + bonusServiceMonths` هو نفس المفهوم في
 * `shared/lib/commercial/term-pricing.ts` — الهديّةُ خدمةٌ تُحتسب وإن لم تُدفع.
 *
 * و«قرب الانتهاء» يُقرأ من `lib/orders/renewal-window.ts` — رقمٌ واحدٌ تتبعه كلُّ شاشة.
 */
import { getSubscriptionTerm, type SubscriptionState } from "@modonty/shared/lib/subscription/subscription-term";

export type { SubscriptionState };

export interface SubscriptionStanding {
  state: SubscriptionState;
  endsAt: Date | null;
  /** موجبٌ = باقٍ · سالبٌ = مضى على الانتهاء · null = لم تبدأ الخدمة بعد. */
  daysLeft: number | null;
}

/** الحسابُ في `shared/lib/subscription/subscription-term.ts` — الأدمن والكونسول بمعادلةٍ واحدة. */
export function getSubscriptionStanding(
  input: { serviceStartedAt: Date | null; paidMonths: number; bonusServiceMonths: number },
  now: Date = new Date(),
): SubscriptionStanding {
  const { state, endsAt, daysLeft } = getSubscriptionTerm(input, now);
  return { state, endsAt, daysLeft };
}
