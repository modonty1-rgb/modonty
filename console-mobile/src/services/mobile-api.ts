import Constants from 'expo-constants';

const configuredBaseUrl = Constants.expoConfig?.extra?.mobileApiBaseUrl;
if (typeof configuredBaseUrl !== 'string' || configuredBaseUrl.length === 0) {
  throw new Error('mobileApiBaseUrl must be configured through Expo app config.');
}
const baseUrl = configuredBaseUrl;

type ApiEnvelope<T> = { data?: T; error?: { message?: string } };

export class MobileSessionExpiredError extends Error {}

/** Network reached no server: distinguishes «بلا شبكة» from a server error. */
export class MobileOfflineError extends Error {}

async function envelopeOf<T>(response: Response, fallbackMessage: string): Promise<T> {
  let payload: ApiEnvelope<T>;
  try {
    payload = await response.json() as ApiEnvelope<T>;
  } catch {
    throw new Error(fallbackMessage);
  }
  if (!response.ok) throw new Error(payload.error?.message ?? fallbackMessage);
  if (payload.data === undefined) throw new Error(payload.error?.message ?? fallbackMessage);
  return payload.data;
}

/** Single request path for every domain module: offline is typed, 401 expires the session, `ok` is read before `json`. */
export async function mobileRequest<T>(path: string, accessToken: string, fallbackMessage: string, init?: { method?: 'GET' | 'POST' | 'PATCH'; body?: unknown }): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: init?.method ?? 'GET',
      headers: init?.body === undefined
        ? { Authorization: `Bearer ${accessToken}` }
        : { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: init?.body === undefined ? undefined : JSON.stringify(init.body),
    });
  } catch (reason) {
    throw new MobileOfflineError(reason instanceof Error ? reason.message : fallbackMessage);
  }
  if (response.status === 401) throw new MobileSessionExpiredError('انتهت الجلسة. سجّل الدخول مرة أخرى.');
  return envelopeOf<T>(response, fallbackMessage);
}

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

export type MobileShellCopy = { menuLabel: string; brandLabel: string; accountLabel: string; closeMenuLabel: string; darkModeLabel: string; lightModeLabel: string; supportLabel: string };

export type MobileDashboard = {
  summary: { pendingApproval: number; pendingQuestions: number; pendingComments: number; pendingVideos: number };
  /** يُبذَر منه عدّاد شارة التنبيهات قبل أن يفتح العميل التاب. */
  unreadNotifications: number;
  actionItems: { key: 'approval' | 'questions' | 'comments' | 'videos' | 'bookings'; value: number; label: string }[];
  subscription: MobileSubscription | null;
  referral: MobileReferral;
  shell: MobileShellCopy;
  review: { title: string; greetingPrefix: string; greetingFallback: string; subtitle: string; subscriptionLabel: string; daysRemainingText: string | null; actionItemsTitle: string; noActionItemsLabel: string };
};

export type MobileReferral = { screenTitle: string; backLabel: string; hook: string; title: string; description: string; phoneLabel: string; consentLabel: string; consentDescription: string; submitLabel: string; unavailableLabel: string; stepsTitle: string; steps: string[]; lastReferralTitle: string; lastReferralEmpty: string };

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
  review: { screenTitle: string; backLabel: string; planPaymentTitle: string; tierLabel: string; paymentLabel: string; usageTitle: string; remainingArticlesLabel: string; noArticlesPublishedLabel: string; periodTitle: string; startDateLabel: string; endDateLabel: string; durationLabel: string; priceLabel: string };
};

export type MobileArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  statusLabel: string;
  wordCount: number | null;
  wordCountLabel: string | null;
  datePublished: string | null;
  publishedDateLabel: string | null;
  metadataLabel: string | null;
  siteUrl: string | null;
  featuredImage: { url: string; bunnyUrl: string | null; altText: string | null } | null;
  category: { name: string } | null;
  contentFaqCount: number;
  citationCount: number | null;
  updatedAt: string;
};

export type MobileArticleCollection = {
  articles: MobileArticle[];
  review: { title: string; emptyTitle: string; emptyDescription: string; retryLabel: string; openLabelPrefix: string; reviewActionLabel?: string; questionCountLabel?: string; citationCountLabel?: string; openSiteLabel?: string; openSiteAccessibilityPrefix?: string; openSiteError?: string };
};

export type MobileArticleDetail = MobileArticle & {
  content: string | null;
  wordCount: number | null;
  category: { name: string } | null;
  featuredImage: { url: string; bunnyUrl: string | null; altText: string | null } | null;
  faqs: { id: string; question: string; answer: string | null; status: string; source: 'manual' | null; position: number }[];
  citations: string[];
  isYmyl: boolean;
  review: {
    title: string;
    article: { title: string; description: string };
    faqs: { title: string; description: string; approveLabel: string; approvingLabel: string; rejectLabel: string; rejectingLabel: string; rejectConfirmationTitle: string; rejectConfirmationDescription: string; cancelLabel: string } | null;
    citations: { title: string; description: string } | null;
    changes: { title: string; description: string; inputLabel: string; submitLabel: string; submittingLabel: string; cancelLabel: string };
    approve: { label: string; loadingLabel: string; confirmationTitle: string; cancelLabel: string };
    backLabel: string;
  };
};

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
  questions: { id: string; question: string; answer: string | null; status: string; source: 'user' | 'chatbot'; submittedByName: string | null; submittedByEmail: string | null; createdAt: string; article: { id: string; title: string; slug: string } }[];
  comments: { id: string; content: string; status: string; createdAt: string; author: { name: string | null; email: string | null } | null; article: { id: string; title: string } }[];
  summary: { pendingQuestions: number; pendingComments: number };
  review: {
    title: string;
    sourceUserLabel: string;
    sourceChatbotLabel: string;
    pendingLabel: string;
    publishedLabel: string;
    rejectedLabel: string;
    articleLabel: string;
    nameLabel: string;
    emailLabel: string;
    answerLabel: string;
    publishLabel: string;
    publishingLabel: string;
    rejectLabel: string;
    rejectingLabel: string;
    retryLabel: string;
    emptyTitle: string;
    emptyDescription: string;
    rejectConfirmationTitle: string;
    rejectConfirmationDescription: string;
    cancelLabel: string;
  };
};

