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
