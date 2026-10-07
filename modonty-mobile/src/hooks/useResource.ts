import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError, toApiError } from '@/services/errors';

export type Resource<T> = {
  status: 'loading' | 'error' | 'success';
  data: T | null;
  error: ApiError | null;
  refreshing: boolean;
  reload: () => void;
  refresh: () => Promise<void>;
  setData: (update: (current: T | null) => T | null) => void;
};

/**
 * قراءة واحدة لشاشة: تحميل → نجاح/خطأ، مع إلغاء الطلب عند مغادرة الشاشة وسحب للتحديث.
 * الخطأ لا يُبتلع: يصل الشاشة كما هو (ENGINEERING §٥).
 */
export function useResource<T>(fetcher: (signal: AbortSignal) => Promise<T>, deps: readonly unknown[]): Resource<T> {
  const [state, setState] = useState<{ status: Resource<T>['status']; data: T | null; error: ApiError | null }>({
    status: 'loading',
    data: null,
    error: null,
  });
  const [refreshing, setRefreshing] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(async (mode: 'load' | 'refresh') => {
    controller.current?.abort();
    const ctrl = new AbortController();
    controller.current = ctrl;
    if (mode === 'load') setState((s) => ({ ...s, status: 'loading', error: null }));
    else setRefreshing(true);
    try {
      const data = await fetcherRef.current(ctrl.signal);
      if (!ctrl.signal.aborted) setState({ status: 'success', data, error: null });
    } catch (error) {
      if (ctrl.signal.aborted) return;
      setState((s) => ({ status: s.data && mode === 'refresh' ? 'success' : 'error', data: s.data, error: toApiError(error) }));
    } finally {
      if (!ctrl.signal.aborted) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void run('load');
    return () => controller.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    ...state,
    refreshing,
    reload: useCallback(() => void run('load'), [run]),
    refresh: useCallback(() => run('refresh'), [run]),
    setData: useCallback((update) => setState((s) => ({ ...s, data: update(s.data) })), []),
  };
}
