/** لكل صفّ: أسباب منع حذفه بالعربي. قائمة فاضية = جاهز للحذف. */
export type DeleteBlockers = Map<string, string[]>;

const N = new Intl.NumberFormat("ar-EG");

/** «٣ مقالات» — يضمّ السبب لعدده، ويتجاهل الصفر. */
export function pushIf(list: string[], count: number, label: string) {
  if (count > 0) list.push(`${N.format(count)} ${label}`);
}
