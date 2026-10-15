import { db } from "@/lib/db";

/**
 * موعد الرصد كما هو في كرون السيرفر (`automation/content-radar/README.md`) — الأحد والأربعاء ٦ صباحاً
 * بتوقيت الرياض (`0 3 * * 0,3` UTC)، وطلبات «ابحث الآن» تُلتقط كل ٥ دقائق. مرّتان لا كل يوم (خالد ١٥
 * أكتوبر ٢٠٢٦): المواضيع المطلوبة تعيش أسبوعاً إلى ١٠ أيام فتُلتقط، والتكلفة ~٣$ شهرياً بدل ~١٠$. يُعرض نصّاً لأن الكرون على Contabo لا
 * في القاعدة؛ تغييره هناك يستوجب تغيير هذا السطر.
 */
export const RADAR_SCHEDULE_LABEL = "يتحدّث الأحد والأربعاء ٦ صباحاً بتوقيت الرياض";

/** آخر مرّة وصل فيها الرادار — أحدث «آخر ظهور» في البنك، مقيسٌ لا مكتوب. */
export async function getLastUpdate(): Promise<Date | null> {
  const row = await db.ideaBankItem.findFirst({ orderBy: { lastSeenAt: "desc" }, select: { lastSeenAt: true } });
  return row?.lastSeenAt ?? null;
}
