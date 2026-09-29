/** وين يروح العميل بعد الضغط على الإعلان — يحدّد كيف يُنسب إلى الحملة. */
export const DESTINATIONS = ["WEBSITE", "WHATSAPP", "PLATFORM_FORM"] as const;
export type Destination = (typeof DESTINATIONS)[number];

export const DESTINATION_LABEL: Record<Destination, string> = {
  WEBSITE: "صفحة هبوط (لاندنج بيج)",
  WHATSAPP: "واتساب",
  PLATFORM_FORM: "نموذج داخل المنصّة",
};

/** Only the website carries the brief code in its link; the other two need sales to pick the campaign. */
export const DESTINATION_HINT: Record<Destination, string> = {
  WEBSITE: "العميل يصل برابطٍ يحمل كود الحملة — يُنسب لها تلقائياً.",
  WHATSAPP: "لا رابط يحمل الكود — المبيعات تختار الحملة عند تسجيل العميل.",
  PLATFORM_FORM: "لا رابط يحمل الكود — المبيعات تختار الحملة عند تسجيل العميل.",
};
