import type { CheckoutOrderStatus } from "@prisma/client";

export interface OrderStatusCopy {
  label: string;
  /** جملةٌ تقول من ينتظر ماذا — تظهر عند وقوف المؤشّر على الشارة أو الحبّة. */
  hint: string;
  badgeVariant: "default" | "secondary" | "outline" | "destructive";
}

/**
 * **الحالتان المنتظِرتان ليستا مترادفتين — والفرقُ بينهما: مَن عليه الدور.**
 *
 * `AWAITING_PAYMENT` فُتحت جلسةُ بوّابةٍ ولم يُكملها المشتري (السعوديّة، بطاقةٌ أو تمارا).
 * لا عملَ علينا: ننتظره هو، وقد لا يعود أبداً.
 *
 * `AWAITING_TRANSFER` اختار المشتري التحويلَ اليدويّ (مصر)، فيحوّل بيده ويرسل الإيصال.
 * **والدورُ علينا نحن:** لا شيء يؤكّد وصولَ المال إلّا موظّفٌ يفتح الطلب ويضغط «أكّد وصول
 * الحوالة» — والزرُّ لا يظهر إلّا على هذه الحالة وحدها
 * (`orders/[id]/page.tsx` · `confirmOrderPaymentAction` يشترطها في `updateMany`).
 *
 * وكانت تُسمّى «بانتظار التحويل» فتُقرأ «ننتظر أن يحوّل» — وهي في الحقيقة «حوّل، وننتظر
 * أن نؤكّد». فطلبٌ يقف هنا يعني مالاً قد يكون وصل البنكَ ولم يُسجَّل عندنا (خالد
 * ١٩ سبتمبر ٢٠٢٦: «محتاجة توضيح أكثر لأنّها تسبّب لخبطة»). والمصدرُ في
 * `payment/app/api/checkout/bank-transfer/route.ts:145-155` يشرح الفرقَ نفسَه، وقد كُتب
 * بعد طلبٍ مصريٍّ علق بالحالة الخطأ فتعذّر تسجيلُ ماله (`ORD-2026-00058`، ١٥ سبتمبر).
 */
const COPY: Record<CheckoutOrderStatus, OrderStatusCopy> = {
  AWAITING_PAYMENT: {
    label: "لم يدفع بعد",
    hint: "فُتحت صفحةُ الدفع ولم يُكملها المشتري — الدورُ عليه لا علينا.",
    badgeVariant: "outline",
  },
  AWAITING_TRANSFER: {
    label: "حوالة تنتظر تأكيدك",
    hint: "المشتري يحوّل بيده (مصر) — افتح الطلب وأكّد وصول الحوالة ليُسجَّل المال.",
    badgeVariant: "outline",
  },
  PAID: { label: "مدفوع", hint: "وصل المال وسُجِّل.", badgeVariant: "default" },
  FAILED: { label: "فشل", hint: "رفضت البوّابةُ العمليّة — السببُ على الطلب.", badgeVariant: "destructive" },
  CANCELLED: { label: "ملغى", hint: "أُلغي قبل أن يصل مال.", badgeVariant: "secondary" },
  REFUNDED: { label: "مسترد", hint: "وصل المال ثمّ رُدَّ — وهو خارج الإيراد.", badgeVariant: "secondary" },
};

export function orderStatusCopy(status: CheckoutOrderStatus): OrderStatusCopy {
  return COPY[status];
}
