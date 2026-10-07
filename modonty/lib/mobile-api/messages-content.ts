/**
 * رسائل نقاط قراءة المحتوى (المجموعة C · V2/V3) — منفصلة عن `http.ts` المشترك بين الوكلاء.
 * نفس الصيغة: جملة عربية قصيرة تنتهي بنقطة.
 */
export const CONTENT_MESSAGES = {
  tagNotFound: "الوسم غير موجود.",
  authorNotFound: "الكاتب غير موجود.",
  pageNotFound: "الصفحة غير موجودة.",
  sectorNotFound: "القطاع غير موجود.",
  userNotFound: "المستخدم غير موجود.",
} as const;
