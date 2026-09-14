import type { NGeniusOrderResponse } from "./types";

/**
 * هل ما رصده المزوّد هو **مبلغ طلبنا** بعينه؟
 *
 * لماذا هذا الملفّ موجود: مساران يقلبان الطلب إلى «مدفوع» — الاستعلام الاحتياطي وويبهوك
 * المزوّد — وكلاهما كان يقرأ **الحالة** وحدها (`CAPTURED`) ولا ينظر إلى الرقم. فطلبٌ
 * بـ١٧٬٩٩٤ ريالاً يُوسم مدفوعاً لأن دفعةً ما نجحت، أيّاً كان مقدارها. ثم تُصدَر فاتورةٌ
 * بالمبلغ الكامل ويُسلَّم الاشتراك — والفارق لا يظهر في أي شاشة، لأن لا شاشة تقارن.
 * (نفس الثغرة قائمة عند جبر سيو حتى اليوم — قيست ١٣ سبتمبر ٢٠٢٦.)
 *
 * الطرق التي تُنتج فرقاً حقيقياً: قبضٌ جزئي · جلسةٌ أُعيد استعمالها لطلبٍ آخر · عملةٌ
 * مختلفة يقبلها الحساب · أو تلاعبٌ في الوسيط. لا واحدةٌ منها شائعة، وكلّها تُخرج مالاً.
 *
 * القاعدة: عند أي اختلاف **لا يُوسم الطلب مدفوعاً**. يبقى كما هو ويُسجَّل الفارق كي يراه
 * إنسان. تركُ طلبٍ معلَّقاً خطؤه مكالمةٌ مع مشترٍ؛ ووسمُه مدفوعاً بلا مال خطؤه لا يُكتشف.
 */

export interface AmountVerdict {
  ok: boolean;
  /** ما رصده المزوّد بالوحدة الصغرى — null حين لا يذكره الردّ. */
  providerMinor: number | null;
  providerCurrency: string | null;
  /** سببٌ مقروء للتسجيل. null عند التطابق. */
  reason: string | null;
}

export function assertAmountMatchesOrder(
  providerOrder: NGeniusOrderResponse,
  order: { totalMinor: number; currency: string },
): AmountVerdict {
  const amount = providerOrder.amount;
  const providerMinor = typeof amount?.value === "number" ? amount.value : null;
  const providerCurrency = amount?.currencyCode ?? null;

  // ردٌّ بلا مبلغ ليس تطابقاً: لا نستطيع التأكيد، فلا نُقرّ. (شكلٌ غير متوقَّع من المزوّد
  // يجب أن يُوقف الإقرار لا أن يمرّ بصمت.)
  if (providerMinor === null || providerCurrency === null) {
    return { ok: false, providerMinor, providerCurrency, reason: "amount_missing_in_provider_response" };
  }

  if (providerCurrency !== order.currency) {
    return {
      ok: false,
      providerMinor,
      providerCurrency,
      reason: `currency_mismatch provider=${providerCurrency} order=${order.currency}`,
    };
  }

  if (providerMinor !== order.totalMinor) {
    return {
      ok: false,
      providerMinor,
      providerCurrency,
      reason: `amount_mismatch provider=${providerMinor} order=${order.totalMinor}`,
    };
  }

  return { ok: true, providerMinor, providerCurrency, reason: null };
}
