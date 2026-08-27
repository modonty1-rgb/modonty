import Constants from 'expo-constants';

const configuredBaseUrl = Constants.expoConfig?.extra?.mobileApiBaseUrl;
if (typeof configuredBaseUrl !== 'string' || configuredBaseUrl.length === 0) {
  throw new Error('mobileApiBaseUrl must be configured through Expo app config.');
}
const baseUrl = configuredBaseUrl;

type ApiEnvelope<T> = { data?: T; error?: { message?: string } };

export type MobileSession = {
  accessToken: string;
  client: { id: string; name: string; slug: string; email: string };
};

export type MobileClientProfile = MobileSession['client'] & {
  subscriptionStatus: string;
  subscriptionTier: string;
  logoUrl: string | null;
  logoAlt: string | null;
};

export type MobileDashboard = {
  summary: { pendingApproval: number; pendingQuestions: number; pendingComments: number; pendingVideos: number };
  recentArticles: { id: string; title: string; status: string; updatedAt: string }[];
  subscription: MobileSubscription | null;
};

export type MobileSubscription = {
  status: string;
  statusLabel: string;
  tier: string;
  tierName: string;
  startDate: string | null;
  endDate: string | null;
  daysRemaining: number | null;
  durationDays: number | null;
  articlesPerMonth: number | null;
  articlesPublishedThisMonth: number;
  articlesRemaining: number | null;
  price: { amount: number; currency: 'SAR' | 'EGP'; display: string } | null;
};

export type MobileArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  updatedAt: string;
};

export type MobileArticleDetail = MobileArticle & { content: string | null; wordCount: number | null; category: { name: string } | null; featuredImage: { url: string; bunnyUrl: string | null; altText: string | null } | null };

export type MobileVideo = {
  id: string;
  filename: string;
  reelStatus: string | null;
  durationSec: number | null;
  thumbnailUrl: string | null;
  createdAt: string;
};

export type MobileNotification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  relatedId: string | null;
  readAt: string | null;
  createdAt: string;
};

export type MobileAudience = {
  questions: { id: string; question: string; status: string; source: string; submittedByName: string | null; createdAt: string; article: { id: string; title: string } }[];
  comments: { id: string; content: string; status: string; createdAt: string; author: { name: string | null; email: string | null } | null; article: { id: string; title: string } }[];
  summary: { pendingQuestions: number; pendingComments: number };
};

export async function loginWithEmail(email: string, password: string): Promise<MobileSession> {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password }),
  });
  if (!response.ok) {
    throw new Error('تعذّر تسجيل الدخول. حاول مرة أخرى.');
  }
  const payload = await response.json() as ApiEnvelope<MobileSession>;
  if (!payload.data?.accessToken) {
    throw new Error('تعذّر تسجيل الدخول. حاول مرة أخرى.');
  }
  return payload.data;
}

export async function getCurrentClient(accessToken: string): Promise<MobileClientProfile> {
  const response = await fetch(`${baseUrl}/me`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) {
    throw new Error('تعذّر تحميل بيانات الحساب.');
  }
  const payload = await response.json() as ApiEnvelope<{ client?: {
    id: string; name: string; slug: string; email: string; subscriptionStatus: string; subscriptionTier: string;
    logoMedia?: { url: string; bunnyUrl?: string | null; altText?: string | null } | null;
  } }>;
  const client = payload.data?.client;
  if (!client) throw new Error('تعذّر تحميل بيانات الحساب.');
  return { ...client, logoUrl: client.logoMedia?.bunnyUrl ?? client.logoMedia?.url ?? null, logoAlt: client.logoMedia?.altText ?? null };
}

export async function getDashboard(accessToken: string): Promise<MobileDashboard> {
  const response = await fetch(`${baseUrl}/dashboard`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) {
    throw new Error('تعذّر تحميل الرئيسية.');
  }
  const payload = await response.json() as ApiEnvelope<MobileDashboard>;
  if (!payload.data) throw new Error('تعذّر تحميل الرئيسية.');
  return payload.data;
}

export async function getArticles(accessToken: string): Promise<MobileArticle[]> {
  const response = await fetch(`${baseUrl}/articles`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('تعذّر تحميل المقالات.');
  const payload = await response.json() as ApiEnvelope<{ articles?: MobileArticle[] }>;
  if (!payload.data?.articles) throw new Error('تعذّر تحميل المقالات.');
  return payload.data.articles;
}

export async function getArticle(accessToken: string, articleId: string): Promise<MobileArticleDetail> {
  const response = await fetch(`${baseUrl}/articles/${articleId}`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('تعذّر تحميل المقال.');
  const payload = await response.json() as ApiEnvelope<{ article?: MobileArticleDetail }>;
  if (!payload.data?.article) throw new Error('تعذّر تحميل المقال.');
  return payload.data.article;
}

export async function approveArticle(accessToken: string, articleId: string): Promise<void> {
  const response = await fetch(`${baseUrl}/articles/${articleId}/approve`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('تعذّر اعتماد المقال.');
  const payload = await response.json() as ApiEnvelope<{ status?: string }>;
  if (payload.data?.status !== 'SCHEDULED') throw new Error('تعذّر اعتماد المقال.');
}

export async function getVideos(accessToken: string): Promise<MobileVideo[]> {
  const response = await fetch(`${baseUrl}/videos`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('تعذّر تحميل الفيديوهات.');
  const payload = await response.json() as ApiEnvelope<{ videos?: MobileVideo[] }>;
  if (!payload.data?.videos) throw new Error('تعذّر تحميل الفيديوهات.');
  return payload.data.videos;
}

export async function getNotifications(accessToken: string): Promise<{ notifications: MobileNotification[]; unreadCount: number }> {
  const response = await fetch(`${baseUrl}/notifications`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('تعذّر تحميل التنبيهات.');
  const payload = await response.json() as ApiEnvelope<{ notifications?: MobileNotification[]; unreadCount?: number }>;
  if (!payload.data?.notifications || typeof payload.data.unreadCount !== 'number') throw new Error('تعذّر تحميل التنبيهات.');
  return { notifications: payload.data.notifications, unreadCount: payload.data.unreadCount };
}

export async function getAudience(accessToken: string): Promise<MobileAudience> {
  const response = await fetch(`${baseUrl}/audience`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('تعذّر تحميل الجمهور.');
  const payload = await response.json() as ApiEnvelope<MobileAudience>;
  if (!payload.data) throw new Error('تعذّر تحميل الجمهور.');
  return payload.data;
}
