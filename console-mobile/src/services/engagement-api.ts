import { mobileRequest } from '@/src/services/mobile-api';

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

export type AudienceInbox = { questions: AudienceQuestionSummary[]; comments: AudienceCommentSummary[]; review: AudienceReview };

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
  screenTitle: string;
};

export type VideoCollection = {
  videos: VideoSummary[];
  review: { title: string; uploadActionLabel: string; latestSectionTitle: string; uploadHintLabel: string; retryLabel: string; emptyTitle: string; emptyDescription: string; errorTitle: string; offlineTitle: string; offlineDescription: string };
  upload: VideoUploadCopy;
};

export type NotificationSummary = {
  id: string;
  title: string;
  body: string | null;
  relatedId: string | null;
  target: 'article' | 'audience' | 'videos' | null;
  isUnread: boolean;
  stateLabel: string;
  timeLabel: string;
};

export type NotificationCollection = {
  notifications: NotificationSummary[];
  unreadCount: number;
  review: { title: string; unreadBadgeLabel: string | null; priorityNote: string; openPrefix: string; retryLabel: string; emptyTitle: string; emptyDescription: string; errorTitle: string; offlineTitle: string; offlineDescription: string };
};

export type NotificationToggle = { key: 'actionable' | 'activity'; label: string; description: string; enabled: boolean };

export type AccountOverview = {
  account: { name: string; email: string; planLabel: string; notifications: NotificationToggle[] };
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

export function getAccountOverview(accessToken: string): Promise<AccountOverview> {
  return mobileRequest<AccountOverview>('/me', accessToken, 'تعذّر تحميل الحساب.');
}

export function saveNotificationToggle(accessToken: string, key: NotificationToggle['key'], enabled: boolean): Promise<{ notifications: NotificationToggle[] }> {
  return mobileRequest('/me/notifications', accessToken, 'تعذّر حفظ الإعداد.', { method: 'PATCH', body: { key, enabled } });
}

export function getSupportReview(accessToken: string): Promise<{ review: SupportReview }> {
  return mobileRequest<{ review: SupportReview }>('/support', accessToken, 'تعذّر تحميل صفحة الدعم.');
}

export function sendSupportMessage(accessToken: string, message: string): Promise<{ message: { id: string }; review: SupportReview }> {
  return mobileRequest('/support', accessToken, 'تعذّر إرسال رسالتك.', { method: 'POST', body: { message } });
}
