/**
 * مُرقّاة من `sales-leads/helpers/funnel.ts` (٢٩ سبتمبر ٢٠٢٦): مسارا العملاء المحتملين والحملات يقرآنها معاً —
 * «ليش خسرنا» على كرت البريف هي نفس أسباب الخسارة في جدول المبيعات، فمصدرها واحد.
 *
 * لماذا سقط — السؤال الذي كانت «مؤرشف» تبتلعه.
 *
 * بلا جوابه يبقى الخاسرون رقماً ميتاً؛ ومعه يُعرف إن كان السعر يطرد الناس أم المتابعة تتأخّر
 * أم السوق غلط. وهذه القائمة قصيرة عمداً: خمسة أسباب تُختار في ثانية، والسادس يكتب نفسه.
 */
export const LOST_REASONS = ["PRICE", "COMPETITOR", "NO_RESPONSE", "NOT_NOW", "NOT_A_FIT", "OTHER"] as const;
export type LostReason = (typeof LOST_REASONS)[number];

export const LOST_LABEL: Record<LostReason, string> = {
  PRICE: "السعر",
  COMPETITOR: "منافس",
  NO_RESPONSE: "لا يوجد ردّ",
  NOT_NOW: "ليس الآن",
  NOT_A_FIT: "غير مناسب",
  OTHER: "سبب آخر",
};
