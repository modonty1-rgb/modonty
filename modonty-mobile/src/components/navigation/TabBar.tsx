import * as Haptics from 'expo-haptics';
import type { Tabs } from 'expo-router';
import { memo, useEffect, type ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ModontyMark } from '@/components/brand/ModontyMark';
import type { ModontyIconName } from '@/components/brand/ModontyIcon';
import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds, dsMotion, dsType } from '@/theme/tokens';
import { useNavCollapsed, useNavExpand } from './NavScroll';

/**
 * الشريط السفلي — نظام التصميم ١٫٠ (Components · «كبسولة التبويب + الجزيرة»):
 * كبسولة بأربع تابات (الرئيسية · المقالات · الطلّات · اكتشف) والنشط حبّة ملوّنة بأيقونة واسم، والباقي أيقونات.
 * بجانبها جزيرة دائرية بشعار مدونتي = صفحة «مدونتي». مودو زرّ في الرأس، والاستماع داخل المقال — لا تابات لهما.
 * مقاسات: ارتفاع ٥٦ · بُعد ١٢ عن الأسفل والجانبين (+ safe area) · ٨ بين الكبسولة والجزيرة (Tokens §٠٩).
 * من تكبير خطّ ١٫٣: أيقونات فقط والاسم لقارئ الشاشة (قاعدة المنصّتين). تقليل الحركة: تبديل فوري بلا نابض.
 * عائم فوق المحتوى (القوائم تترك له `ds.layout.contentBottomInset`). نزول التمرير > ٢٤dp يطويه للتبويب النشط والجزيرة،
 * والصعود يفتحه (NavScroll). مخفيّ في مودو والبحث: شاشتا كتابة، والكيبورد يحتاج المساحة.
 */
const TABS: { route: string; label: string; icon: ModontyIconName }[] = [
  { route: 'index', label: 'الرئيسية', icon: 'home' },
  { route: 'articles-tab', label: 'المقالات', icon: 'articles' },
  { route: 'reels', label: 'الطلّات', icon: 'reels' },
  { route: 'industries-tab', label: 'المجالات', icon: 'industries' },
];
const ISLAND_ROUTE = 'modonty';
/** التبويب النشط بعلامة Filled (ICON-STANDARD-v2 §6 · Apple: tab bars prefer filled · Android: Filled للمحدَّد). */
const FILLED: Partial<Record<ModontyIconName, ModontyIconName>> = {
  home: 'homeFilled',
  articles: 'articlesFilled',
  reels: 'reelsFilled',
  // «اكتشف» بلا Filled: المجالات رجعت لشكلها المعتمد القديم ولا نسخة ممتلئة له (سعيد ٩ أكتوبر).
};
const HIDDEN_ON = new Set(['modo', 'search']);
const L = ds.layout;
/** ارتفاع التدرّج فوق الحافّة السفلية (بلا safe area) — Screens A: ١٧٢ على ٨٠٠ مع شريط ٢٤. */
const FADE = 148;

type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

export const TabBar = memo(function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, scheme } = useAppTheme();
  const current = state.routes[state.index]?.name;
  const onReels = current === 'reels';
  const onIsland = current === ISLAND_ROUTE;
  // الطيّ يُبقي التبويب النشط — في صفحة الجزيرة لا تبويب نشط، فلا طيّ (وإلا تختفي الكبسولة كلّها).
  const foldable = TABS.some((t) => t.route === current);
  // الاسم يظهر دائماً في الحبّة النشطة (خالد ١٠ أكتوبر: «المفروض كبسولة فيها اسم»). حجمه ثابت
  // (maxFontSizeMultiplier=1) ومحدود بعرض ٧٤ مع قطع — فلا داعي لإخفائه عند تكبير خطّ الجوال.
  const iconOnly = false;
  // الطلّات داكنة في الوضعين، فالكبسولة داكنة فوقها.
  const capsule = onReels ? '#28282E' : scheme === 'dark' ? colors.surfaceRaised : colors.surface;
  const ink: 'onReelsMuted' | 'muted' = onReels ? 'onReelsMuted' : 'muted';
  const expand = useNavExpand();
  useEffect(() => expand(), [current, expand]);

  const go = (name: string) => {
    const route = state.routes.find((r) => r.name === name);
    if (!route) return;
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (current !== name && !event.defaultPrevented) {
      Haptics.selectionAsync().catch(() => undefined);
      navigation.navigate(route.name, route.params);
    }
  };

  if (current && HIDDEN_ON.has(current)) return null;

  return (
    <View style={[styles.zone, { paddingBottom: insets.bottom + L.navInset }]} pointerEvents="box-none">
      {/* المحتوى يذوب تحت الكبسولة بدل أن ينقطع عندها (Screens A — تدرّج ١٧٢ إلى bg.page). لا تدرّج فوق الطلّات. */}
      {onReels ? null : (
        <LinearGradient
          pointerEvents="none"
          colors={[`${colors.page}00`, colors.page]}
          locations={[0, 0.26]}
          style={[styles.fade, { height: insets.bottom + FADE }]}
        />
      )}
      <View style={styles.row}>
        <View style={[styles.capsule, styles.shadow, { backgroundColor: capsule }]} accessibilityRole="tablist">
          {TABS.map((t) => (
            <TabItem key={t.route} tab={t} focused={current === t.route} foldable={foldable} iconOnly={iconOnly} ink={ink} onPress={() => go(t.route)} />
          ))}
        </View>
        <Tap
          label="مدونتي"
          role="tab"
          accessibilityState={{ selected: onIsland }}
          onPress={() => go(ISLAND_ROUTE)}
          // نشطة (على صفحة مدونتي): كحلي غامر بحلقة تركواز — Components 01 «جزيرة مدونتي».
          style={[
            styles.island,
            styles.shadow,
            onIsland ? { backgroundColor: colors.brandImmersive, borderColor: colors.accent } : { backgroundColor: capsule, borderColor: 'transparent' },
          ]}
        >
          {/* الكحلي على سطح داكن يختفي — الشعار أبيض في الداكن والطلّات والجزيرة النشطة */}
          <ModontyMark size={30} color={onReels || onIsland || scheme === 'dark' ? '#FFFFFF' : colors.navy} accent={colors.accent} />
        </Tap>
      </View>
    </View>
  );
});

