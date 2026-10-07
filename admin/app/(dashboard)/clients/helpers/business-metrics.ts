import { SubscriptionStatus } from "@prisma/client";

/**
 * Flexible interface for client data used in business metrics calculations
 * Only requires the fields actually used by the functions
 */
interface ClientWithRelations {
  articles?: Array<{ datePublished: Date | null }>;
  articlesPerMonth?: number | null;
  subscriptionEndDate?: Date | null;
  subscriptionStatus: SubscriptionStatus;
}

export function calculateDeliveryRate(
  client: ClientWithRelations,
  currentMonthArticles: number
): {
  delivered: number;
  promised: number;
  rate: number;
  isBehind: boolean;
} {
  // **الحصّة من الطلب الساري وحده.**
  //
  // `Client.articlesPerMonth` نسخةُ عرضٍ يكتبها التفعيل من `CheckoutOrder.articlesPerMonth`
  // (`activate-from-order.ts:163`) — وقيست يوم إسقاط الاحتياطيّ: **صفرُ اختلافٍ** بين
  // النسخة والطلب في الـ٤٦ كلّهم.
  //
  // وسقط `?? subscriptionTierConfig?.articlesPerMonth` (خالد ١٩ سبتمبر ٢٠٢٦): جدولُ
  // الباقات متقاعدٌ ولا يُكتب فيه، و٤٢ من ٤٦ عميلاً ما زالوا يحملون `subscriptionTierConfigId`
  // مهجوراً — فالاحتياطيُّ مصدرُ مالٍ ثانٍ يعيش بعد الطلب: عميلٌ رُقّيت باقتُه وسقطت نسخةُ
  // حصّته لأيّ سبب كان يُقاس على حصّةِ باقةٍ باعها أحدٌ قبل سنة. وبلا احتياطيّ تظهر الفجوة
  // «—» بدل أن تُملأ برقمٍ من دفترٍ آخر.
  const promised = client.articlesPerMonth ?? 0;
  const delivered = currentMonthArticles;
  const rate = promised > 0 ? Math.round((delivered / promised) * 100) : 0;
  const isBehind = delivered < promised;

  return {
    delivered,
    promised,
    rate,
    isBehind,
  };
}
