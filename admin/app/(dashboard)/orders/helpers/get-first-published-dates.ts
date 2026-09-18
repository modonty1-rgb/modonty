import { db } from "@/lib/db";

/**
 * أوّلُ مقالٍ صدر لكلّ عميل — أقدمُ `datePublished` في مقالاته (خالد ١٨ سبتمبر ٢٠٢٦).
 *
 * يُحسب من المقالات نفسها ولا يُخزَّن على الطلب: تخزينُه رقماً ثانياً يكذب أوّلَ ما
 * يُعدَّل مقال. استعلامٌ واحد لكلّ الجدول (`groupBy` على `clientId`) لا استعلامٌ لكلّ صفّ.
 *
 * `clientId` على الطلب معرّفٌ مجرّد بلا `@relation` (حذفُ العميل يجب ألّا يجرّ
 * طلباته)، فالجلبُ مستقلّ لا بـ`include`.
 */
export async function getFirstPublishedDates(clientIds: string[]): Promise<Map<string, Date>> {
  if (clientIds.length === 0) return new Map();
  const rows = await db.article.groupBy({
    by: ["clientId"],
    where: { clientId: { in: clientIds }, NOT: [{ datePublished: null }] },
    _min: { datePublished: true },
  });
  const out = new Map<string, Date>();
  for (const row of rows) {
    if (row._min.datePublished) out.set(row.clientId, row._min.datePublished);
  }
  return out;
}
