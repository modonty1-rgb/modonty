import type { FlashListRef } from '@shopify/flash-list';
import { useCallback, useEffect, useRef } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

type Header = { pinnedOffset: () => number; onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void };

/**
 * فلتر في صفّ مثبّت (رقاقات/تبويبات تحت الشريط المطوي): تغييره والصفّ ملتصق يُبقيه مكانه، والنتائج الجديدة
 * تبدأ تحته مباشرةً — لا قفز لأعلى الصفحة (سلوك Google Play وApp Store). مقيس ١٠ أكتوبر في دليل الشركاء.
 *
 * الاستعمال: `keep()` قبل تغيير الفلتر · `onScroll` و`listRef` للقائمة · `attach(top)` بعد `useTabHeader`
 * (الرأس يُنشأ بعد الصفّ المثبّت، فيُربط عبر مراجع).
 */
export function usePinnedFilters<T>(status: 'loading' | 'error' | 'success') {
  const listRef = useRef<FlashListRef<T>>(null);
  const y = useRef(0);
  const header = useRef<Header | null>(null);
  const repin = useRef<number | null>(null);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    y.current = e.nativeEvent.contentOffset.y;
    header.current?.onScroll(e);
  }, []);

  const keep = useCallback(() => {
    const pinned = header.current?.pinnedOffset() ?? 0;
    if (y.current <= pinned) return;
    repin.current = pinned;
    listRef.current?.scrollToOffset({ offset: pinned, animated: false });
  }, []);

  // تأكيد بعد وصول النتائج: ارتفاع الرأس قد يتغيّر مع الفلتر (صفّ يختفي)، فيُعاد التثبيت مرّة.
  useEffect(() => {
    if (status === 'loading' || repin.current == null) return;
    const offset = repin.current;
    repin.current = null;
    requestAnimationFrame(() => listRef.current?.scrollToOffset({ offset, animated: false }));
  }, [status]);

  const attach = (top: Header) => {
    header.current = top;
  };

  return { listRef, onScroll, keep, attach };
}
