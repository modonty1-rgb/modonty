import type {
  SuccessKey,
  ErrorKey,
  ConfirmKey,
} from './types';

// ─── SUCCESS MESSAGES ───
const success: Record<SuccessKey, string> = {
  saved: 'تم الحفظ بنجاح',
  updated: 'تم التحديث بنجاح',
  approved: 'تمت الموافقة بنجاح',
  rejected: 'تم الرفض بنجاح',
  passwordChanged: 'تم تغيير كلمة المرور بنجاح',
  copied: 'تم النسخ إلى الحافظة',
} as const;

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

// ─── CONFIRMATION MESSAGES ───
const confirm: Record<ConfirmKey, string> = {
  delete: 'هل تريد الحذف؟ لا يمكن التراجع عنه',
  approve: 'هل تريد الموافقة على هذا المحتوى؟',
  reject: 'هل تريد رفض هذا المحتوى؟',
  logout: 'هل تريد تسجيل الخروج؟',
} as const;

// ─── EXPORT ───
export const messages = {
  success,
  error,
  confirm,
} as const;
