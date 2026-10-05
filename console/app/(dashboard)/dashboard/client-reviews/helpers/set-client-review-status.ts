import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { CommentStatus } from "@prisma/client";
import { messages } from "@/lib/messages";
import { regenerateClientSeo } from "../../profile/actions/regenerate-client-seo";

/**
 * تغيير حالة تقييم على صفحة العميل — المنطق الواحد للويب وتطبيق الجوال.
 *
 * كان داخل أكشن الويب ويقرأ العميل من جلسة المتصفّح؛ ومنذ ٥ أكتوبر ٢٠٢٦ يرنّ جوال العميل
 * بكل تقييم جديد، فلا بدّ أن يقدر يعتمده أو يرفضه من التطبيق بنفس القاعدة (ومعها تحديث
 * JSON-LD للتقييم المجمّع الذي تقرؤه مدونتي).
 */
export type ClientReviewStatusResult = { success: true } | { success: false; error: string };

export async function setClientReviewStatusForClient(
  clientId: string,
  reviewId: string,
  status: CommentStatus
): Promise<ClientReviewStatusResult> {
  const owned = await db.clientReview.findFirst({ where: { id: reviewId, clientId }, select: { id: true } });
  if (!owned) return { success: false, error: messages.error.notFound };
  try {
    await db.clientReview.update({ where: { id: reviewId }, data: { status } });
    // Keep cached JSON-LD (AggregateRating + Review[]) fresh in the shared DB,
    // since approving/rejecting a review changes the aggregate read by modonty.
    try {
      await regenerateClientSeo(clientId);
    } catch {
      /* best-effort — moderation must succeed even if SEO regen fails */
    }
    revalidatePath("/dashboard/client-reviews");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}