/** تسجيل رمز الدفع عند الخادم — الجانب المفقود: النقطة موجودة منذ البداية ولا ينادِها أحد. */
export function registerPushDevice(accessToken: string, device: { expoPushToken: string; platform: 'android' | 'ios'; deviceName?: string; appVersion?: string }): Promise<{ device: { id: string; platform: string; enabled: boolean } }> {
  return mobileRequest<{ device: { id: string; platform: string; enabled: boolean } }>('/devices/register', accessToken, 'تعذّر تسجيل الجهاز للتنبيهات.', { method: 'POST', body: device });
}

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

export async function refreshMobileAccessToken(accessToken: string): Promise<string> {
  const response = await fetch(`${baseUrl}/auth/refresh`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } });
  if (response.status === 401) throw new MobileSessionExpiredError('انتهت الجلسة. سجّل الدخول مرة أخرى.');
  if (!response.ok) throw new Error('تعذّر التحقق من الجلسة.');
  const payload = await response.json() as ApiEnvelope<{ accessToken?: string }>;
  if (!payload.data?.accessToken) throw new MobileSessionExpiredError('انتهت الجلسة. سجّل الدخول مرة أخرى.');
  return payload.data.accessToken;
}

export async function logoutMobileSession(accessToken: string): Promise<void> {
  const response = await fetch(`${baseUrl}/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) {
    const payload = await response.json() as ApiEnvelope<never>;
    throw new Error(payload.error?.message);
  }
  const payload = await response.json() as ApiEnvelope<{ signedOut?: boolean }>;
  if (payload.data?.signedOut !== true) throw new Error();
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

export async function getArticles(accessToken: string, scope: 'published' | 'decision'): Promise<MobileArticleCollection> {
  const response = await fetch(`${baseUrl}/articles?scope=${scope}`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('تعذّر تحميل المقالات.');
  const payload = await response.json() as ApiEnvelope<MobileArticleCollection>;
  if (!payload.data?.articles || !payload.data.review) throw new Error('تعذّر تحميل المقالات.');
  return payload.data;
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

export async function requestArticleChanges(accessToken: string, articleId: string, feedback: string): Promise<void> {
  const response = await fetch(`${baseUrl}/articles/${articleId}/request-changes`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ feedback }) });
  if (!response.ok) {
    const payload = await response.json() as ApiEnvelope<never>;
    throw new Error(payload.error?.message);
  }
  const payload = await response.json() as ApiEnvelope<{ status?: string }>;
  if (payload.data?.status !== 'NEEDS_REVISION') throw new Error();
}

export async function approveContentFaq(accessToken: string, articleId: string, faqId: string): Promise<void> {
  const response = await fetch(`${baseUrl}/articles/${articleId}/faqs/${faqId}/approve`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) {
    const payload = await response.json() as ApiEnvelope<never>;
    throw new Error(payload.error?.message);
  }
  const payload = await response.json() as ApiEnvelope<{ faq?: { id: string; status: string } }>;
  if (payload.data?.faq?.id !== faqId || payload.data.faq.status !== 'PUBLISHED') throw new Error();
}

export async function rejectContentFaq(accessToken: string, articleId: string, faqId: string): Promise<void> {
  const response = await fetch(`${baseUrl}/articles/${articleId}/faqs/${faqId}/reject`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) {
    const payload = await response.json() as ApiEnvelope<never>;
    throw new Error(payload.error?.message);
  }
  const payload = await response.json() as ApiEnvelope<{ faq?: { id: string; status: string } }>;
  if (payload.data?.faq?.id !== faqId || payload.data.faq.status !== 'REJECTED') throw new Error();
}

export async function getVideos(accessToken: string): Promise<MobileVideo[]> {
  const response = await fetch(`${baseUrl}/videos`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('تعذّر تحميل الطلّات.');
  const payload = await response.json() as ApiEnvelope<{ videos?: MobileVideo[] }>;
  if (!payload.data?.videos) throw new Error('تعذّر تحميل الطلّات.');
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

export async function replyToAudienceQuestion(accessToken: string, questionId: string, answer: string): Promise<void> {
  const response = await fetch(`${baseUrl}/questions/${questionId}/reply`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ answer }) });
  if (!response.ok) {
    const payload = await response.json() as ApiEnvelope<never>;
    throw new Error(payload.error?.message);
  }
  const payload = await response.json() as ApiEnvelope<{ question?: { id: string; status: string } }>;
  if (payload.data?.question?.id !== questionId || payload.data.question.status !== 'PUBLISHED') throw new Error();
}

export async function rejectAudienceQuestion(accessToken: string, questionId: string): Promise<void> {
  const response = await fetch(`${baseUrl}/questions/${questionId}/reject`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) {
    const payload = await response.json() as ApiEnvelope<never>;
    throw new Error(payload.error?.message);
  }
  const payload = await response.json() as ApiEnvelope<{ question?: { id: string; status: string } }>;
  if (payload.data?.question?.id !== questionId || payload.data.question.status !== 'REJECTED') throw new Error();
}
