import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError, toApiError } from '@/services/errors';

export type PageResult<T, C> = { items: T[]; next: C | null };

export type PagedList<T> = {
  status: 'loading' | 'error' | 'success';
  items: T[];
  error: ApiError | null;
  /** فشل تحميل صفحة لاحقة — يظهر تحت القائمة بزرّ إعادة، ولا يمسح ما سبق. */
  moreError: ApiError | null;
  loadingMore: boolean;
  hasMore: boolean;
  refreshing: boolean;
  loadMore: () => void;
  reload: () => void;
  refresh: () => Promise<void>;
  update: (fn: (items: T[]) => T[]) => void;
};

/**
 * قائمة بصفحات: offset (`page`) أو cursor — الدالّة تُرجع العناصر ومفتاح الصفحة التالية أو null.
 * طلب صفحة واحد في الطيران؛ تغيّر الفلاتر (deps) يبدأ من الأوّل ويلغي ما قبله.
 */
export function usePagedList<T, C>(
  fetchPage: (cursor: C | null, signal: AbortSignal) => Promise<PageResult<T, C>>,
  deps: readonly unknown[],
): PagedList<T> {
  const [items, setItems] = useState<T[]>([]);
  const [status, setStatus] = useState<PagedList<T>['status']>('loading');
  const [error, setError] = useState<ApiError | null>(null);
  const [moreError, setMoreError] = useState<ApiError | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const next = useRef<C | null>(null);
  const done = useRef(false);
  const inFlight = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;
  const [hasMore, setHasMore] = useState(false);

  const first = useCallback(async (mode: 'load' | 'refresh') => {
    controller.current?.abort();
    const ctrl = new AbortController();
    controller.current = ctrl;
    inFlight.current = true;
    if (mode === 'load') {
      setStatus('loading');
      setItems([]);
    } else setRefreshing(true);
    setError(null);
    setMoreError(null);
    try {
      const page = await fetchRef.current(null, ctrl.signal);
      if (ctrl.signal.aborted) return;
      setItems(page.items);
      next.current = page.next;
      done.current = page.next === null;
      setHasMore(page.next !== null);
      setStatus('success');
    } catch (e) {
      if (ctrl.signal.aborted) return;
      setError(toApiError(e));
      if (mode === 'load') setStatus('error');
    } finally {
      if (!ctrl.signal.aborted) {
        inFlight.current = false;
        setRefreshing(false);
      }
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (inFlight.current || done.current || next.current === null) return;
    const ctrl = controller.current ?? new AbortController();
    inFlight.current = true;
    setLoadingMore(true);
    setMoreError(null);
    try {
      const page = await fetchRef.current(next.current, ctrl.signal);
      if (ctrl.signal.aborted) return;
      setItems((prev) => [...prev, ...page.items]);
      next.current = page.next;
      done.current = page.next === null;
      setHasMore(page.next !== null);
    } catch (e) {
      if (!ctrl.signal.aborted) setMoreError(toApiError(e));
    } finally {
      inFlight.current = false;
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void first('load');
    return () => controller.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    status,
    items,
    error,
    moreError,
    loadingMore,
    hasMore,
    refreshing,
    loadMore: useCallback(() => void loadMore(), [loadMore]),
    reload: useCallback(() => void first('load'), [first]),
    refresh: useCallback(() => first('refresh'), [first]),
    update: useCallback((fn: (items: T[]) => T[]) => setItems(fn), []),
  };
}

/** صفحات offset كما يرجعها الخادم: `{ items, page, hasMore }`. */
export function offsetPage<T>(page: { items: T[]; page: number; hasMore: boolean }): PageResult<T, number> {
  return { items: page.items, next: page.hasMore ? page.page + 1 : null };
}
