import { mobileRequest, type MobileStat } from '@/src/services/mobile-api';

/**
 * S08–S14 — audience, videos, notifications, account and support.
 *
 * Every visible string arrives finished from the server, including dates and counts. Hermes
 * ships a partial `Intl`, so the phone is not a place to build Arabic copy; the endpoints
 * format with full ICU and this module only carries the result.
 */

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/**
 * The one number the server cannot pre-format: the live character count under a text field,
 * which changes on every keystroke. A digit table, not copy — and not `Intl`, which Hermes
 * may resolve to Latin digits and break the counter mid-word.
 */
export function arabicDigits(value: number): string {
  return String(Math.max(0, Math.trunc(value))).replace(/\d/g, (digit) => ARABIC_DIGITS[Number(digit)]);
}

/** Same digit table for server-written copy («186 يوماً» → «١٨٦ يوماً»). */
export function arabicDigitsText(value: string | null | undefined): string {
  return (value ?? "").replace(/\d/g, (digit) => ARABIC_DIGITS[Number(digit)]);
}

export type StatusTone = 'primary' | 'warning' | 'danger' | 'muted';

export type AudienceQuestionSummary = {
  id: string;
  name: string | null;
  initial: string | null;
  email: string | null;
  timeLabel: string;
  metaLine: string | null;
  question: string;
  articleLine: string;
};

export type AudienceCommentSummary = {
  id: string;
  /** مقال أو ريل — يحدّد جدول القرار. غائب في الخادم الأقدم ⇐ مقال. */
  kind?: 'article' | 'reel' | 'review';
  name: string | null;
  initial: string | null;
  email: string | null;
  metaLine: string | null;
  content: string;
  articleLine: string;
};

export type AudienceReview = {
  title: string;
  subtitle: string;
  questionsTabLabel: string;
  questionsTabCount: string;
  commentsTabLabel: string;
  commentsTabCount: string;
  replyLinkLabel: string;
  /** شارة «ينتظر ردك» — اختيارية كي يبقى الخادم الأقدم يعمل. */
  questionBadgeLabel?: string;
  /** قرار التعليق — بلا هذين الحقلين (خادم أقدم) تبقى البطاقة بلا أزرار كما كانت. */
  commentApproveLabel?: string;
  commentRejectLabel?: string;
  commentBadgeLabel?: string;
  reviewsTabLabel?: string;
  reviewsTabCount?: string;
  emptyReviewsTitle?: string;
  emptyReviewsDescription?: string;
  openQuestionPrefix: string;
  emptyQuestionsTitle: string;
  emptyQuestionsDescription: string;
  emptyCommentsTitle: string;
  emptyCommentsDescription: string;
  retryLabel: string;
  errorTitle: string;
  offlineTitle: string;
  offlineDescription: string;
};

export type AudienceInbox = { questions: AudienceQuestionSummary[]; comments: AudienceCommentSummary[]; /** تقييمات صفحة العميل — غائبة في الخادم الأقدم. */ reviews?: AudienceCommentSummary[]; review: AudienceReview };

export type AudienceQuestionDetail = {
  question: { id: string; name: string | null; email: string | null; metaLine: string | null; question: string; answer: string | null; isAnswerable: boolean; timeLabel: string };
  review: {
    title: string;
    backLabel: string;
    questionCardLabel: string;
    answerLabel: string;
    answerPlaceholder: string;
    submitLabel: string;
    submittingLabel: string;
    confirmTitle: string;
    confirmBody: string;
    confirmAction: string;
    confirmCancel: string;
    sentToastLabel: string;
    counterMaxLabel: string;
    answerMaxLength: number;
    answeredLabel: string;
    retryLabel: string;
    errorTitle: string;
    offlineTitle: string;
    offlineDescription: string;
  };
};

