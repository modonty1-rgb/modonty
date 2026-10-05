import Constants from 'expo-constants';

const configuredBaseUrl = Constants.expoConfig?.extra?.mobileApiBaseUrl;
if (typeof configuredBaseUrl !== 'string' || configuredBaseUrl.length === 0) {
  throw new Error('mobileApiBaseUrl must be configured through Expo app config.');
}
const baseUrl = configuredBaseUrl;

type ApiEnvelope<T> = { data?: T; error?: { message?: string } };

/**
 * كلمات الفشل الشبكي — **الاستثناء الوحيد من «صفر نصّ في الكود»**: هي ما يُقال حين لم يصل
 * الخادم أصلاً، فلا يمكن أن تأتي منه. وكانت رسالة المنصّة تُمرَّر كما هي، فرأى العميل
 * «Network request failed» بالإنجليزي في الدخول والرئيسية ولوحة المراجعة.
 */
export const connectionErrorText = {
  offline: 'ما في اتصال بالإنترنت. تأكد من الشبكة وجرّب مرة ثانية.',
  timeout: 'الخادم تأخّر في الرد. جرّب مرة ثانية.',
  sessionExpired: 'انتهت الجلسة. سجّل الدخول مرة أخرى.',
  loginFailed: 'تعذّر تسجيل الدخول. حاول مرة أخرى.',
  verifySessionFailed: 'ما قدرنا نتحقق من الجلسة. جرّب مرة ثانية.',
  loadAccountFailed: 'تعذّر تحميل بيانات الحساب.',
  loadHomeFailed: 'تعذّر تحميل الرئيسية.',
} as const;

export class MobileSessionExpiredError extends Error {
  constructor(message: string = connectionErrorText.sessionExpired) { super(message); }
}

/** Network reached no server: distinguishes «بلا شبكة» from a server error. Its message is always Arabic. */
export class MobileOfflineError extends Error {
  constructor(message: string = connectionErrorText.offline) { super(message); }
}

/**
 * من يُبلَّغ حين يرفض الخادم توكناً **أثناء** الجلسة.
 *
 * كان `MobileSessionExpiredError` يُلتقط في موضع واحد (استرجاع الجلسة عند الفتح)، فتوكنٌ
 * انتهى والتطبيق مفتوح يعطي كل شاشة «انتهت الجلسة» مع «إعادة المحاولة» لا تُصلح شيئاً.
 * الجذر يسجّل هنا دالّة تحاول التجديد مرّة، ولا تُخرج العميل إلا لو رُفض التجديد نفسه.
 */
let sessionRejectedListener: ((rejectedToken: string) => void) | null = null;
export function onMobileSessionRejected(listener: (rejectedToken: string) => void): () => void {
  sessionRejectedListener = listener;
  return () => { if (sessionRejectedListener === listener) sessionRejectedListener = null; };
}

const DEFAULT_TIMEOUT_MS = 20_000;

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

/**
 * النداء الخام الوحيد في التطبيق: الانقطاع والمهلة يصيران `MobileOfflineError` بنصّ عربي.
 * المهلة لازمة لأنّ `fetch` بلا مهلة قد يعلّق الشاشة على «جاري…» بلا نهاية مع شبكة ضعيفة.
 */
