import "server-only";

import { callModoReindex } from "./call-modo-reindex";

/**
 * **فهرسة المقال لمودو لحظة نشره أو تعديل نصّه** (خالد ١٦ أكتوبر ٢٠٢٦: «مع كل ارتكل يتحوّل لببلش
 * نعمل له فهرسة») — لا ترمي أبداً: النشرُ تمّ، والمقالُ الذي فاتته فهرستُه يظهر في عدّاد الصيانة
 * ويُفهرس من زرّها.
 */
export async function reindexModoArticle(articleId: string): Promise<void> {
  const res = await callModoReindex({ articleId });
  if (!res.ok) console.error("[modo-reindex] article", articleId, res.error);
}
