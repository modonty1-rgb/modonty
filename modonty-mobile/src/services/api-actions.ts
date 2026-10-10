import type { SharePlatform } from './api-types';
import type {
  AlertPrefs,
  AlertPrefsBody,
  AnalyticsPatchBody,
  AvatarData,
  ChatBody,
  ChatData,
  ChatHistoryData,
  CommentLikeData,
  ContactBody,
  ContactData,
  MeActivityData,
  MeBookingsData,
  MeCommentsData,
  MeDislikedData,
  MeLikedData,
  MeReelsData,
  NewsletterData,
  OkData,
  PartnerFavoriteData,
  PartnerSubscribeData,
  PasswordBody,
  PasswordData,
  ProfilePatchBody,
  ProfilePatchData,
  QuestionCreateBody,
  ReelCommentCreateData,
  ReelCommentLikeData,
  ReelReplyCreateData,
  ReplyCreateData,
  ReviewCreateBody,
  ReviewCreateData,
  TopicAlertData,
  AlertTopicId,
  WhatsappLeadData,
  BookingSourceWire,
} from './api-types-actions';
import type { DeleteAccountData } from './api-types-account';
import { request } from './http';

const enc = encodeURIComponent;

/** E5 — الردود وإعجاب التعليق. */
export const commentsApi = {
  reply: (commentId: string, slug: string, content: string) =>
    request<ReplyCreateData>(`/comments/${commentId}/replies`, { method: 'POST', auth: 'required', body: { slug, content } }),
  like: (commentId: string, slug: string) =>
    request<CommentLikeData>(`/comments/${commentId}/like`, { method: 'POST', auth: 'required', body: { slug } }),
  /** E13 — سؤال للشريك من المقال. */
  askAboutArticle: (articleId: string, body: QuestionCreateBody) =>
    request<OkData>(`/articles/${articleId}/questions`, { method: 'POST', auth: 'required', body }),
};

/** E10 · E11 · E12 · E13 · E15 · E19 — الشريك. */
export const partnerActionsApi = {
  favoriteState: (slug: string) => request<PartnerFavoriteData>(`/partners/${enc(slug)}/favorite`, { auth: 'required' }),
  favorite: (slug: string) => request<PartnerFavoriteData>(`/partners/${enc(slug)}/favorite`, { method: 'POST', auth: 'required' }),
  unfavorite: (slug: string) => request<PartnerFavoriteData>(`/partners/${enc(slug)}/favorite`, { method: 'DELETE', auth: 'required' }),
  share: (slug: string, platform: SharePlatform) =>
    request<OkData>(`/partners/${enc(slug)}/share`, { method: 'POST', auth: 'optional', device: true, body: { platform } }),
  review: (slug: string, body: ReviewCreateBody) =>
    request<ReviewCreateData>(`/partners/${enc(slug)}/reviews`, { method: 'POST', auth: 'required', body }),
  ask: (slug: string, body: QuestionCreateBody) =>
    request<OkData>(`/partners/${enc(slug)}/questions`, { method: 'POST', auth: 'required', body }),
  whatsappLead: (partnerId: string, articleId?: string, source?: BookingSourceWire) =>
    request<WhatsappLeadData>(`/partners/${partnerId}/whatsapp-lead`, {
      method: 'POST',
      device: true,
      body: { source: source ?? (articleId ? 'article_card' : 'client_page'), articleId: articleId ?? null },
    }),
  subscribe: (partnerId: string, email: string) =>
    request<PartnerSubscribeData>(`/partners/${partnerId}/subscribe`, { method: 'POST', device: true, body: { email } }),
};

