import { db } from "@/lib/db";
import { expiredByDateWhere } from "@/app/(dashboard)/clients/segment/segments";

/**
 * **الطلباتُ السارية لعملاءٍ انتهى اشتراكُهم** — ما يعدّه ويعرضه «منتهٍ» في شاشة الاشتراكات.
 *
 * ٢٣ سبتمبر ٢٠٢٦ — خالد: مصدرٌ واحد. كان الفلترُ يحكم على كلّ طلبٍ مدفوع بمدّته هو، فطلبٌ
 * قديم لعميلٍ جدّد يظهر «منتهياً»، والحساباتُ الداخليّة معه. الآن: عملاءُ شريحة «منتهٍ» نفسِها
 * (`expiredByDateWhere` — الطلبُ الساري بـ`NOT_INTERNAL`) ← `activeOrderId` لكلٍّ منهم.
 * فالعدّادُ = عددُ العملاء في `/clients/segment/expired`، طلبٌ واحدٌ لكلّ عميل.
 */
export async function getExpiredActiveOrderIds(): Promise<string[]> {
  const clients = await db.client.findMany({
    where: await expiredByDateWhere(),
    select: { activeOrderId: true },
    take: 5000,
  });
  return clients.flatMap((c) => (c.activeOrderId ? [c.activeOrderId] : []));
}