function TabItem({
  tab,
  focused,
  foldable,
  iconOnly,
  ink,
  onPress,
}: {
  tab: (typeof TABS)[number];
  focused: boolean;
  foldable: boolean;
  iconOnly: boolean;
  ink: 'onReelsMuted' | 'muted';
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  const reduced = useReducedMotion();
  const open = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    open.value = reduced ? withTiming(focused ? 1 : 0, { duration: 0 }) : withSpring(focused ? 1 : 0, dsMotion.tabSpring);
  }, [focused, reduced, open]);
  // الاسم يتمدّد داخل الحبّة النشطة (لا يلتفّ أبداً — ellipsis عند الضيق).
  const labelStyle = useAnimatedStyle(() => ({ maxWidth: open.value * 74, opacity: open.value }));
  const pillStyle = useAnimatedStyle(() => ({ paddingHorizontal: 12 + open.value * 4 }));
  // الطيّ: غير النشط يضيق ويتلاشى. مع تقليل الحركة: تلاشٍ فقط بلا تغيير عرض (Tokens §١٠).
  const collapsed = useNavCollapsed();
  const foldStyle = useAnimatedStyle(() => {
    const c = focused || !foldable || !collapsed ? 0 : collapsed.value;
    // تقليل الحركة: العرض يقفز فوراً (بلا تحريك) والتلاشي وحده هو الحركة — لا كبسولة فارغة.
    return reduced ? { opacity: 1 - c, maxWidth: c > 0 ? 0 : 160 } : { opacity: 1 - c, maxWidth: interpolate(c, [0, 1], [160, 0]) };
  });

  return (
    <Animated.View style={[styles.fold, foldStyle]}>
    <Tap label={tab.label} role="tab" accessibilityState={{ selected: focused }} onPress={onPress} style={styles.hit}>
      <Animated.View style={[styles.pill, focused && { backgroundColor: colors.primary }, pillStyle]}>
        {focused ? (
          <Icon name={FILLED[tab.icon] ?? tab.icon} size={ds.icon.base} tone="onPrimary" knockout="primary" />
        ) : (
          <Icon name={tab.icon} size={ds.icon.base} tone={ink} />
        )}
        {!iconOnly && focused ? (
          <Animated.View style={[styles.labelBox, labelStyle]}>
            <Text numberOfLines={1} style={[styles.label, { color: colors.onPrimary }]} maxFontSizeMultiplier={1}>
              {tab.label}
            </Text>
          </Animated.View>
        ) : null}
      </Animated.View>
    </Tap>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  zone: { position: 'absolute', start: 0, end: 0, bottom: 0, paddingHorizontal: L.navInset },
  fade: { position: 'absolute', start: 0, end: 0, bottom: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: L.navGap },
  capsule: {
    height: L.navHeight,
    borderRadius: ds.radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  shadow: {
    shadowColor: '#0E065A',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: ds.elevation.floating,
  },
  fold: { overflow: 'hidden' },
  hit: { minHeight: ds.touch.min, minWidth: ds.touch.min, alignItems: 'center', justifyContent: 'center' },
  pill: { height: 44, borderRadius: ds.radius.full, flexDirection: 'row', alignItems: 'center', gap: 6 },
  labelBox: { overflow: 'hidden' },
  label: { ...dsType.label },
  island: {
    width: L.island,
    height: L.island,
    borderRadius: L.island / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginStart: 'auto',
  },
});
