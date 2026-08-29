import { useCallback, useEffect, useRef, useState } from 'react';
import { MobileOfflineError } from '@/src/services/mobile-api';

/**
 * The four states every screen owes the user, in one place: skeleton · ready · error · offline.
 *
 * «ما في اتصال» is deliberately its own status and not an error message, because the fix the
 * user has to perform is different — one is «جرّب مرة ثانية», the other is «شغّل الإنترنت».
 * Nothing is swallowed: a request that fails always lands in `error` with its own message.
 */

/**
 * The ONE case the «صفر نصّ في الشاشة» rule cannot cover: the request never reached the
 * server, so the copy the screen would have rendered is precisely what is missing. It is app
 * chrome rather than content, so it is defined once here — beside the state machine that
 * raises it — instead of being retyped in every screen. It belongs in the shared UI kit; see
 * the promotion request in the hand-off notes.
 */
export const CONNECTION_COPY = {
  offlineTitle: 'ما في اتصال',
  offlineDescription: 'تأكد من الإنترنت وجرّب مرة ثانية.',
  errorTitle: 'ما قدرنا نحمّل هذي الشاشة',
  retryLabel: 'إعادة المحاولة',
  // تسمية زرّ الرجوع أثناء التحميل: تنقّلٌ لا محتوى، فلا ينتظر وصول العقد.
  backLabel: 'رجوع',
} as const;

export type ResourceStatus = 'loading' | 'ready' | 'error' | 'offline';

export type Resource<T> = { status: ResourceStatus; data: T | null; message: string | null };

const LOADING: Resource<never> = { status: 'loading', data: null, message: null };

export function useEngagementResource<T>(accessToken: string, load: (accessToken: string) => Promise<T>): { resource: Resource<T>; reload: () => void; replace: (data: T) => void } {
  const [resource, setResource] = useState<Resource<T>>(LOADING);
  const mounted = useRef(true);
  const requestId = useRef(0);
  useEffect(() => () => { mounted.current = false; }, []);

  const run = useCallback(() => {
    const id = requestId.current + 1;
    requestId.current = id;
    setResource(LOADING);
    load(accessToken).then((data) => {
      if (!mounted.current || requestId.current !== id) return;
      setResource({ status: 'ready', data, message: null });
    }).catch((reason: unknown) => {
      if (!mounted.current || requestId.current !== id) return;
      const message = reason instanceof Error ? reason.message : null;
      setResource({ status: reason instanceof MobileOfflineError ? 'offline' : 'error', data: null, message });
    });
  }, [accessToken, load]);

  useEffect(run, [run]);

  const replace = useCallback((data: T) => {
    if (!mounted.current) return;
    setResource({ status: 'ready', data, message: null });
  }, []);

  return { resource, reload: run, replace };
}
