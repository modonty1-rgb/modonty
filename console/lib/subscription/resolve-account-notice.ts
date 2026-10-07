import { SITE_LOCALE_GREGORIAN } from "@modonty/shared/lib/constants/locale";

/**
 * الإشعار الواحد عن حساب العميل — القاعدة الواحدة للويب (`AccountNotice`) وتطبيق الجوال.
 *
 * Tone (Khalid 2026-07-24): «أنيقة وراقية، ما فيها تهكم، ما فيها إزعاج». So: a plain
 * statement of fact and a date, never a countdown that nags, and never more than one
 * notice at a time — the most consequential wins. Returns null when the account is healthy.
 * Ordered by consequence: a lapsed subscription first, then money, then the reminder.
 */
type AccountNoticeKind = "expired" | "unpaid" | "ending";
type AccountNotice = {
  kind: AccountNoticeKind;
  tone: "calm" | "attention";
  title: string;
  body: string;
};

/** Whole days from today to `d` — negative once the date has passed. */
function daysUntil(d: Date, now: Date): number {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - startOfToday.getTime()) / 86_400_000);
}

function arAccountDate(d: Date): string {
  return new Intl.DateTimeFormat(SITE_LOCALE_GREGORIAN, { day: "numeric", month: "long", year: "numeric" }).format(d);
}

export function resolveAccountNotice(input: {
  endDate: Date | null;
  unpaidCount: number;
  /** المستحقّ نصّاً جاهزاً، كلُّ عملةٍ بمبلغها — من `getOutstandingInvoices`. */
  unpaidTotal: string | null;
  now?: Date;
}): AccountNotice | null {
  const { endDate, unpaidCount, unpaidTotal } = input;
  const left = endDate ? daysUntil(endDate, input.now ?? new Date()) : null;

  if (endDate && left !== null && left < 0) {
    return {
      kind: "expired",
      tone: "attention",
      title: "انتهت مدة اشتراكك",
      body: `كانت المدة سارية حتى ${arAccountDate(endDate)}. تجديدها يبقي صفحتك ومقالاتك تعمل كالمعتاد.`,
    };
  }
  if (unpaidCount > 0) {
    const amount = unpaidTotal ? ` بقيمة ${unpaidTotal}` : "";
    return {
      kind: "unpaid",
      tone: "attention",
      title: unpaidCount === 1 ? "لديك فاتورة بانتظار الدفع" : `لديك ${unpaidCount} فواتير بانتظار الدفع`,
      body: `${unpaidCount === 1 ? "الفاتورة" : "الفواتير"}${amount} متاحة للاطّلاع. لو دفعتها مؤخراً فتجاهل هذه الرسالة — قد لا يكون الدفع قد سُجّل بعد.`,
    };
  }
  if (endDate && left !== null && left <= 7) {
    return {
      kind: "ending",
      tone: "calm",
      title: left === 0 ? "اشتراكك ينتهي اليوم" : `اشتراكك ينتهي خلال ${left === 1 ? "يوم" : `${left} أيام`}`,
      body: `المدة الحالية تنتهي في ${arAccountDate(endDate)}. يسعدنا استمرارك معنا.`,
    };
  }
  return null;
}
