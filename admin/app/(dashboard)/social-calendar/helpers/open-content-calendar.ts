import "server-only";

import { db } from "@/lib/db";

/**
 * كاليندر المحتوى يُفتح بتفعيل العميل (خالد ١١ أكتوبر ٢٠٢٦: «مجرد ما نعمل اكتيفيشن نأسس الكرت»).
 * واحدٌ للعميل: إن وُجد يُعاد كما هو — التجديد يكمل على نفس الكرت.
 */
export async function openContentCalendar(clientId: string): Promise<string> {
  const existing = await db.socialCalendar.findFirst({ where: { clientId, kind: "CONTENT" }, select: { id: true } });
  if (existing) return existing.id;
  const created = await db.socialCalendar.create({ data: { kind: "CONTENT", clientId }, select: { id: true } });
  return created.id;
}
