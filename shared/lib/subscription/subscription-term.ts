/**
 * **مدّةُ الاشتراك — تُحسب من الطلب، ولا تُقرأ من كرت العميل.**
 *
 * البدايةُ = بدايةُ الخدمة على الطلب (`serviceStartedAt`، تُختم بوصول أوّل مقال).
 * النهايةُ = البداية + الشهور المدفوعة + شهور الهديّة.
 *
 * كان الكرتُ يحمل نسخةً من البداية والنهاية تُكتب في لحظاتٍ بعينها ثمّ تبقى، والطلبُ
 * يتغيّر بعدها — فقيس ٢٣ سبتمبر ٢٠٢٦ على نسخة الإنتاج: ٩ عملاء نهايتُهم على الكرت غيرُ
 * نهاية طلبهم، و١١ «نشطون» على الكرت وطلبُهم منتهٍ. فصار الحسابُ هنا وحده، يقرؤه الأدمن
 * والكونسول معاً — لا يُخزَّن، لأنّ المخزَّن يكذب أوّلَ ما يُعدَّل الطلب.
 */

/**
 * متى يصير الاشتراكُ «قريبَ الانتهاء» — رقمٌ واحدٌ لكلّ الشاشات.
 *
 * ثلاثون يوماً لا سبعة: التجديدُ قرارُ شراءٍ يحتاج تواصلاً وموافقةً وتحويلاً، وأسبوعٌ
 * لا يكفيه (انظر `admin/lib/orders/renewal-window.ts` لتاريخ القرار).
 */
export const RENEWAL_SOON_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

/** `unknown` = الخدمةُ لم تبدأ بعد (لم يصل أوّلُ مقال) — فلا هو نشطٌ بالعدّ ولا منتهٍ. */
export type SubscriptionState = "active" | "expiring" | "expired" | "unknown";

export interface SubscriptionTerm {
  state: SubscriptionState;
  startedAt: Date | null;
  endsAt: Date | null;
  /** موجبٌ = باقٍ · سالبٌ = مضى على الانتهاء · null = لم تبدأ الخدمة بعد. */
  daysLeft: number | null;
}

export function getSubscriptionTerm(
  order: { serviceStartedAt: Date | null; paidMonths: number; bonusServiceMonths: number },
  now: Date = new Date(),
): SubscriptionTerm {
  if (!order.serviceStartedAt) return { state: "unknown", startedAt: null, endsAt: null, daysLeft: null };
  const endsAt = new Date(order.serviceStartedAt);
  endsAt.setMonth(endsAt.getMonth() + order.paidMonths + order.bonusServiceMonths);
  const daysLeft = Math.ceil((endsAt.getTime() - now.getTime()) / DAY_MS);
  const state: SubscriptionState = daysLeft < 0 ? "expired" : daysLeft <= RENEWAL_SOON_DAYS ? "expiring" : "active";
  return { state, startedAt: order.serviceStartedAt, endsAt, daysLeft };
}

/**
 * **حالةُ العميل كما تُعرض** — بنفس رموز `SubscriptionStatus` كي تبقى تسمياتُ الشاشات كما هي.
 *
 * الكرتُ يبقى صاحبَ قرارٍ واحد: **الإلغاءُ اليدويّ** (`CANCELLED`) — قرارُ موظّفٍ لا
 * يُشتقّ من المال. وما عداه من الطلب: لا طلبَ ساري ← بانتظار التفعيل، مدّةٌ انقضت ← منتهٍ،
 * وإلّا ← نشط (ومنه من لم يصله أوّلُ مقالٍ بعد: مفعَّلٌ ولم تبدأ ساعتُه).
 */
export type DisplayedSubscriptionStatus = "ACTIVE" | "PENDING" | "EXPIRED" | "CANCELLED";

export function resolveSubscriptionStatus(
  manualStatus: string | null | undefined,
  hasOrder: boolean,
  term: SubscriptionTerm | null,
): DisplayedSubscriptionStatus {
  if (manualStatus === "CANCELLED") return "CANCELLED";
  if (!hasOrder) return "PENDING";
  if (term?.state === "expired") return "EXPIRED";
  return "ACTIVE";
}
