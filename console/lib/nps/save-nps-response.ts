import { z } from "zod";

import { db } from "@/lib/db";

/** إجابة برقمٍ (وتعليقٍ اختياري) أو إغلاقٌ بـ× — نفس المدخل من الكونسول والجوال. */
export const NpsInput = z.union([
  z.object({ score: z.number().int().min(0).max(10), comment: z.string().trim().max(1000).optional() }),
  z.object({ dismissed: z.literal(true) }),
]);

/**
 * يحفظ إجابة استبيان الرضا أو تأجيله. مستهلكان: إجراء الكونسول (`app/(dashboard)/actions/submit-nps.ts`)
 * ومدخل الجوال (`api/mobile/v1/nps`) — القاعدة واحدة فلا تختلف الإجابة باختلاف الباب.
 */
export async function saveNpsResponse(clientId: string, raw: unknown): Promise<{ success: boolean; error?: string }> {
  const parsed = NpsInput.safeParse(raw);
  if (!parsed.success) return { success: false, error: "مدخل غير صالح" };
  const data =
    "dismissed" in parsed.data
      ? { clientId, dismissed: true }
      : { clientId, score: parsed.data.score, comment: parsed.data.comment || null };
  await db.clientNpsResponse.create({ data, select: { id: true } });
  return { success: true };
}
