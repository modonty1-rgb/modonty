import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ArticleFAQStatus } from "@prisma/client";
import { messages } from "@/lib/messages";
import { stripHtmlTags } from "@modonty/shared/lib/strip-html-tags";
import { regenerateClientSeo } from "../../profile/actions/regenerate-client-seo";

/**
 * تغيير سؤال على صفحة العميل (ردّ ينشره، أو رفض/استعادة) — المنطق الواحد للويب والجوال.
 *
 * كان في أكشن الويب ويقرأ العميل من جلسة المتصفّح؛ ومنذ ٥ أكتوبر ٢٠٢٦ يرنّ الجوال بكل سؤال
 * جديد على الصفحة، فلا بدّ أن يقدر يردّ عليه من التطبيق — بنفس النتيجة: الردّ ينشر السؤال
 * في صفحته ويعيد توليد FAQPage JSON-LD.
 */
type ClientPageFaqResult = { success: true } | { success: false; error: string };

export async function updateClientPageFaqForClient(
  clientId: string,
  id: string,
  change: { status: ArticleFAQStatus; answer?: string }
): Promise<ClientPageFaqResult> {
  try {
    const owned = await db.clientFAQ.findFirst({ where: { id, clientId }, select: { id: true } });
    if (!owned) return { success: false, error: messages.error.notFound };
    const answer = change.answer === undefined ? undefined : stripHtmlTags(change.answer.trim());
    await db.clientFAQ.update({ where: { id }, data: { status: change.status, ...(answer === undefined ? {} : { answer }) } });
    try {
      await regenerateClientSeo(clientId);
    } catch {
      /* best-effort */
    }
    revalidatePath("/dashboard/page-faq");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}
