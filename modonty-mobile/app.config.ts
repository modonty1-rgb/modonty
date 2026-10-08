import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * يكمّل `app.json` بما يأتي من البيئة فقط — لا قيمة مكتوبة:
 * - `EXPO_PUBLIC_EAS_PROJECT_ID` → `extra.eas.projectId` (توكن الدفع يحتاجه).
 * - `GOOGLE_IOS_URL_SCHEME` → إضافة Google Sign-In (المعرّف المعكوس لعميل iOS — شرط الإضافة على iOS).
 *   بلا القيمة لا تُضاف الإضافة، ويبقى زرّ Google يعرض سبب تعذّره بدل أن يفشل البناء.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const iosUrlScheme = process.env.GOOGLE_IOS_URL_SCHEME?.trim();
  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim();
  return {
    ...(config as ExpoConfig),
    plugins: [
      ...(config.plugins ?? []),
      ...(iosUrlScheme ? [['@react-native-google-signin/google-signin', { iosUrlScheme }] as [string, unknown]] : []),
    ],
    extra: { ...config.extra, ...(projectId ? { eas: { projectId } } : {}) },
  };
};
