import type { Tabs } from 'expo-router';
import { memo, type ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
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
  reels: { label: 'ريلز', icon: 'reels' },
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
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
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
            <View style={[styles.indicator, focused && { backgroundColor: colors.primaryContainer }]}>
              <Icon name={tab.icon} tone={focused ? 'onPrimaryContainer' : 'muted'} />
              {badge ? <View style={[styles.badge, { backgroundColor: colors.danger, borderColor: colors.surface }]} /> : null}
            </View>
            <AppText variant="tabLabel" fixedSize tone={focused ? 'text' : 'muted'}>
              {tab.label}
            </AppText>
          </Tap>
        );
      })}
    </View>
  );
});

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
