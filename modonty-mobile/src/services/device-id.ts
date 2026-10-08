import { randomUUID } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

/**
 * `X-Device-Id` — يُولَّد مرّة ويُحفظ. يحلّ محلّ كوكي `modonty_view_sid` في منع تكرار المشاهدات
 * على الخادم (`modonty/lib/mobile-api/device.ts`: ٨–٦٤ حرفاً من [A-Za-z0-9-] — الـUUID يطابقه).
 */
const KEY = 'modonty.deviceId';
let cached: Promise<string> | null = null;

async function load(): Promise<string> {
  const existing = await SecureStore.getItemAsync(KEY);
  if (existing) return existing;
  const id = randomUUID();
  await SecureStore.setItemAsync(KEY, id);
  return id;
}

export function getDeviceId(): Promise<string> {
  if (!cached) {
    cached = load().catch((error: unknown) => {
      cached = null;
      throw error;
    });
  }
  return cached;
}
