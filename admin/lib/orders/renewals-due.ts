import { getClientSubscriptions } from "@/lib/subscription/get-client-subscriptions";
import { NOT_INTERNAL } from "@/app/(dashboard)/clients/segment/segments";
import { RENEWAL_SOON_DAYS } from "./renewal-window";

/**
 * الاشتراكاتُ المنتهية والمقترِبة — تعريفٌ واحد للبطاقة وللفلتر.
 *
 * وُجدت لأنّ الدائرة الماليّة كانت تنتهي بلا مَن يُخبر أحداً: مقيسٌ ١٨ سبتمبر ٢٠٢٦ —
 * ٣ اشتراكاتٍ منتهية و٩ تنتهي خلال شهر، ولا كرون ولا بريد ولا شاشة تقولها. فاشتراكٌ
 * يسقط بصمتٍ هو مالٌ يضيع بلا قرار.
 *
 * **العدُّ بالعميل من طلبه الساري** (٢٣ سبتمبر ٢٠٢٦ — خالد: مصدرٌ واحد). كانت تعدّ كلَّ طلبٍ
 * مدفوع بمدّته هو، والتجديدُ ينقل المؤشّرَ إلى الطلب الجديد ويترك القديمَ بمدّته المنقضية —
 * فعميلٌ جدّد يُعدّ «انتهى ولم يُجدَّد»، والحساباتُ الداخليّة معه. الآن: `getClientSubscriptions`
 * بـ`NOT_INTERNAL` — نفسُ ما يعدّه «منتهٍ» في شريحة العملاء وفلتر الاشتراكات.
 */
export interface RenewalsDue {
  expired: number;
  /** ينتهي خلال ٣٠ يوماً — نافذةُ تجديدٍ واقعيّة لا إنذارُ اللحظة الأخيرة. */
  soon: number;
  /** أقدمُ انتهاءٍ بالأيّام — يقول كم مضى بلا تحرّك. */
  worstDaysPast: number | null;
}

export async function getRenewalsDue(): Promise<RenewalsDue> {
  const subs = await getClientSubscriptions(NOT_INTERNAL);

  let expired = 0;
  let soon = 0;
  let worst: number | null = null;
  for (const s of subs.values()) {
    if (s.status === "EXPIRED") {
      expired++;
      if (s.daysLeft !== null) {
        const past = -s.daysLeft;
        if (worst === null || past > worst) worst = past;
      }
    } else if (s.status === "ACTIVE" && s.daysLeft !== null && s.daysLeft <= RENEWAL_SOON_DAYS) {
      soon++;
    }
  }
  return { expired, soon, worstDaysPast: worst };
}
