import type { ErrorKey } from './types';

// ─── ERROR MESSAGES ───
const error: Record<ErrorKey, string> = {
  invalidCredentials: 'البريد أو كلمة المرور غير صحيحة',
  wrongPassword: 'كلمة المرور الحالية غير صحيحة',
  notFound: 'لم يتم العثور على هذا العنصر',
  unauthorized: 'أنت غير مخول للقيام بهذا الإجراء',
  conflict: 'حدث تضارب في البيانات',
  serverError: 'حدث خطأ في الخادم. جرب لاحقاً',
  required: 'هذا الحقل مطلوب',
  feedback_required: 'التعليقات مطلوبة عند طلب التغييرات',
  answer_required: 'أدخل نص الرد',
  reply_required: 'نص الرد مطلوب',
} as const;

// ─── EXPORT ───
export const messages = {
  error,
} as const;
