import { createContext, useCallback, useContext, useMemo, useRef, type PropsWithChildren } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Easing, useReducedMotion, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ds, dsMotion } from '@/theme/tokens';

/**
 * طيّ الكبسولة مع التمرير (Components 01 · «مطويّ»): نزول > ٢٤dp يُبقي التبويب النشط وحده،
 * وصعود > ٢٤dp أو العودة للقمّة يفتحها. القيمة مشتركة لأن الكبسولة واحدة فوق كل التابات.
 */
type NavScrollValue = { collapsed: SharedValue<number>; setCollapsed: (on: boolean) => void };

const NavScrollContext = createContext<NavScrollValue | null>(null);

export function NavScrollProvider({ children }: PropsWithChildren) {
  const collapsed = useSharedValue(0);
  const reduced = useReducedMotion();
  // الهدف الأخير في متغيّر عادي: قراءة `collapsed.value` من خيط JS متزامنة مع خيط الواجهة، وهذا يُستدعى
  // مع كل حدث تمرير — قِيس على جوال A21s: خيط JS مشغول ٧٫٥ ث من ١٤ أثناء التمرير (١٠ أكتوبر).
  const target = useRef(0);
  const setCollapsed = useCallback(
    (on: boolean) => {
      const to = on ? 1 : 0;
      if (target.current === to) return;
      target.current = to;
      collapsed.value = withTiming(to, {
        duration: reduced ? dsMotion.reducedFade : dsMotion.navCollapse.duration,
        easing: Easing.bezier(0.2, 0, 0, 1),
      });
    },
    [collapsed, reduced],
  );
  const value = useMemo(() => ({ collapsed, setCollapsed }), [collapsed, setCollapsed]);
  return <NavScrollContext.Provider value={value}>{children}</NavScrollContext.Provider>;
}

export function useNavCollapsed() {
  return useContext(NavScrollContext)?.collapsed;
}

/** يُمرَّر لـonScroll في أي قائمة داخل تبويب. خارج التابات لا يفعل شيئاً. */
export function useNavScrollHandler() {
  const ctx = useContext(NavScrollContext);
  const last = useRef(0);
  const anchor = useRef(0);
  const down = useRef(true);
  return useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!ctx) return;
      const y = e.nativeEvent.contentOffset.y;
      if (y <= 0) {
        last.current = anchor.current = 0;
        down.current = true;
        ctx.setCollapsed(false);
        return;
      }
      const goingDown = y > last.current;
      last.current = y;
      // تغيّر الاتجاه: العتبة تُحسب من نقطة الانعطاف.
      if (goingDown !== down.current) {
        down.current = goingDown;
        anchor.current = y;
        return;
      }
      if (Math.abs(y - anchor.current) > dsMotion.navCollapse.threshold) ctx.setCollapsed(goingDown);
    },
    [ctx],
  );
}

/** عند تغيير التاب: الكبسولة تُفتح. */
export function useNavExpand() {
  const ctx = useContext(NavScrollContext);
  return useCallback(() => ctx?.setCollapsed(false), [ctx]);
}

/** ما تتركه أي شاشة تبويب أسفلها للكبسولة العائمة: ٨٨dp + safe area (Tokens §٠٩). */
export function useTabBottomInset() {
  return useSafeAreaInsets().bottom + ds.layout.contentBottomInset;
}
