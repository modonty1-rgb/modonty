import { db } from "@/lib/db";
import { getSubscriptionStanding } from "@/app/(dashboard)/orders/helpers/get-subscription-standing";

/**
 * الاشتراكاتُ المنتهية والمقترِبة — تعريفٌ واحد للبطاقة وللفلتر.
 *
 * الانتهاءُ يُحسب ولا يُخزَّن (`activatedAt` + شهور الخدمة)، فلا يمكن تصفيتُه في القاعدة:
 * تُجلب المدفوعةُ المفعَّلة ويُرشَّح المنتهي منها هنا — وهو نفسُ الحاسب الذي يلوّن الصفوف
 * في شاشة الاشتراكات، فلا تقول البطاقةُ رقماً يخالف الجدول.
 *
 * وُجدت لأنّ الدائرة الماليّة كانت تنتهي بلا مَن يُخبر أحداً: مقيسٌ ١٨ سبتمبر ٢٠٢٦ —
 * ٣ اشتراكاتٍ منتهية و٩ تنتهي خلال شهر، ولا كرون ولا بريد ولا شاشة تقولها. فاشتراكٌ
 * يسقط بصمتٍ هو مالٌ يضيع بلا قرار.
 */
export interface RenewalsDue {
  expired: number;
  /** ينتهي خلال ٣٠ يوماً — نافذةُ تجديدٍ واقعيّة لا إنذارُ اللحظة الأخيرة. */
  soon: number;
  /** أقدمُ انتهاءٍ بالأيّام — يقول كم مضى بلا تحرّك. */
  worstDaysPast: number | null;
}

const SOON_DAYS = 30;

export async function getRenewalsDue(): Promise<RenewalsDue> {
  const rows = await db.checkoutOrder.findMany({
    where: { status: "PAID", NOT: [{ activatedAt: null }, { clientId: null }] },
    select: { activatedAt: true, paidMonths: true, bonusServiceMonths: true },
    take: 2000,
  });

  let expired = 0;
  let soon = 0;
  let worst: number | null = null;
  for (const r of rows) {
    const s = getSubscriptionStanding(r);
    if (s.daysLeft === null) continue;
    if (s.daysLeft < 0) {
      expired++;
      const past = -s.daysLeft;
      if (worst === null || past > worst) worst = past;
    } else if (s.daysLeft <= SOON_DAYS) soon++;
  }
  return { expired, soon, worstDaysPast: worst };
}
