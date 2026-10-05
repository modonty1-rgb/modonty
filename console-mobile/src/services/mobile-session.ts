import * as SecureStore from 'expo-secure-store';

const accessTokenKey = 'modonty.console.mobile.access-token';

export async function readMobileAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(accessTokenKey);
}

export async function saveMobileAccessToken(accessToken: string): Promise<void> {
  await SecureStore.setItemAsync(accessTokenKey, accessToken);
}

export async function clearMobileAccessToken(): Promise<void> {
  await SecureStore.deleteItemAsync(accessTokenKey);
}

/**
 * معرّف هذا الجهاز عند الخادم (`MobileDevice.id`) — يُحفظ عند تسجيل التنبيهات كي يُلغى به
 * التسجيل عند الخروج. بدونه يبقى الجهاز مسجَّلاً فتصل تنبيهات العميل إلى جوال خرج منه.
 */
const pushDeviceIdKey = 'modonty.console.mobile.push-device-id';

export async function readPushDeviceId(): Promise<string | null> {
  return SecureStore.getItemAsync(pushDeviceIdKey);
}

export async function savePushDeviceId(deviceId: string): Promise<void> {
  await SecureStore.setItemAsync(pushDeviceIdKey, deviceId);
}

export async function clearPushDeviceId(): Promise<void> {
  await SecureStore.deleteItemAsync(pushDeviceIdKey);
}

/** اختيار المظهر (داكن/فاتح) — يبقى بعد إغلاق التطبيق، فلا يعود للإعداد الافتراضي كل فتح. */
const themeModeKey = 'modonty.console.mobile.theme-mode';

export async function readThemeMode(): Promise<string | null> {
  return SecureStore.getItemAsync(themeModeKey);
}

export async function saveThemeMode(mode: string): Promise<void> {
  await SecureStore.setItemAsync(themeModeKey, mode);
}
