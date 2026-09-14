import type { PaymentAttemptStage } from "@prisma/client";

/**
 * أسماء المراحل بالعربية، بترتيب حدوثها في مسار الدفع لا بالأبجدية — فالقارئ يسأل
 * «أين مات الدفع؟»، وترتيبٌ زمنيّ يجيبه بنظرة واحدة.
 *
 * المراحل الثلاث الأولى تقع في **متصفّح المشتري** قبل أن يوجد طلب — وهي التي كانت تختفي
 * كلّها قبل `PAY-G14`/`PAY-G15`. الوسم `beforeOrder` يجعل ذلك مرئياً في الشاشة.
 */
export const ATTEMPT_STAGES: PaymentAttemptStage[] = [
  "validate",
  "session",
  "create_order",
  "auth",
  "three_ds",
  "poll",
  "webhook",
];

const COPY: Record<PaymentAttemptStage, { label: string; hint: string; beforeOrder: boolean }> = {
  validate: { label: "تحقّق المشتري", hint: "مدخلات المشتري في المتصفّح", beforeOrder: true },
  session: { label: "توليد الجلسة", hint: "فتح جلسة الدفع عند المزوّد", beforeOrder: true },
  three_ds: { label: "التحقّق الثنائي", hint: "تأكيد البنك في المتصفّح", beforeOrder: true },
  create_order: { label: "إنشاء الطلب", hint: "كتابة الطلب عندنا", beforeOrder: false },
  auth: { label: "تفويض البطاقة", hint: "خصم المبلغ", beforeOrder: false },
  poll: { label: "الاستعلام", hint: "سؤال المزوّد عن الحالة بعد صمت", beforeOrder: false },
  webhook: { label: "الويب هوك", hint: "ما وصل من المزوّد", beforeOrder: false },
};

export function attemptStageCopy(stage: PaymentAttemptStage | null) {
  return stage ? COPY[stage] : { label: "غير محدّدة", hint: "صفّ قديم قبل توسيع السجلّ", beforeOrder: false };
}
