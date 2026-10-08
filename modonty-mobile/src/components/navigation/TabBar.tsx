import * as Haptics from 'expo-haptics';
import type { Tabs } from 'expo-router';
import { memo, useEffect, type ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ModontyIconName } from '@/components/brand/ModontyIcon';
import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { useAuth } from '@/providers/AuthProvider';
import { useAppTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

const TABS: Record<string, { label: string; icon: ModontyIconName }> = {
  index: { label: 'مدونتي', icon: 'home' },
  discover: { label: 'استكشف', icon: 'categories' },
  reels: { label: 'الطلّات', icon: 'reels' },
  search: { label: 'بحث', icon: 'search' },
  account: { label: 'حسابي', icon: 'profile' },
};

const IDLE = 48;
const ACTIVE = 60;

type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

/**
 * الشريط السفلي بهويّة موقع مدونتي على الجوال (`OrbitQuickLinks` — جرد الجوّال ٣ أكتوبر):
 * دوائر بإطار رفيع، والوجهة النشطة دائرة زرقاء أكبر عليها اسمها. الانتقال هادئ (١٨٠ms) بلا ارتداد.
 */
export const TabBar = memo(function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { unreadNotifications } = useAuth();
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 8, backgroundColor: colors.page, borderTopColor: colors.border }]}>
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
            style={styles.slot}
          >
            <OrbitButton focused={focused} icon={tab.icon} label={tab.label} badge={badge} />
          </Tap>
        );
      })}
    </View>
  );
});

function OrbitButton({ focused, icon, label, badge }: { focused: boolean; icon: ModontyIconName; label: string; badge: boolean }) {
  const { colors } = useAppTheme();
  const on = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    on.value = withTiming(focused ? 1 : 0, { duration: 180, easing: Easing.out(Easing.quad) });
  }, [focused, on]);
  const size = useAnimatedStyle(() => {
    const d = IDLE + (ACTIVE - IDLE) * on.value;
    return { width: d, height: d, borderRadius: d / 2 };
  });
  return (
    <Animated.View
      style={[
        styles.circle,
        size,
        focused
          ? { backgroundColor: colors.primary, borderColor: colors.primary }
          : { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Icon name={icon} size={focused ? 22 : 24} tone={focused ? 'onPrimary' : 'text'} monochrome={focused} />
      {focused ? (
        <Text style={[styles.label, { color: colors.onPrimary }]} numberOfLines={1}>
          {label}
        </Text>
      ) : null}
      {badge ? <View style={[styles.badge, { backgroundColor: colors.danger, borderColor: colors.surface }]} /> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  slot: { alignItems: 'center', justifyContent: 'center', minWidth: ACTIVE, height: ACTIVE },
  circle: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  label: { fontFamily: fonts.bold, fontSize: 10, lineHeight: 13, marginTop: 1 },
  badge: { position: 'absolute', top: 6, end: 8, width: 10, height: 10, borderRadius: 5, borderWidth: 1.5 },
});
