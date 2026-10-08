import * as AppleAuthentication from 'expo-apple-authentication';
import { digestStringAsync, CryptoDigestAlgorithm, randomUUID } from 'expo-crypto';
import { Platform } from 'react-native';

import type { SocialAuthData } from './api-types-account';
import { config } from './config';
import { getDeviceId } from './device-id';
import { ApiError } from './errors';
import { request } from './http';

/** نتيجة إلغاء المستخدم — ليست خطأ يُعرض. */
export const CANCELLED = 'cancelled' as const;

/**
 * A3 — Google: idToken أصلي من `@react-native-google-signin/google-signin` يتحقّق منه الخادم
 * (`verifyIdToken` بجمهور GOOGLE_CLIENT_ID). المكتبة تحتاج بناءً أصلياً (لا Expo Go)، فتُحمَّل عند الضغط
 * لا عند فتح الشاشة، وغيابها رسالة واضحة.
 */
export async function signInWithGoogle(): Promise<SocialAuthData | typeof CANCELLED> {
  if (!config.googleWebClientId) throw new ApiError('config', 'دخول Google غير مضبوط في هذا البناء (EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID).');
  let mod: typeof import('@react-native-google-signin/google-signin');
  try {
    mod = await import('@react-native-google-signin/google-signin');
  } catch (error) {
    console.warn('[google] native module missing', error);
    throw new ApiError('config', 'دخول Google يحتاج نسخة التطبيق المبنية (لا يعمل داخل Expo Go).');
  }
  const { GoogleSignin, isSuccessResponse } = mod;
  GoogleSignin.configure({ webClientId: config.googleWebClientId, iosClientId: config.googleIosClientId ?? undefined });
  if (Platform.OS === 'android') await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();
  if (!isSuccessResponse(result)) return CANCELLED;
  const idToken = result.data.idToken;
  if (!idToken) throw new ApiError('http', 'لم يرجع Google رمز الهوية. حاول مرة ثانية.');
  return request<SocialAuthData>('/auth/google', { method: 'POST', device: true, body: { idToken, deviceId: await getDeviceId() } });
}

export async function appleAvailable(): Promise<boolean> {
  return Platform.OS === 'ios' && (await AppleAuthentication.isAvailableAsync());
}

/** A4 — Apple (إلزامي على iOS حين يُعرض Google): identityToken + nonce يتحقّق منهما الخادم بمفاتيح أبل. */
export async function signInWithApple(): Promise<SocialAuthData | typeof CANCELLED> {
  const rawNonce = randomUUID();
  const hashed = await digestStringAsync(CryptoDigestAlgorithm.SHA256, rawNonce);
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
      nonce: hashed,
    });
    if (!credential.identityToken) throw new ApiError('http', 'لم ترجع Apple رمز الهوية. حاول مرة ثانية.');
    return request<SocialAuthData>('/auth/apple', {
      method: 'POST',
      device: true,
      body: {
        identityToken: credential.identityToken,
        nonce: hashed,
        // الاسم يصل من Apple في أوّل دخول فقط — يُرسل فوراً ليُحفظ.
        fullName: credential.fullName ? { givenName: credential.fullName.givenName ?? undefined, familyName: credential.fullName.familyName ?? undefined } : undefined,
        deviceId: await getDeviceId(),
      },
    });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'ERR_REQUEST_CANCELED') return CANCELLED;
    throw error;
  }
}
