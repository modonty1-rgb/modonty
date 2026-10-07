import * as SecureStore from 'expo-secure-store';

import type { ReaderTokens } from './api-types';

/**
 * توكنا القارئ في `expo-secure-store` (لا AsyncStorage — API-INVENTORY §٥٫٢). الوصول ١٥ دقيقة،
 * والتجديد ٣٠ يوماً ويُدوَّر عند كل تجديد؛ لذا يُحفظ الزوج الجديد فوراً بعد كل `refresh`.
 */
const ACCESS_KEY = 'modonty.accessToken';
const REFRESH_KEY = 'modonty.refreshToken';
const EXPIRES_KEY = 'modonty.accessExpiresAt';

export type StoredSession = { accessToken: string; refreshToken: string; accessExpiresAt: number };

let current: StoredSession | null = null;
let loaded = false;
const listeners = new Set<(session: StoredSession | null) => void>();

function emit() {
  for (const listener of listeners) listener(current);
}

export function subscribeSession(listener: (session: StoredSession | null) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function loadSession(): Promise<StoredSession | null> {
  if (loaded) return current;
  const [accessToken, refreshToken, expires] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_KEY),
    SecureStore.getItemAsync(REFRESH_KEY),
    SecureStore.getItemAsync(EXPIRES_KEY),
  ]);
  current = accessToken && refreshToken ? { accessToken, refreshToken, accessExpiresAt: Number(expires) || 0 } : null;
  loaded = true;
  emit();
  return current;
}

export function peekSession(): StoredSession | null {
  return current;
}

export async function saveTokens(tokens: ReaderTokens): Promise<void> {
  const next: StoredSession = {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accessExpiresAt: Date.now() + tokens.expiresIn * 1000,
  };
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_KEY, next.accessToken),
    SecureStore.setItemAsync(REFRESH_KEY, next.refreshToken),
    SecureStore.setItemAsync(EXPIRES_KEY, String(next.accessExpiresAt)),
  ]);
  current = next;
  loaded = true;
  emit();
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY),
    SecureStore.deleteItemAsync(REFRESH_KEY),
    SecureStore.deleteItemAsync(EXPIRES_KEY),
  ]);
  current = null;
  loaded = true;
  emit();
}
