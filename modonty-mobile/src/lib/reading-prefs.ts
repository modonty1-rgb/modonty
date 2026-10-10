import * as SecureStore from 'expo-secure-store';
import { useSyncExternalStore } from 'react';

/**
 * إعدادات القراءة (Screens A · 04ب): حجم خطّ المتن ١٦–٢٢ وخلفية المقال.
 * `tone: null` = يتبع ثيم التطبيق. تُحفظ على الجهاز وتسري على كل المقالات.
 */
export type ReadingTone = 'light' | 'sepia' | 'dark';
export type ReadingPrefs = { size: number; tone: ReadingTone | null };

export const READING_SIZE = { min: 16, max: 22, default: 18 } as const;

const KEY = 'modonty.readingPrefs';
let state: ReadingPrefs = { size: READING_SIZE.default, tone: null };
const listeners = new Set<() => void>();
let loaded = false;

function emit() {
  listeners.forEach((l) => l());
}

function load() {
  if (loaded) return;
  loaded = true;
  SecureStore.getItemAsync(KEY)
    .then((raw) => {
      if (!raw) return;
      const v = JSON.parse(raw) as Partial<ReadingPrefs>;
      const size = typeof v.size === 'number' ? Math.min(READING_SIZE.max, Math.max(READING_SIZE.min, Math.round(v.size))) : state.size;
      const tone = v.tone === 'light' || v.tone === 'sepia' || v.tone === 'dark' ? v.tone : null;
      state = { size, tone };
      emit();
    })
    .catch((error: unknown) => console.warn('[reading-prefs] load', error));
}

export function setReadingPrefs(patch: Partial<ReadingPrefs>) {
  state = { ...state, ...patch };
  emit();
  SecureStore.setItemAsync(KEY, JSON.stringify(state)).catch((error: unknown) => console.warn('[reading-prefs] save', error));
}

function subscribe(l: () => void) {
  load();
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useReadingPrefs(): ReadingPrefs {
  return useSyncExternalStore(subscribe, () => state);
}
