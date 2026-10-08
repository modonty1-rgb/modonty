import type { Tabs } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { memo, useEffect, type ComponentProps, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ModontyIconName } from '@/components/brand/ModontyIcon';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { useAuth } from '@/providers/AuthProvider';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, radius, space } from '@/theme/tokens';

const TABS: Record<string, { label: string; icon: ModontyIconName }> = {
  index: { label: 'الرئيسية', icon: 'home' },
  discover: { label: 'استكشف', icon: 'categories' },
  reels: { label: 'الطلّات', icon: 'reels' },
  search: { label: 'بحث', icon: 'search' },
  account: { label: 'حسابي', icon: 'profile' },
};

type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const INDICATOR = { width: 56, height: 32 } as const;
const BADGE = 18;

/**
 * التبويب السفلي: ٦٤dp + insets.bottom (UIUX §٥)، الرئيسية أوّلاً في RTL، والوجهة النشطة بمؤشّر
 * مرئي لا باللون وحده (BRANDING). أيقونات ModontyIcon — لذلك شريط مرسوم لا التابات الأصلية
 * (NativeTabs تقبل رموز النظام أو صوراً نقطية فقط، والماركة SVG).
 */
export const TabBar = memo(function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { unreadNotifications } = useAuth();
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom, backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const focused = state.index === index;
        const badge = route.name === 'account' && unreadNotifications > 0;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            Haptics.selectionAsync().catch(() => undefined);
            navigation.navigate(route.name, route.params);
          }
        };
        return (
          <Tap
            key={route.key}
            label={badge ? `${tab.label} — إشعارات غير مقروءة` : tab.label}
            role="tab"
            accessibilityState={{ selected: focused }}
            onPress={onPress}
            style={styles.tab}
          >
            <TabIndicator focused={focused} fill={colors.primaryContainer}>
              <Icon name={tab.icon} tone={focused ? 'onPrimaryContainer' : 'muted'} />
              {badge ? <View style={[styles.badge, { backgroundColor: colors.danger, borderColor: colors.surface }]} /> : null}
            </TabIndicator>
            <AppText variant="tabLabel" fixedSize tone={focused ? 'text' : 'muted'}>
              {tab.label}
            </AppText>
          </Tap>
        );
      })}
    </View>
  );
});

/** المؤشّر يكبر بنابض حين يصير التبويب نشطاً (Reanimated — خيط الواجهة، بلا إعادة رسم React). */
function TabIndicator({ focused, fill, children }: { focused: boolean; fill: string; children: ReactNode }) {
  const on = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    on.value = withSpring(focused ? 1 : 0, { damping: 16, stiffness: 220 });
  }, [focused, on]);
  const pill = useAnimatedStyle(() => ({ opacity: on.value, transform: [{ scaleX: 0.6 + on.value * 0.4 }] }));
  const icon = useAnimatedStyle(() => ({ transform: [{ scale: 1 + on.value * 0.08 }] }));
  return (
    <View style={styles.indicator}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: fill, borderRadius: radius.pill }, pill]} />
      <Animated.View style={icon}>{children}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth },
  tab: { flex: 1, height: control.footer, alignItems: 'center', justifyContent: 'center', gap: space.xxs },
  indicator: {
    width: INDICATOR.width,
    height: INDICATOR.height,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: { position: 'absolute', top: 2, end: 12, width: BADGE / 2, height: BADGE / 2, borderRadius: radius.pill, borderWidth: 1 },
});
