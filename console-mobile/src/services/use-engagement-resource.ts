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

/** تحديثٌ فشل **وفوقه بيانات صالحة** — يُعرض سطراً صغيراً فوق المحتوى، لا شاشةً بدله. */
export type RefreshFailure = { message: string; offline: boolean };

const LOADING: Resource<never> = { status: 'loading', data: null, message: null };

/**
 * آخر بيانات صالحة لكل شاشة — **في الذاكرة فقط، ولما فتحه العميل بنفسه**.
 *
 * تبديل التاب يزيل الشاشة ويركّبها من جديد، فكانت كل عودة تبدأ بهيكل تحميل، وبلا شبكة
 * تعرض «ما في اتصال» مكان قائمة كانت أمام العميل قبل ثانية (بند التدقيق ١٦). الآن تُرسم
 * آخر نسخة فوراً ويُسأل الخادم بصمت. الذاكرة هنا بيانات لا شجرة مكوّنات — أخفّ بكثير من
 * إبقاء خمس شاشات بقوائمها وصورها مركّبة. وتُمسح عند الخروج كي لا يرى حساب بيانات حساب آخر.
 * (ENGINEERING-RULES §4.1 يمنع جلب ما لم يُفتح؛ هذا ما فُتح فعلاً ولا يُكتب على القرص.)
 */
const lastGood = new Map<unknown, unknown>();

export function clearResourceCache(): void {
  lastGood.clear();
}

export function useEngagementResource<T>(accessToken: string, load: (accessToken: string) => Promise<T>): { resource: Resource<T>; reload: () => void; refresh: () => void; isRefreshing: boolean; replace: (data: T) => void; refreshFailure: RefreshFailure | null } {
  const [resource, setResource] = useState<Resource<T>>(() => lastGood.has(load) ? { status: 'ready', data: lastGood.get(load) as T, message: null } : LOADING);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshFailure, setRefreshFailure] = useState<RefreshFailure | null>(null);
  const mounted = useRef(true);
  const requestId = useRef(0);
  const hasLoaded = useRef(lastGood.has(load));
  const hasData = useRef(lastGood.has(load));
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
    if (silent) setIsRefreshing(true); else { hasData.current = false; setResource(LOADING); setRefreshFailure(null); }
    load(accessToken).then((data) => {
      lastGood.set(load, data);
      if (!mounted.current || requestId.current !== id) return;
      hasData.current = true;
      setResource({ status: 'ready', data, message: null });
      setRefreshFailure(null);
    }).catch((reason: unknown) => {
      if (!mounted.current || requestId.current !== id) return;
      const message = reason instanceof Error ? reason.message : null;
      const offline = reason instanceof MobileOfflineError;
      /**
       * التحديث الصامت **لا يهدم شاشة تعمل**: لو سقط النداء والبيانات حاضرة تبقى كما هي،
       * ويظهر فوقها سطر صغير يقول ما حصل مع «إعادة المحاولة» — لا صمت ولا شاشة خطأ.
       */
      if (silent && hasData.current) {
        setRefreshFailure({ message: message ?? CONNECTION_COPY.errorTitle, offline });
        return;
      }
      setResource({ status: offline ? 'offline' : 'error', data: null, message });
    }).finally(() => { if (mounted.current) setIsRefreshing(false); });
  }, [accessToken, load]);

  const reload = useCallback(() => run(false), [run]);
  const refresh = useCallback(() => run(true), [run]);

  /**
   * إعادة الجلب عند العودة للشاشة — الخطّاف يخدم كل شاشات القوائم، فموضعه هنا لا في كلٍّ منها.
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
    lastGood.set(load, data);
    if (!mounted.current) return;
    hasData.current = true;
    setResource({ status: 'ready', data, message: null });
  }, [load]);

  return { resource, reload, refresh, isRefreshing, replace, refreshFailure };
}
