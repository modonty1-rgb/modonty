/**
 * عدد الأشهر بصيغةٍ عربية سليمة — لا «١ أشهر».
 *
 * كانت الشاشة تكتب `${n} أشهر` مهما كان العدد، فيخرج «1 أشهر» و«2 أشهر». والعربية
 * تعدّ على أربع درجات، والخطأ فيها يُقرأ فوراً كنصٍّ آليّ.
 *
 * والأرقام تُكتب بالخانات العربية-الهندية لتوافق صيغة المبالغ في الشاشة نفسها
 * (`formatOrderMoney` يستعمل `ar-EG`)، فلا يجتمع «6 أشهر» مع «٢٣٬٩٩٤ ج.م.» في سطرين
 * متجاورين.
 */

const AR_DIGITS = new Intl.NumberFormat("ar-EG", { useGrouping: false });

export function formatMonths(count: number): string {
  if (count === 0) return "لا شيء";
  if (count === 1) return "شهر واحد";
  if (count === 2) return "شهران";
  if (count <= 10) return `${AR_DIGITS.format(count)} أشهر`;
  return `${AR_DIGITS.format(count)} شهراً`;
}
