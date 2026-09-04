import "server-only";

import { db } from "@/lib/db";

/**
 * كل المصادر — المفعَّل والمقفول — كخريطة `value → label`.
 *
 * منفصلةٌ عن `getLeadSources` عمداً: تلك تغذّي **قائمة الاختيار** فتستبعد المقفول، وهذه
 * تغذّي **العرض** فلا تستبعد شيئاً. ولو استُعملت المفعَّلة في العرض لظهر ١٨ عميلاً بمصدر
 * `SOCIAL` خاماً بمجرّد أن يُقفَل «سوشال» — وهو ما فعلناه فعلاً.
 *
 * القاعدة: الإقفال يمنع الاختيار الجديد، ولا يمحو ما اختير قديماً.
 */
export async function getLeadSourceLabels(): Promise<Record<string, string>> {
  const rows = await db.leadSourceOption.findMany({
    select: { value: true, label: true },
    take: 200,
  });
  return Object.fromEntries(rows.map((r) => [r.value, r.label]));
}
