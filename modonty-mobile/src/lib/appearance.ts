import * as SecureStore from 'expo-secure-store';
import { useSyncExternalStore } from 'react';
import { Appearance } from 'react-native';

/**
 * مظهر التطبيق (Screens B · 11 «الإعدادات»): فاتح · داكن · تلقائي (يتبع الجوال).
 * يُطبَّق بـ`Appearance.setColorScheme` الرسمي — فكل `useColorScheme` في التطبيق (والثيم) يقرؤه بلا تمرير.
 * `null` = تلقائي (`'unspecified'` في الطبقة الأصلية، RN 0.81 `Appearance.js:101`).
 */
export type AppearancePref = 'light' | 'dark' | 'auto';

const KEY = 'modonty.appearance';
let pref: AppearancePref = 'auto';
const listeners = new Set<() => void>();

function apply(p: AppearancePref) {
  Appearance.setColorScheme(p === 'auto' ? null : p);
}

/** يُستدعى مرّة عند الإقلاع (قبل إخفاء شاشة البداية) كي لا يومض الثيم الخطأ. */
export async function loadAppearance(): Promise<void> {
  try {
    const v = await SecureStore.getItemAsync(KEY);
    if (v === 'light' || v === 'dark') {
      pref = v;
      apply(v);
      listeners.forEach((l) => l());
    }
  } catch (error) {
    console.warn('[appearance] load', error);
  }
}

export function setAppearance(p: AppearancePref) {
  pref = p;
  apply(p);
  listeners.forEach((l) => l());
  SecureStore.setItemAsync(KEY, p).catch((error: unknown) => console.warn('[appearance] save', error));
}

export function useAppearancePref(): AppearancePref {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => pref,
  );
}