async function send(path: string, options: { method?: HttpMethod; body?: unknown; accessToken?: string; timeoutMs?: number } = {}): Promise<Response> {
  const headers: Record<string, string> = {};
  if (options.accessToken) headers.Authorization = `Bearer ${options.accessToken}`;
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  try {
    return await fetch(`${baseUrl}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    });
  } catch (reason) {
    // السبب الأصلي (إنجليزي) للسجلّ فقط — العميل يرى الجملة العربية.
    console.warn('[mobile-api] network failure', path, reason instanceof Error ? reason.message : reason);
    throw new MobileOfflineError(timedOut ? connectionErrorText.timeout : connectionErrorText.offline);
  } finally {
    clearTimeout(timer);
  }
}

async function envelopeOf<T>(response: Response, fallbackMessage: string): Promise<T> {
  let payload: ApiEnvelope<T>;
  try {
    payload = await response.json() as ApiEnvelope<T>;
  } catch {
    throw new Error(fallbackMessage);
  }
  if (!response.ok) throw new Error(payload.error?.message || fallbackMessage);
  if (payload.data === undefined) throw new Error(payload.error?.message || fallbackMessage);
  return payload.data;
}

/** Single request path for every domain module: offline is typed, 401 expires the session, `ok` is read before `json`. */
export async function mobileRequest<T>(path: string, accessToken: string, fallbackMessage: string, init?: { method?: HttpMethod; body?: unknown; timeoutMs?: number; reportSessionRejection?: boolean }): Promise<T> {
  const response = await send(path, { method: init?.method, body: init?.body, accessToken, timeoutMs: init?.timeoutMs });
  if (response.status === 401) {
    if (init?.reportSessionRejection !== false) sessionRejectedListener?.(accessToken);
    throw new MobileSessionExpiredError();
  }
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

export type MobileShellCopy = { menuLabel: string; brandLabel: string; accountLabel: string; closeMenuLabel: string; darkModeLabel: string; lightModeLabel: string; supportLabel: string; /** «نبض» — اختيارية كي يبقى الخادم الأقدم يعمل. */ themeLabel?: string; lightShortLabel?: string; darkShortLabel?: string };

export type MobileDashboard = {
  summary: { pendingApproval: number; pendingQuestions: number; pendingComments: number; pendingVideos: number };
  /** يُبذَر منه عدّاد شارة التنبيهات قبل أن يفتح العميل التاب. */
  unreadNotifications: number;
  /** `actionLabel` = زرّ البطل حين يكون البند أوّل المهام (قد يغيب في خادم أقدم). */
  actionItems: { key: 'approval' | 'questions' | 'comments' | 'videos' | 'bookings'; value: number; label: string; actionLabel?: string }[];
  subscription: MobileDashboardSubscription | null;
  referral: MobileReferral;
  shell: MobileShellCopy;
  review: { title: string; greetingPrefix: string; greetingFallback: string; subtitle: string; subscriptionLabel: string; daysRemainingText: string | null; actionItemsTitle: string; noActionItemsLabel: string; firstActionLabel?: string };
};

/**
 * ما يرسله `/dashboard` فعلاً لبطاقة الاشتراك — الحالة والأيّام والمدّة لا أكثر (ENGINEERING §4.1).
 * كان النوع `MobileSubscription` كاملاً (تواريخ · سعر · استخدام) وهي حقول لا يرسلها هذا العقد.
 */
export type MobileDashboardSubscription = {
  status: string;
  statusLabel: string;
  statusTone?: 'positive' | 'warning' | 'danger';
  daysRemaining?: number | null;
  durationDays?: number | null;
};

/** رقم في شريط «نبض» — القيمة مصاغة بالعربية من الخادم، والتسمية معها. */
export type MobileStat = { key: string; value: string; label: string; tone: 'warning' | 'positive' | 'danger' | 'neutral' | 'primary' | 'muted' };

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

/** تسجيل رمز الدفع عند الخادم — يرجع معرّف الجهاز ليُحفظ ويُلغى به التسجيل عند الخروج. */
export function registerPushDevice(accessToken: string, device: { expoPushToken: string; platform: 'android' | 'ios'; deviceName?: string; appVersion?: string }): Promise<{ device: { id: string; platform: string; enabled: boolean } }> {
  return mobileRequest<{ device: { id: string; platform: string; enabled: boolean } }>('/devices/register', accessToken, 'تعذّر تسجيل الجهاز للتنبيهات.', { method: 'POST', body: device });
}

/**
 * الدخول — **رسالة الخادم تُعرض كما هي** لأي رفض ٤xx (٤٠١ · ٤٢٢ · ٤٢٩).
 *
 * كانت تُرمى ويحلّ محلّها «تعذّر تسجيل الدخول. حاول مرة أخرى.» حتى لكلمة مرور خاطئة،
 * فيعيد العميل المحاولة بنفس الكلمة بدل أن يعرف أنها خطأ. الحقل يقبل البريد أو اسم الحساب،
 * ويُرسل في `email` لأنّ هذا اسم الحقل في عقد الخادم.
 */
export async function loginWithEmail(identifier: string, password: string): Promise<MobileSession> {
  const trimmed = identifier.trim();
  // العقد الحالي يقرأ `identifier`؛ و`email` يُرفق فقط حين يكون بريداً، فيبقى الخادم الأقدم يعمل.
  const body = trimmed.includes('@') ? { identifier: trimmed, email: trimmed, password } : { identifier: trimmed, password };
  const response = await send('/auth/login', { method: 'POST', body });
  let payload: ApiEnvelope<MobileSession> | null = null;
  try {
    payload = await response.json() as ApiEnvelope<MobileSession>;
  } catch {
    payload = null;
  }
  if (!response.ok) {
    const serverMessage = payload?.error?.message;
    throw new Error(response.status >= 400 && response.status < 500 && serverMessage ? serverMessage : connectionErrorText.loginFailed);
  }
  if (!payload?.data?.accessToken) throw new Error(connectionErrorText.loginFailed);
  return payload.data;
}

/** التجديد: ٤٠١ وحده يُنهي الجلسة؛ الانقطاع يرمي `MobileOfflineError` ويبقى التوكن محفوظاً. */
export async function refreshMobileAccessToken(accessToken: string): Promise<string> {
  const response = await send('/auth/refresh', { method: 'POST', accessToken });
  if (response.status === 401) throw new MobileSessionExpiredError();
  const data = await envelopeOf<{ accessToken?: string }>(response, connectionErrorText.verifySessionFailed);
  if (!data.accessToken) throw new Error(connectionErrorText.verifySessionFailed);
  return data.accessToken;
}

/**
 * الخروج يُنهي الجلسة عند الخادم **ويعطّل تنبيهات هذا الجهاز** بـ`deviceId` في الجسم —
 * فلا تصل تنبيهات العميل إلى جوال خرج منه. (`DELETE /devices/:id` بعد الخروج يرجع ٤٠١،
 * فالجسم هو الطريق الوحيد المضمون.)
 */
export async function logoutMobileSession(accessToken: string, deviceId: string | null): Promise<{ signedOut?: boolean; deviceUnregistered?: boolean }> {
  return mobileRequest<{ signedOut?: boolean; deviceUnregistered?: boolean }>('/auth/logout', accessToken, 'تعذّر تسجيل الخروج.', { method: 'POST', body: deviceId ? { deviceId } : {}, timeoutMs: 5_000, reportSessionRejection: false });
}

export async function getCurrentClient(accessToken: string): Promise<MobileClientProfile> {
  const data = await mobileRequest<{ client?: {
    id: string; name: string; slug: string; email: string; subscriptionStatus: string; subscriptionTier: string;
    logoMedia?: { url: string; bunnyUrl?: string | null; altText?: string | null } | null;
  } }>('/me', accessToken, connectionErrorText.loadAccountFailed);
  const client = data.client;
  if (!client) throw new Error(connectionErrorText.loadAccountFailed);
  return { ...client, logoUrl: client.logoMedia?.bunnyUrl ?? client.logoMedia?.url ?? null, logoAlt: client.logoMedia?.altText ?? null };
}

export function getDashboard(accessToken: string): Promise<MobileDashboard> {
  return mobileRequest<MobileDashboard>('/dashboard', accessToken, connectionErrorText.loadHomeFailed);
}
