/**
 * تاريخٌ مختصر للجداول: يوم/شهر/سنة أرقاماً — بلا اسم شهر (خالد ١٨ سبتمبر ٢٠٢٦).
 * اسمُ الشهر يكسر الصفّ سطرين ويُضيّع كثافةَ الجدول؛ الأرقامُ تُصفّ عموديّاً بـ`tabular-nums`.
 */
const dateFmt = new Intl.DateTimeFormat("ar-EG", { year: "numeric", month: "2-digit", day: "2-digit" });

export function formatOrderDate(value: Date): string {
  return dateFmt.format(value);
}
