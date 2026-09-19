import { db } from "@/lib/db";
import { recomputeSubscriptionEnd } from "@/lib/invoices/recompute-subscription-end";

/**
 * **ساعةُ الاشتراك تبدأ بأوّل مقالٍ يصل العميل — لا بيوم الدفع ولا بيوم التفعيل.**
 *
 * خالد (١٩ سبتمبر ٢٠٢٦): «المدّة تبدأ بعد أوّل أرتيكل». ومدّةُ التجهيز بين الدفع
 * والتسليم — البروفايل التجاريّ · الموقع · الداتا · الكونسول — شغلُنا نحن، فلا تُحسب
 * على العميل من اشتراكه.
 *
 * ── لماذا هنا، وليس على المقال ──
 * `Article.firstDeliveredAt` يقول «متى سُلّم هذا المقال». والمدّةُ تخصّ **الطلب**:
 * فالتجديدُ في السنة الثانية له ساعتُه الخاصّة، ولو قُرئت من أوّل مقالٍ في حياة العميل
 * لرجع الطلبُ الثاني إلى تاريخٍ قبل شرائه (السكيما، `firstDeliveredAt`). فيُختم الاثنان:
 * المقالُ يقول متى سُلّم، والطلبُ السّاري يقول متى بدأت خدمتُه.
 *
 * ── ويُكتب مرّةً واحدة ──
 * العميل قد يردّ المقال للتعديل ثمّ يرجع «بانتظار الموافقة» ثانيةً — والوصولُ الأوّل هو
 * المقصود. فالشرطُ `{ firstDeliveredAt: null }` في الكتابة يجعل الثانية بلا أثر، بلا
 * قراءةٍ سابقةٍ ولا سباق.
 *
 * ── وما يترتّب ──
 * ختمُ `serviceStartedAt` هو ما يجعل `subscriptionEndDate` قابلاً للحساب أصلاً
 * (`recompute-subscription-end.ts` = بداية الخدمة + الشهور المدفوعة + الهديّة). وقبله
 * يبقى العميلُ بلا تاريخِ نهاية **عن حقّ**: خدمتُه لم تبدأ بعد، فلا تجديدَ يُطالَب به.
 */
export async function startServiceClockOnFirstDelivery(articleId: string): Promise<void> {
  const article = await db.article.findUnique({
    where: { id: articleId },
    select: { id: true, clientId: true, firstDeliveredAt: true },
  });
  if (!article?.clientId || article.firstDeliveredAt) return;

  const now = new Date();

  // أوّلاً المقال: الكتابةُ مشروطةٌ بأن يكون فارغاً، فلا تُعاد عند الرجوع من التعديل.
  const stamped = await db.article.updateMany({
    where: { id: articleId, firstDeliveredAt: null },
    data: { firstDeliveredAt: now },
  });
  if (stamped.count === 0) return;

  // ثمّ الطلبُ السّاري لهذا العميل — إن كانت ساعتُه لم تبدأ.
  const client = await db.client.findUnique({
    where: { id: article.clientId },
    select: { activeOrderId: true },
  });
  if (!client?.activeOrderId) return;

  const started = await db.checkoutOrder.updateMany({
    where: { id: client.activeOrderId, serviceStartedAt: null },
    data: { serviceStartedAt: now },
  });
  if (started.count === 0) return;

  // وبها صارت النهايةُ معروفة — تُشتقّ، لا تُدخَل.
  await recomputeSubscriptionEnd(article.clientId);
}
