/**
 * نتيجة الإعجاب وعدمه والحفظ — اتّحاد مميَّز بـ`success` الحرفي. بلا هذا النوع كان TypeScript يستنتج
 * `success: boolean` في الفرعين، فيضيق الاستنتاج في بناء Vercel (٩ أكتوبر ٢٠٢٦: TS2339 على `.data` في
 * TopEngagementBar ثم SavePostButton) ويتّسع محلياً. مكتوباً صراحةً يتطابق الاثنان.
 */
export type EngagementResult<T> = { success: true; data: T } | { success: false; error: string };
