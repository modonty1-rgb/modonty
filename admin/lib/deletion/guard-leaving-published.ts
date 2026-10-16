import { ArticleStatus } from "@prisma/client";

import { requireDeleteAdmin } from "./require-delete-admin";

/**
 * مقال منشور ينتقل لحالة غير النشر = رابطه يرجع لجوجل 410.
 * - الأرشفة قرار الكاتب (خالد ١٦ أكتوبر ٢٠٢٦: «أول قرار يجي من الكاتب إنه يأرشف»)، فتمرّ.
 * - غيرها (رجوع لمسودة) للأدمن وحده.
 * يرجع رسالة الرفض، أو null حين يُسمح. يُنادى من كل باب يغيّر حالة المقال.
 */
export async function guardLeavingPublished(from: ArticleStatus, to: ArticleStatus): Promise<string | null> {
  if (from !== ArticleStatus.PUBLISHED || to === ArticleStatus.PUBLISHED || to === ArticleStatus.ARCHIVED) return null;
  const denied = await requireDeleteAdmin();
  return denied
    ? "المقال منشور — رجوعه لمسودة يشيل رابطه من جوجل، وهذا للأدمن فقط. لو تبغى تشيله، أرشفه."
    : null;
}
