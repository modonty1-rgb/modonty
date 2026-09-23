import { formatMonths } from "./arabic-months";

/**
 * **مدّةُ الطلب بالعربيّة — «٦ أشهر + شهر هدية»** (٢٣ سبتمبر ٢٠٢٦ · خالد: مصدرٌ واحد).
 *
 * كانت الفاتورةُ تقول «سنوي» لكلّ مدّةٍ غيرِ شهر (`Invoice.period` يُكتب `annual`)، وكرتُ
 * الإعدادات «6 شهر + 1 هديّة»، والجوّال مثلَه — ثلاثُ صياغاتٍ لرقمين على الطلب. فصارت كلُّها
 * من هنا: الشهورُ المدفوعة وشهورُ الهديّة، بتصريف `formatMonths` نفسِه الذي يقرؤه البيع.
 *
 * في `shared` لأنّ الكونسول (الفواتير · الإعدادات · الجوّال) والأدمن (تقرير المبيعات) يقرآنها.
 */
export function formatTermLabel(paidMonths: number, bonusServiceMonths: number | null | undefined): string {
  const paid = formatMonths(paidMonths);
  return bonusServiceMonths ? `${paid} + ${formatMonths(bonusServiceMonths)} هدية` : paid;
}
