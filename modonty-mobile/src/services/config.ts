import Constants from 'expo-constants';

/**
 * عناوين الخادم من متغيّرات البيئة وحدها (ENGINEERING-RULES §٤). لا قيمة احتياطية: الغياب
 * يُرجع `null` فتعرض الواجهة حالة «الإعداد ناقص» بدل الاتصال بعنوان لم يختره أحد.
 */
function clean(value: string | undefined): string | null {
  const trimmed = value?.trim().replace(/\/+$/, '');
  return trimmed ? trimmed : null;
}

export const config = {
  apiUrl: clean(process.env.EXPO_PUBLIC_API_URL),
  webUrl: clean(process.env.EXPO_PUBLIC_WEB_URL),
  googleWebClientId: clean(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID),
  googleIosClientId: clean(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID),
  easProjectId: clean(process.env.EXPO_PUBLIC_EAS_PROJECT_ID),
  appVersion: Constants.expoConfig?.version ?? null,
} as const;

/** رابط صفحة على موقع مدونتي — `null` إن لم يُضبط `EXPO_PUBLIC_WEB_URL`. */
export function webLink(path: string): string | null {
  return config.webUrl ? `${config.webUrl}${path.startsWith('/') ? path : `/${path}`}` : null;
}
