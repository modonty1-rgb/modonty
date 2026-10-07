import { useCallback, useEffect, useRef } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

import { actionsApi } from '@/services/api';
import { miscApi } from '@/services/api-actions';
import { toApiError } from '@/services/errors';

/** نفس عتبتي الارتداد في الويب (`articles/[slug]/components/view-tracker/ViewTracker.tsx:8-9`). */
const BOUNCE_TIME_SEC = 30;
const BOUNCE_SCROLL_THRESHOLD = 10;

/**
 * E6 + E7: مشاهدة المقال عند الفتح (الخادم يمنع التكرار بمعرّف الجهاز)، ثم عند المغادرة
 * زمن القراءة وأقصى عمق تمرير والارتداد — على صفّ Analytics الذي أنشأته المشاهدة نفسها.
 */
export function useReadingAnalytics(slug: string) {
  const analyticsId = useRef<string | null>(null);
  const start = useRef(Date.now());
  const depth = useRef(0);

  useEffect(() => {
    start.current = Date.now();
    depth.current = 0;
    analyticsId.current = null;
    actionsApi
      .viewArticle(slug)
      .then((d) => {
        analyticsId.current = d.analyticsId;
      })
      .catch((error: unknown) => console.warn('[article] view', toApiError(error).message));
    return () => {
      const id = analyticsId.current;
      if (!id) return;
      const timeOnPage = (Date.now() - start.current) / 1000;
      const scrollDepth = Math.round(depth.current);
      miscApi
        .analytics(id, { timeOnPage, scrollDepth, bounced: timeOnPage < BOUNCE_TIME_SEC && scrollDepth < BOUNCE_SCROLL_THRESHOLD })
        .catch((error: unknown) => console.warn('[article] analytics', toApiError(error).message));
    };
  }, [slug]);

  return useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const scrollable = contentSize.height - layoutMeasurement.height;
    const pct = scrollable > 0 ? Math.min(100, (contentOffset.y / scrollable) * 100) : 100;
    if (pct > depth.current) depth.current = pct;
  }, []);
}
