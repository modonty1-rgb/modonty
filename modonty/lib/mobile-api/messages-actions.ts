/**
 * رسائل نقاط التفاعل والحساب (المجموعة D) — منفصلة عن `http.ts` عن قصد كي لا تتعارض تعديلات
 * المجموعات. حيث وُجد نصّ الويب نفسه يُنسخ هنا حرفياً ويُذكر مصدره.
 */
export const ACTION_MESSAGES = {
  commentNotFound: "التعليق غير موجود.",
  reelCommentNotFound: "التعليق غير موجود.",
  replyEmpty: "اكتب ردّك أولاً.",
  replyTooLong: "الردّ طويل — الحدّ ١٠٠٠ حرف.",
  /** `lib/reels/submit-reel-comment-as.ts` (was `submit-reel-comment.ts:75`) */
  reelCommentSent: "وصل تعليقك — يظهر بعد مراجعة الشريك",
  /** `lib/reels/submit-reel-comment-reply-as.ts` (was `submit-reel-comment-reply.ts:66`) */
  reelReplySent: "وصل ردّك — يظهر بعد مراجعة الشريك",
  /** Same wording as the article comment confirmation (E4, CommentFormDialogContent.tsx). */
  replySent: "وصل ردّك — يظهر بعد مراجعة الشريك.",
  analyticsNotFound: "سجلّ القياس غير موجود.",
  analyticsForbidden: "هذا السجلّ لا يخصّ هذا الجهاز.",
  /** `app/api/news/subscribe/route.ts` (429 text) */
  subscribeRateLimited: "محاولات كثيرة. جرّب بعد شوي.",
  /** `app/api/news/subscribe/route.ts` (400 text) */
  invalidEmail: "البريد الإلكتروني غير صحيح",
  /** `app/api/subscribers/route.ts` (429 text) */
  partnerSubscribeRateLimited: "حاول مرة أخرى لاحقاً",
  /** `lib/users/upload-user-avatar.ts` (was `profile/api/avatar/route.ts:69`) */
  avatarMissing: "لم يتم إرسال ملف",
  topicUnknown: "الموضوع غير معروف.",
  chatSignedInOnly: "مودو في التطبيق للأعضاء — سجّل دخولك وأكمل.",
} as const;
