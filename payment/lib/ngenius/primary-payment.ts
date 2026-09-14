import type { NGeniusOrderResponse, NGeniusPayment } from "./types";

/**
 * الدفعة الأولى في الطلب — الطلبات عندنا دفعةٌ واحدة دائماً (شراء كامل بلا تقسيط داخلي).
 * تُرجع null عند شكلٍ غير متوقَّع بدل أن ترمي: قارئ الحالة يجب ألّا ينهار لأن المزوّد
 * غيّر ترتيب حقلٍ في ردّه.
 */
export function primaryPayment(order: NGeniusOrderResponse): NGeniusPayment | null {
  return order._embedded?.payment?.[0] ?? null;
}
