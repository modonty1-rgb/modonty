/**
 * شكل ردّ كل أكشن في التقويم. الأخطاء تُرجَع ولا تُرمى: خطأ مرميّ داخل server action يُسقط
 * الصفحة على error.tsx، وخسارة الجدول كلّه أسوأ من منشور واحد يرفض الانتقال
 * (نفس قاعدة `lib/tasks/task-actions.ts`).
 */
export type ActionResult = { success: true } | { success: false; error: string };

export type ActionResultWith<T> = ({ success: true } & T) | { success: false; error: string };
