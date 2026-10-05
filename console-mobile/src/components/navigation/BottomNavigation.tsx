import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ModontyIcon, ModontyIconName } from '@/src/components/brand/icons/ModontyIcon';
import { haptic, useReduceMotion } from '@/src/components/ui/Nabd';
import { BottomTabRoute } from '@/src/routes/route-types';
import { arabicDigits } from '@/src/services/engagement-api';
import { control, fonts, motion, nabd, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type TabItem = { route: BottomTabRoute; label: string; icon: ModontyIconName };
const tabs: TabItem[] = [
  { route: 'home', label: 'الرئيسية', icon: 'home' },
  { route: 'articles', label: 'المقالات', icon: 'articles' },
  { route: 'videos', label: 'الطلّات', icon: 'reels' },
  { route: 'audience', label: 'الجمهور', icon: 'comment' },
  { route: 'notifications', label: 'التنبيهات', icon: 'notifications' },
];

/**
 * شريط «نبض» العائم — كبسولة على بُعد ١٤ من الحواف، ارتفاعها ٦٤، على سطح شبه معتم ٩٢٪
 * (بلا تمويه: تمويه أندرويد مستقرّ من SDK 55، ونحن على 54)، ومؤشّر كبسولي خلف أيقونة التاب
 * النشط ينزلق إليه بنبضة. المحتوى تحته يحجز `nabd.tabBarClearance + insets.bottom`.
 *
 * هو مكوّن التطبيق نفسه لا `tabBar` من React Navigation: التابات هنا حالةٌ في الجذر (`App.tsx`)
 * لا متصفّح تابات، فالاستبدال في مكانه أقلّ تغييراً وأصدق للبنية الموجودة.
 *
 * `accent` الخام يرسب ١٫٦٦:١ على الفاتح، فالتسمية النشطة بلون النصّ والمؤشّر `secondary`.
 */
export function BottomNavigation({ activeRoute, unreadCount, bottomInset, onSelect }: { activeRoute: AppRouteOrHome; unreadCount: number; bottomInset: number; onSelect: (route: BottomTabRoute) => void }) {
  const { theme } = useAppTheme();
  const reduced = useReduceMotion();
  const [barWidth, setBarWidth] = useState(0);
  const activeIndex = tabs.findIndex((tab) => tab.route === activeRoute);
  const itemWidth = barWidth > 0 ? (barWidth - nabd.tabBarPadding * 2) / tabs.length : 0;
  // `row-reverse`: التاب الأوّل في الطرف الأيمن، فموضعه من اليسار يُعدّ من آخر الصفّ.
  const indicatorLeft = (index: number) => nabd.tabBarPadding + (tabs.length - 1 - index) * itemWidth + (itemWidth - nabd.tabIndicatorWidth) / 2;
  const translateX = useRef(new Animated.Value(0)).current;
  const placed = useRef(false);

  useEffect(() => {
    if (itemWidth === 0 || activeIndex < 0) return;
    const to = indicatorLeft(activeIndex);
    if (!placed.current || reduced) { translateX.setValue(to); placed.current = true; return; }
    Animated.spring(translateX, { toValue: to, damping: motion.tabDamping, stiffness: motion.tabStiffness, mass: 1, useNativeDriver: true }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, itemWidth, reduced]);

  return <View
    onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
    style={[styles.bar, { bottom: nabd.tabBarInset + bottomInset, backgroundColor: theme.colors.tabBar, boxShadow: `inset 0 1px 0 ${theme.colors.edgeHighlight}, ${theme.colors.liftShadow}` }]}
  >
    {itemWidth > 0 && activeIndex >= 0 ? <Animated.View pointerEvents="none" style={[styles.indicator, { backgroundColor: theme.colors.secondary, transform: [{ translateX }] }]} /> : null}
    {tabs.map((tab) => {
      const active = activeRoute === tab.route;
      const hasBadge = tab.route === 'notifications' && unreadCount > 0;
      return <Pressable
        key={tab.route}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        accessibilityLabel={hasBadge ? `${tab.label} ${arabicDigits(unreadCount)}` : tab.label}
        onPress={() => { if (!active) haptic('selection'); onSelect(tab.route); }}
        style={({ pressed }) => [styles.item, pressed && styles.pressed]}
      >
        <View style={styles.iconSlot}>
          <ModontyIcon name={tab.icon} size={control.iconSize} primary={active ? theme.colors.onSecondary : theme.colors.muted} accent={theme.colors.accent} />
        </View>
        <Text maxFontSizeMultiplier={1} style={[styles.label, { color: active ? theme.colors.text : theme.colors.muted }]}>{tab.label}</Text>
        {hasBadge ? <View style={[styles.badge, { backgroundColor: theme.colors.brandFill }]}><Text maxFontSizeMultiplier={1} style={[styles.badgeText, { color: theme.colors.onBrandFill }]}>{arabicDigits(unreadCount)}</Text></View> : null}
      </Pressable>;
    })}
  </View>;
}

type AppRouteOrHome = BottomTabRoute | 'account';
const styles = StyleSheet.create({
  pressed: { opacity: 0.72 },
  bar: { position: 'absolute', left: nabd.tabBarInset, right: nabd.tabBarInset, height: nabd.tabBarHeight, borderRadius: nabd.pill, flexDirection: 'row-reverse', alignItems: 'center', padding: nabd.tabBarPadding },
  indicator: { position: 'absolute', left: 0, top: (nabd.tabBarHeight - nabd.tabIndicatorHeight - typography.lineHeightTabLabel - nabd.tabLabelGap) / 2, width: nabd.tabIndicatorWidth, height: nabd.tabIndicatorHeight, borderRadius: nabd.pill },
  item: { flex: 1, height: '100%', minHeight: control.minTouchTarget, alignItems: 'center', justifyContent: 'center', gap: nabd.tabLabelGap },
  iconSlot: { width: nabd.tabIndicatorWidth, height: nabd.tabIndicatorHeight, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.medium, fontSize: typography.tabLabel, lineHeight: typography.lineHeightTabLabel, writingDirection: 'rtl' },
  badge: { position: 'absolute', top: 0, left: '50%', marginLeft: -nabd.tabBadgeOffset, minWidth: nabd.tabBadgeSize, height: nabd.tabBadgeSize, borderRadius: nabd.pill, paddingHorizontal: spacing.xxs, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontFamily: fonts.bold, fontSize: typography.tabLabel, lineHeight: typography.lineHeightSecondary },
});
