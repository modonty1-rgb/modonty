import * as SecureStore from 'expo-secure-store';
import { useSyncExternalStore } from 'react';

/**
 * عمليات البحث الحديثة — على الجهاز فقط (٨ بحد أقصى، الأحدث أوّلاً). تُحفظ حين يفتح القارئ نتيجة،
 * لا مع كل حرف، فلا تمتلئ بأنصاف الكلمات.
 */
const KEY = 'modonty.recentSearches';
const MAX = 8;
let items: string[] = [];
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  SecureStore.setItemAsync(KEY, JSON.stringify(items)).catch((error: unknown) => console.warn('[recent-searches] save', error));
}

function load() {
  if (loaded) return;
  loaded = true;
  SecureStore.getItemAsync(KEY)
    .then((raw) => {
      const v = raw ? (JSON.parse(raw) as unknown) : null;
      if (Array.isArray(v)) {
        items = v.filter((x): x is string => typeof x === 'string').slice(0, MAX);
        emit();
      }
    })
    .catch((error: unknown) => console.warn('[recent-searches] load', error));
}

export function rememberSearch(q: string) {
  const t = q.trim();
  if (t.length < 2) return;
  items = [t, ...items.filter((x) => x !== t)].slice(0, MAX);
  emit();
  persist();
}

export function forgetSearch(q: string) {
  items = items.filter((x) => x !== q);
  emit();
  persist();
}

export function clearSearches() {
  items = [];
  emit();
  persist();
}

export function useRecentSearches(): string[] {
  return useSyncExternalStore(
    (l) => {
      load();
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => items,
  );
}