/** E18 — تعليقات الريل ومشاركته. */
export const reelActionsApi = {
  comment: (reelId: string, content: string) =>
    request<ReelCommentCreateData>(`/reels/${reelId}/comments`, { method: 'POST', auth: 'required', body: { content } }),
  reply: (commentId: string, content: string) =>
    request<ReelReplyCreateData>(`/reel-comments/${commentId}/replies`, { method: 'POST', auth: 'required', body: { content } }),
  likeComment: (commentId: string) => request<ReelCommentLikeData>(`/reel-comments/${commentId}/like`, { method: 'POST', auth: 'required' }),
  /** الخادم يقبل `native | clipboard` (track-reel-share) — ورقة النظام هي «native». */
  share: (reelId: string, _platform: 'OTHER') =>
    request<OkData>(`/reels/${reelId}/share`, { method: 'POST', device: true, body: { platform: 'native' } }),
};

/** E19 · E20 · E7 · T2 · V3 — عامّة. */
export const miscApi = {
  newsletter: (email: string) => request<NewsletterData>('/newsletter', { method: 'POST', device: true, body: { email } }),
  contact: (body: ContactBody) => request<ContactData>('/contact', { method: 'POST', auth: 'optional', device: true, body }),
  analytics: (id: string, body: AnalyticsPatchBody) => request<OkData>(`/analytics/${id}`, { method: 'PATCH', device: true, body }),
  linkClick: (articleId: string, linkUrl: string, linkText?: string) =>
    request<OkData>('/track/link-click', { method: 'POST', device: true, body: { articleId, linkUrl, linkText, isExternal: /^https?:/.test(linkUrl) } }),
  topicAlert: (topic: AlertTopicId) => request<TopicAlertData>('/topic-alerts', { method: 'POST', auth: 'required', body: { topic } }),
  /** مودو بلا بثّ: `fetch` في React Native لا يقرأ الجسم تدريجياً، فيُطلب الجواب كاملاً (`stream:false`) بالغلاف المعتاد. */
  chat: (body: Omit<ChatBody, 'stream'>) => request<ChatData>('/chat', { method: 'POST', auth: 'required', body: { ...body, stream: false } }),
  chatHistory: (cursor?: string | null, signal?: AbortSignal) => request<ChatHistoryData>('/chat/history', { auth: 'required', query: { limit: 20, cursor }, signal }),
};

/** A9–A14 — حسابي. */
export const meApi = {
  update: (body: ProfilePatchBody) => request<ProfilePatchData>('/me', { method: 'PATCH', auth: 'required', body }),
  avatar: (file: { uri: string; name: string; type: string }) => {
    const form = new FormData();
    // React Native يقبل الملفّ كوصف { uri, name, type } داخل FormData.
    form.append('file', file as unknown as Blob);
    return request<AvatarData>('/me/avatar', { method: 'POST', auth: 'required', body: form });
  },
  password: (body: PasswordBody) => request<PasswordData>('/me/password', { method: 'POST', auth: 'required', body }),
  alerts: (signal?: AbortSignal) => request<AlertPrefs>('/me/alerts', { auth: 'required', signal }),
  saveAlerts: (body: AlertPrefsBody) => request<AlertPrefs>('/me/alerts', { method: 'PUT', auth: 'required', body }),
  liked: (signal?: AbortSignal) => request<MeLikedData>('/me/liked', { auth: 'required', query: { limit: 50 }, signal }),
  disliked: (signal?: AbortSignal) => request<MeDislikedData>('/me/disliked', { auth: 'required', query: { limit: 50 }, signal }),
  comments: (page: number, signal?: AbortSignal) => request<MeCommentsData>('/me/comments', { auth: 'required', query: { page, limit: 20 }, signal }),
  bookings: (signal?: AbortSignal) => request<MeBookingsData>('/me/bookings', { auth: 'required', query: { limit: 50 }, signal }),
  reels: (kind: 'LIKE' | 'FAVORITE', signal?: AbortSignal) => request<MeReelsData>('/me/reels', { auth: 'required', query: { kind }, signal }),
  activity: (page: number, signal?: AbortSignal) => request<MeActivityData>('/me/activity', { auth: 'required', query: { page, limit: 20 }, signal }),
  remove: (body: { password?: string; confirm: string }) => request<DeleteAccountData>('/me', { method: 'DELETE', auth: 'required', body }),
};