export type VideoSummary = {
  id: string;
  filename: string;
  statusLabel: string | null;
  statusTone: StatusTone | null;
  metaLine: string | null;
  rejectionReason: string | null;
  thumbnailUrl: string | null;
  /** غائبة في الخادم الأقدم ⇐ الطلّة تُعرض ولا تُشغَّل. */
  isVideo?: boolean;
  /** رابط التشغيل (HLS أو MP4) — `null` لصورة أو فيديو لم يُجهَّز بعد. */
  videoUrl?: string | null;
  /** الصورة نفسها للطلّة المصوّرة — تُعرض ملء الشاشة بدل المشغّل. */
  imageUrl?: string | null;
};

export type VideoUploadCopy = {
  available: boolean;
  title: string;
  description: string;
  statusBadgeLabel: string;
  cameraLabel: string;
  libraryLabel: string;
  noteTitle: string;
  noteBody: string;
  backLabel: string;
  unavailableLabel: string;
  /** الجملة بلا العنوان + رابط يُضغط — غائبة في الخادم الأقدم ⇐ `unavailableLabel` كما هو. */
  unavailableText?: string;
  consoleLinkLabel?: string;
  consoleUrl?: string;
  screenTitle: string;
};

export type VideoCollection = {
  videos: VideoSummary[];
  review: {
    stats?: MobileStat[]; title: string; uploadActionLabel: string; latestSectionTitle: string; uploadHintLabel: string; retryLabel: string; emptyTitle: string; emptyDescription: string; errorTitle: string; offlineTitle: string; offlineDescription: string;
    /** نصوص المشغّل — اختيارية كي يبقى الخادم الأقدم يعمل. */
    openPrefix?: string; playerBackLabel?: string; playLabel?: string; pauseLabel?: string; rejectionTitle?: string; videoNotReadyLabel?: string; playbackErrorLabel?: string;
  };
  upload: VideoUploadCopy;
};

export type NotificationSummary = {
  id: string;
  title: string;
  body: string | null;
  relatedId: string | null;
  /** `null` = تنبيه نشاط بلا شاشة (متابعة · مشاركة صفحة) — يُضغط ليُقرأ كاملاً ويُوسم مقروءاً. */
  target: 'article' | 'bookings' | 'audience' | 'videos' | null;
  isUnread: boolean;
  stateLabel: string;
  timeLabel: string;
};

export type NotificationCollection = {
  notifications: NotificationSummary[];
  unreadCount: number;
  review: { title: string; unreadBadgeLabel: string | null; priorityNote: string; openPrefix: string; /** غائب في الخادم الأقدم ⇐ لا زرّ. */ markAllReadLabel?: string; /** غائبان في الخادم الأقدم ⇐ يبقى النصّ حتى إعادة الجلب. */ readStateLabel?: string; unreadBadgeTemplate?: string; retryLabel: string; emptyTitle: string; emptyDescription: string; errorTitle: string; offlineTitle: string; offlineDescription: string };
};

export type NotificationToggle = { key: 'actionable' | 'activity'; label: string; description: string; enabled: boolean };

/** مفتاح لكل حدث (٦ أكتوبر ٢٠٢٦) — `section` يضعه تحت عنوانه، والقائمة والعناوين من الخادم كي يضيف حدثاً بلا بناء. */
export type NotificationEventToggle = { key: string; section: string; label: string; enabled: boolean };

export type AccountOverview = {
  account: {
    name: string;
    email: string;
    planLabel: string;
    notifications: NotificationToggle[];
    /** غائبان في الخادم الأقدم ⇐ تبقى المجموعتان. */
    notificationEvents?: NotificationEventToggle[];
    notificationGroups?: { key: string; label: string }[];
  };
  review: {
    title: string;
    backLabel: string;
    notificationsSectionTitle: string;
    helpSectionTitle: string;
    supportTitle: string;
    supportDescription: string;
    logoutLabel: string;
    logoutConfirmTitle: string;
    logoutConfirmDescription: string;
    logoutConfirmLabel: string;
    cancelLabel: string;
    savingLabel: string;
    saveErrorTitle: string;
    retryLabel: string;
    errorTitle: string;
    offlineTitle: string;
    offlineDescription: string;
  };
};

