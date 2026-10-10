/** أسماء الشهور كما في القديم (`JBRSEO/content/lib/constants.ts:1-14`) — بالترتيب، index = رقم الشهر 0-11. */
export const MONTH_LABELS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
] as const;

export const MONTH_LABELS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export const DAY_NAMES = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"] as const;

/** المنطقة الزمنية الثابتة للتقويم (PRD §٩ س٦): الرياض، UTC+3 بلا توقيت صيفي. */
export const CALENDAR_TIME_ZONE = "Asia/Riyadh";
export const RIYADH_OFFSET_MINUTES = 180;
