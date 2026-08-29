import Constants from 'expo-constants';
import { MobileOfflineError, mobileRequest } from '@/src/services/mobile-api';

/**
 * Network-failure copy lives in the service layer, not in a screen.
 *
 * Screen CONTENT always comes from the endpoint. These four strings are the one
 * thing an endpoint can never deliver: the words shown when the endpoint itself
 * could not be reached. Same convention `mobile-api.ts` already follows.
 */
export const networkCopy = {
  loadFailed: 'ما قدرنا نحمّل الصفحة.',
  /** الهيكل كان يُعلن نفسه «حاول مرة ثانية» لقارئ الشاشة — وهي حالة تحميل لا خطأ. */
  loadingLabel: 'جاري التحميل',
  offlineTitle: 'ما في اتصال',
  offlineDescription: 'تأكد من الشبكة وجرّب مرة ثانية.',
  retryLabel: 'حاول مرة ثانية',
  /** تسمية الرجوع قبل وصول العقد — تنقّلٌ لا محتوى، ولا يصحّ أن يُسمَّى «إعادة المحاولة». */
  backLabel: 'رجوع',
} as const;

export type LoginScreenCopy = {
  title: string;
  subtitle: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  showPasswordLabel: string;
  hidePasswordLabel: string;
  submitLabel: string;
  submittingLabel: string;
  missingFieldsMessage: string;
  forgotPasswordLabel: string;
  forgotPasswordUnavailableMessage: string;
};

export type ReferralStatusTone = 'waiting' | 'progress' | 'done' | 'closed';

export type MobileReferralRecord = { id: string; name: string; note: string | null; statusLabel: string; statusKey: string; statusTone: ReferralStatusTone; stageAtLabel: string | null; closingNote: string | null; sentAtLabel: string; createdAt: string };

export type ReferralScreen = {
  screenTitle: string;
  backLabel: string;
  sections: { how: string; add: string; mine: string };
  title: string;
  description: string;
  formTitle: string;
  nameLabel: string;
  namePlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  phoneFormatLabel: string;
  noteLabel: string;
  notePlaceholder: string;
  consentLabel: string;
  consentDescription: string;
  submitLabel: string;
  submittingLabel: string;
  submitSuccessLabel: string;
  stepsTitle: string;
  steps: string[];
  referralsTitle: string;
  referralsEmptyTitle: string;
  referralsEmptyDescription: string;
  referrals: MobileReferralRecord[];
};

export type ReferralSubmission = {
  successLabel: string;
  /** The row just created — prepended to «إحالاتي» so the list shows it without a refetch. */
  lastReferral: MobileReferralRecord;
};

export type SubscriptionStatusTone = 'positive' | 'warning' | 'danger';
export type SubscriptionDetailRow = { label: string; value: string };

export type SubscriptionScreen = {
  screenTitle: string;
  backLabel: string;
  empty: { title: string; description: string; actionLabel: string } | null;
  subscription: {
    status: string;
    statusLabel: string;
    statusTone: SubscriptionStatusTone;
    daysRemainingLabel: string | null;
    planPayment: { title: string; rows: SubscriptionDetailRow[] } | null;
    usage: { title: string; remainingLabel: string; valueLabel: string; remainingPercent: number; note: string } | null;
    period: { title: string; rows: SubscriptionDetailRow[] } | null;
  } | null;
};

/**
 * The login copy is read before any token exists, so it cannot go through
 * `mobileRequest`, which always sends an Authorization header.
 * TODO(lead): promote this into `mobile-api.ts` as `publicMobileRequest`.
 */
async function publicRequest<T>(path: string, fallbackMessage: string): Promise<T> {
  const configuredBaseUrl = Constants.expoConfig?.extra?.mobileApiBaseUrl;
  if (typeof configuredBaseUrl !== 'string' || configuredBaseUrl.length === 0) throw new Error(fallbackMessage);
  let response: Response;
  try {
    response = await fetch(`${configuredBaseUrl}${path}`);
  } catch (reason) {
    throw new MobileOfflineError(reason instanceof Error ? reason.message : fallbackMessage);
  }
  let payload: { data?: T; error?: { message?: string } };
  try {
    payload = await response.json() as { data?: T; error?: { message?: string } };
  } catch {
    throw new Error(fallbackMessage);
  }
  if (!response.ok || payload.data === undefined) throw new Error(payload.error?.message ?? fallbackMessage);
  return payload.data;
}

export async function getLoginScreenCopy(): Promise<LoginScreenCopy> {
  return publicRequest<LoginScreenCopy>('/auth/screen', networkCopy.loadFailed);
}

export async function getReferralScreen(accessToken: string): Promise<ReferralScreen> {
  return mobileRequest<ReferralScreen>('/referral', accessToken, networkCopy.loadFailed);
}

export async function submitReferral(accessToken: string, input: { candidateName: string; phone: string; candidateNote: string; consent: boolean }): Promise<ReferralSubmission> {
  return mobileRequest<ReferralSubmission>('/referral', accessToken, networkCopy.loadFailed, { method: 'POST', body: input });
}

export async function getSubscriptionScreen(accessToken: string): Promise<SubscriptionScreen> {
  return mobileRequest<SubscriptionScreen>('/subscription', accessToken, networkCopy.loadFailed);
}
