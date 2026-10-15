import { db } from "@/lib/db";

const DAY = 86400_000;
/** بعد إجابة: لا يُسأل العميل ثانيةً قبل ٩٠ يوماً — المعتاد في استبيانات NPS. */
const ANSWER_GAP_DAYS = 90;
/** بعد إغلاقٍ بـ×: يعود بعد ١٤ يوماً — تأجيلٌ لا رفض. */
const DISMISS_GAP_DAYS = 14;

/**
 * هل يظهر للعميل استبيان الرضا (NPS) الآن؟ (خالد ١٥ أكتوبر ٢٠٢٦ — على نمط نافذة تمارا.)
 * مستهلكان: الكونسول (`app/(dashboard)/layout.tsx`) وتطبيق الجوال (`api/mobile/v1/nps`).
 *
 * - لا يظهر لفريقنا وهو داخلٌ بحساب العميل (impersonated) — إجابته ليست رأي العميل.
 * - لا يظهر قبل أوّل مقالٍ منشور: من لم يرَ شغلنا بعد لا يُسأل عنه.
 * - بعد إجابة: ٩٠ يوماً · بعد إغلاقٍ بـ×: ١٤ يوماً.
 */
export async function getNpsDue(clientId: string, impersonated: boolean): Promise<boolean> {
  if (impersonated) return false;
  const [published, lastAnswer, lastDismiss] = await Promise.all([
    db.article.count({ where: { clientId, status: "PUBLISHED" }, take: 1 }),
    db.clientNpsResponse.findFirst({
      where: { clientId, dismissed: false },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    db.clientNpsResponse.findFirst({
      where: { clientId, dismissed: true },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);
  if (published === 0) return false;
  const now = Date.now();
  if (lastAnswer && now - lastAnswer.createdAt.getTime() < ANSWER_GAP_DAYS * DAY) return false;
  if (lastDismiss && now - lastDismiss.createdAt.getTime() < DISMISS_GAP_DAYS * DAY) return false;
  return true;
}
