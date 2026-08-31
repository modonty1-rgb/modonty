import { useFocusEffect } from '@react-navigation/native';
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

export function useEngagementResource<T>(accessToken: string, load: (accessToken: string) => Promise<T>): { resource: Resource<T>; reload: () => void; refresh: () => void; isRefreshing: boolean; replace: (data: T) => void } {
  const [resource, setResource] = useState<Resource<T>>(LOADING);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mounted = useRef(true);
  const requestId = useRef(0);
  const hasLoaded = useRef(false);
  useEffect(() => () => { mounted.current = false; }, []);

  /**
   * `silent` يفرّق بين **جلبٍ أوّل** و**تحديثٍ لمحتوى قائم**.
   *
   * كانت كل إعادة جلب تمسح البيانات إلى `LOADING`، فالسحب للتحديث كان يقذف القارئ إلى
   * هيكل تحميل ويفقد موضعه في القائمة — عقوبةٌ على أنه طلب أحدث البيانات. والتحديث الصامت
   * يُبقي ما يقرأه ويستبدله حين يصل.
   */
  const run = useCallback((silent: boolean) => {
    const id = requestId.current + 1;
    requestId.current = id;
    if (silent) setIsRefreshing(true); else setResource(LOADING);
    load(accessToken).then((data) => {
      if (!mounted.current || requestId.current !== id) return;
      setResource({ status: 'ready', data, message: null });
    }).catch((reason: unknown) => {
      if (!mounted.current || requestId.current !== id) return;
      const message = reason instanceof Error ? reason.message : null;
      /**
       * التحديث الصامت **لا يهدم شاشة تعمل**: لو سقط النداء والبيانات حاضرة تبقى كما هي.
       * فالعميل الذي يسحب في نفق يخسر التحديث لا الشاشة.
       */
      setResource((current) => silent && current.data !== null ? current
        : { status: reason instanceof MobileOfflineError ? 'offline' : 'error', data: null, message });
    }).finally(() => { if (mounted.current) setIsRefreshing(false); });
  }, [accessToken, load]);

  const reload = useCallback(() => run(false), [run]);
  const refresh = useCallback(() => run(true), [run]);

  /**
   * إعادة الجلب عند العودة للشاشة — الخطّاف يخدم **٧ شاشات**، فموضعه هنا لا في كلٍّ منها.
   *
   * العميل يفتح سؤالاً ويردّ عليه ثم يرجع، فتبقى القائمة تقول إنّه بلا ردّ. وقد وقع هذا
   * فعلاً على الرئيسية («رد على طلبات التواصل ٠» وفيها طلبات) وأُصلح هناك وحدها.
   * والجلب الأوّل يبقى بهيكل تحميل، وما بعده صامت — فلا يومض المحتوى عند كل تنقّل.
   *
   * `useFocusEffect` مع `useCallback` إلزاميان معاً بنصّ توثيق React Navigation: بدونه
   * تُعاد الدالة كل رندر فيُشغَّل الأثر بلا نهاية.
   */
  useFocusEffect(useCallback(() => {
    if (hasLoaded.current) { run(true); return; }
    hasLoaded.current = true;
    run(false);
  }, [run]));

  const replace = useCallback((data: T) => {
    if (!mounted.current) return;
    setResource({ status: 'ready', data, message: null });
  }, []);

  return { resource, reload, refresh, isRefreshing, replace };
}
