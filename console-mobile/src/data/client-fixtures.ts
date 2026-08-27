/**
 * Mobile read models and local fixtures.
 *
 * These are intentionally shaped from shared/prisma/schema/schema.prisma.
 * They are API-safe projections: never copy secrets such as Client.password.
 * Replacing this module with API adapters must not require UI changes.
 */

export type ArticleStatus =
  | 'WRITING'
  | 'DRAFT'
  | 'AWAITING_APPROVAL'
  | 'NEEDS_REVISION'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'PUBLISHED_ON_CLIENT_SITE'
  | 'ARCHIVED';

export type ReelStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';

export type ClientEventKey =
  | 'articleView' | 'articleLike' | 'articleDislike' | 'articleFavorite' | 'articleShare'
  | 'articleCtaClick' | 'articleLinkClick' | 'commentNew' | 'commentReply' | 'commentLike'
  | 'commentDislike' | 'conversion' | 'leadHigh' | 'clientView' | 'clientFollow'
  | 'clientShare' | 'clientFavorite' | 'clientComment' | 'clientSubscribe' | 'supportMessage'
  | 'campaignInterest' | 'askClientQuestion' | 'bookingRequest';

export type ClientProfile = {
  id: string;
  name: string;
  slug: string;
  email: string;
  subscriptionTier: 'BASIC' | 'STANDARD' | 'PRO' | 'PREMIUM';
  subscriptionStatus: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
  articlesPerMonth: number | null;
  notificationPreferences: Record<string, boolean>;
};

export type ClientArticle = {
  id: string;
  clientId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: ArticleStatus;
  revisionNotes: string | null;
  scheduledAt: string | null;
  viewsCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ClientMedia = {
  id: string;
  clientId: string;
  filename: string;
  url: string;
  mimeType: string;
  inReels: boolean;
  reelStatus: ReelStatus | null;
  reelUploadedBy: 'ADMIN' | 'CLIENT' | null;
  reelRejectionReason: string | null;
  reelArticleId: string | null;
  thumbnailUrl: string | null;
  durationSec: number | null;
  createdAt: string;
};

/** Corresponds to Notification plus the existing console Telegram event key. */
export type ClientInboxEvent = {
  id: string;
  clientId: string;
  type: ClientEventKey | 'articleAwaitingApproval' | 'articleRevisionReady' | 'reelProcessing';
  title: string;
  body: string;
  relatedId: string | null;
  readAt: string | null;
  createdAt: string;
};

export const fixtureClient: ClientProfile = {
  id: '66d0a7e2bd7d2b4142b3f001',
  name: 'كيما زون',
  slug: 'kima-zone',
  email: 'admin@kimazone.sa',
  subscriptionTier: 'PRO',
  subscriptionStatus: 'ACTIVE',
  articlesPerMonth: 8,
  notificationPreferences: { articleView: true, commentNew: true, bookingRequest: true },
};

export const fixtureArticles: ClientArticle[] = [
  {
    id: '66d0a7e2bd7d2b4142b3a101', clientId: fixtureClient.id,
    title: 'كيف تبني حضورًا رقميًا يثق به عملاؤك؟', slug: 'digital-presence-that-builds-trust',
    excerpt: 'خطوات عملية تساعد نشاطك على الظهور بصورة واضحة وموثوقة أمام عملائه.',
    content: 'محتوى المقال التجريبي المطابق لحقول Article في قاعدة البيانات.',
    status: 'AWAITING_APPROVAL', revisionNotes: null, scheduledAt: null,
    viewsCount: 0, commentsCount: 0, createdAt: '2026-08-26T09:30:00.000Z', updatedAt: '2026-08-26T11:42:00.000Z',
  },
  {
    id: '66d0a7e2bd7d2b4142b3a102', clientId: fixtureClient.id,
    title: 'دليل اختيار الشركة المناسبة لخدمتك', slug: 'choosing-the-right-service-company',
    excerpt: 'دليل مبسط للمقارنة واتخاذ قرار أوضح قبل بدء الخدمة.',
    content: 'محتوى المقال التجريبي المطابق لحقول Article في قاعدة البيانات.',
    status: 'NEEDS_REVISION', revisionNotes: 'يرجى توضيح نطاق الخدمة في الفقرة الثانية.', scheduledAt: null,
    viewsCount: 128, commentsCount: 3, createdAt: '2026-08-18T08:00:00.000Z', updatedAt: '2026-08-25T14:20:00.000Z',
  },
];

export const fixtureMedia: ClientMedia[] = [
  {
    id: '66d0a7e2bd7d2b4142b3c201', clientId: fixtureClient.id,
    filename: 'intro-service-video.mp4', url: 'https://cdn.example.com/reels/intro-service-video.mp4',
    mimeType: 'video/mp4', inReels: true, reelStatus: 'PENDING_APPROVAL', reelUploadedBy: 'CLIENT',
    reelRejectionReason: null, reelArticleId: null, thumbnailUrl: null, durationSec: 42,
    createdAt: '2026-08-26T10:12:00.000Z',
  },
];

export const fixtureInboxEvents: ClientInboxEvent[] = [
  {
    id: '66d0a7e2bd7d2b4142b3d301', clientId: fixtureClient.id, type: 'articleAwaitingApproval',
    title: 'مقال بانتظار اعتمادك', body: fixtureArticles[0].title, relatedId: fixtureArticles[0].id,
    readAt: null, createdAt: '2026-08-26T11:42:00.000Z',
  },
  {
    id: '66d0a7e2bd7d2b4142b3d302', clientId: fixtureClient.id, type: 'askClientQuestion',
    title: 'سؤال مباشر لنشاطك', body: 'هل تقدمون استشارة أولية قبل البدء؟', relatedId: null,
    readAt: null, createdAt: '2026-08-26T10:38:00.000Z',
  },
  {
    id: '66d0a7e2bd7d2b4142b3d303', clientId: fixtureClient.id, type: 'reelProcessing',
    title: 'اكتمل رفع الفيديو', body: fixtureMedia[0].filename, relatedId: fixtureMedia[0].id,
    readAt: '2026-08-26T10:16:00.000Z', createdAt: '2026-08-26T10:14:00.000Z',
  },
];

export const fixtureUnreadInboxCount = fixtureInboxEvents.filter((event) => event.readAt === null).length;
