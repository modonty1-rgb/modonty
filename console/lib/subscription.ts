import { ar } from "@/lib/ar";
import type { ClientPaymentKey } from "@/lib/payments/resolve-client-payment";

/**
 * Subscription state, derived once and read by both the settings card and the sidebar
 * block. The two show the same plan; deriving the days and the percentage twice is how
 * they end up disagreeing by a day.
 */
export interface SubscriptionData {
  tierName: string;
  status: string | null;
  /** من `resolveClientPayment` — الطلبُ الساري والفواتيرُ القائمة معاً. */
  paymentStatus: ClientPaymentKey;
  startDate: Date | null;
  endDate: Date | null;
  /**
   * الإجماليّ المدفوع كما هو على الطلب — نصٌّ جاهز بعملته («٢٬٣٩٤ ر.س»).
   *
   * كان `priceSar: number` يقرأ `tierConfig.price` ويفترض الريال دائماً، فعميلٌ مصريّ
   * دفع بالجنيه كان يُعرض له رقمه متبوعاً بـ«SAR». والعملة الآن من الطلب، مجمّدةً يوم
   * الشراء (MONEY-FLOW · القرار ٤).
   */
  paidTotal: string | null;
  /** المدّة المشتراة وأشهر الهديّة — يعرفهما الطلب ولا يعرفهما الكتالوج. */
  paidMonths: number | null;
  bonusServiceMonths: number | null;
}

export interface SubscriptionProgress {
  daysLeft: number;
  /** Share of the term already consumed, 0-100. */
  pct: number;
}

export interface SubscriptionBadge {
  label: string;
  classes: string;
}

export function statusLabel(status: string | null): SubscriptionBadge {
  const s = ar.settings;
  const upper = String(status || "").toUpperCase();
  if (upper === "ACTIVE")
    return { label: s.statusActive, classes: "bg-emerald-100 text-emerald-700 ring-emerald-200" };
  if (upper === "EXPIRED")
    return { label: s.statusExpired, classes: "bg-red-100 text-red-700 ring-red-200" };
  if (upper === "CANCELLED" || upper === "CANCELED")
    return { label: s.statusCancelled, classes: "bg-slate-100 text-slate-600 ring-slate-200" };
  return { label: s.statusInactive, classes: "bg-amber-100 text-amber-700 ring-amber-200" };
}

/**
 * شارةُ الدفع — كلماتُ القاعدة ٥ (٢٣ سبتمبر ٢٠٢٦ · خالد: مصدرٌ واحد). و`NONE` بلا شارة:
 * من لا طلبَ ساريَ له لا يُقال له «مدفوع» ولا غيرُه.
 */
export function paymentLabel(payment: ClientPaymentKey): SubscriptionBadge | null {
  const s = ar.settings;
  if (payment === "OWES")
    return { label: s.paymentOwes, classes: "bg-red-100 text-red-700 ring-red-200" };
  if (payment === "PAID")
    return { label: s.paymentPaid, classes: "bg-emerald-100 text-emerald-700 ring-emerald-200" };
  if (payment === "REFUNDED")
    return { label: s.paymentRefunded, classes: "bg-slate-100 text-slate-600 ring-slate-200" };
  return null;
}

export function subscriptionProgress(
  start: Date | null,
  end: Date | null
): SubscriptionProgress | null {
  if (!start || !end) return null;
  const now = Date.now();
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  if (endMs <= startMs) return null;
  const total = endMs - startMs;
  const consumed = Math.max(0, Math.min(total, now - startMs));
  const daysLeft = Math.max(0, Math.ceil((endMs - now) / 86400000));
  const pct = Math.round((consumed / total) * 100);
  return { daysLeft, pct };
}

export function formatSubscriptionDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(d));
}