export type SupportReview = {
  title: string;
  backLabel: string;
  heroTitle: string;
  heroDescription: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitLabel: string;
  submittingLabel: string;
  noteLabel: string;
  sentTitle: string;
  sentDescription: string;
  messageMaxLength: number;
  counterMaxLabel: string;
  emptyMessageError: string;
  sendErrorTitle: string;
  retryLabel: string;
  offlineTitle: string;
  offlineDescription: string;
};

export function getAudienceInbox(accessToken: string): Promise<AudienceInbox> {
  return mobileRequest<AudienceInbox>('/audience', accessToken, 'تعذّر تحميل الجمهور.');
}

export function decideAudienceComment(accessToken: string, commentId: string, kind: 'article' | 'reel' | 'review', decision: 'approve' | 'reject'): Promise<{ comment: { id: string; status: string }; message: string }> {
  return mobileRequest(`/comments/${commentId}`, accessToken, 'تعذّر حفظ قرارك على التعليق.', { method: 'POST', body: { kind, decision } });
}

export function getAudienceQuestion(accessToken: string, questionId: string): Promise<AudienceQuestionDetail> {
  return mobileRequest<AudienceQuestionDetail>(`/audience/questions/${questionId}`, accessToken, 'تعذّر تحميل السؤال.');
}

export function sendAudienceReply(accessToken: string, questionId: string, answer: string): Promise<{ question: { id: string; status: string } }> {
  return mobileRequest(`/questions/${questionId}/reply`, accessToken, 'تعذّر إرسال الرد.', { method: 'POST', body: { answer } });
}

export function getVideoCollection(accessToken: string): Promise<VideoCollection> {
  return mobileRequest<VideoCollection>('/videos', accessToken, 'تعذّر تحميل الطلّات.');
}

export function getNotificationCollection(accessToken: string): Promise<NotificationCollection> {
  return mobileRequest<NotificationCollection>('/notifications', accessToken, 'تعذّر تحميل التنبيهات.');
}

/** يُوسَم التنبيه مقروءاً عند فتحه، ويرجع العدّ الجديد فلا يحتاج التطبيق نداءً ثانياً ليصحّح شارته. */
export function markNotificationRead(accessToken: string, notificationId: string): Promise<{ notificationId: string; unreadCount: number }> {
  return mobileRequest<{ notificationId: string; unreadCount: number }>(`/notifications/${notificationId}/read`, accessToken, 'تعذّر تحديث حالة التنبيه.', { method: 'POST' });
}

/** «تعليم الكل كمقروء» — يرجع العدّ بعد الوسم (صفر إلا لو وصل تنبيه في نفس اللحظة). */
export function markAllNotificationsRead(accessToken: string): Promise<{ markedCount: number; unreadCount: number }> {
  return mobileRequest<{ markedCount: number; unreadCount: number }>('/notifications/read-all', accessToken, 'تعذّر تحديث حالة التنبيهات.', { method: 'POST' });
}

export function getAccountOverview(accessToken: string): Promise<AccountOverview> {
  return mobileRequest<AccountOverview>('/me', accessToken, 'تعذّر تحميل الحساب.');
}

export function saveNotificationToggle(accessToken: string, key: string, enabled: boolean): Promise<{ notifications: NotificationToggle[]; notificationEvents?: NotificationEventToggle[] }> {
  return mobileRequest('/me/notifications', accessToken, 'تعذّر حفظ الإعداد.', { method: 'PATCH', body: { key, enabled } });
}

export function getSupportReview(accessToken: string): Promise<{ review: SupportReview }> {
  return mobileRequest<{ review: SupportReview }>('/support', accessToken, 'تعذّر تحميل صفحة الدعم.');
}

export function sendSupportMessage(accessToken: string, message: string): Promise<{ message: { id: string }; review: SupportReview }> {
  return mobileRequest('/support', accessToken, 'تعذّر إرسال رسالتك.', { method: 'POST', body: { message } });
}
