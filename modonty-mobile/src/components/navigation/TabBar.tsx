import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import type { Tabs } from 'expo-router';
import { memo, useEffect, type ComponentProps } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ModontyMark } from '@/components/brand/ModontyMark';
import type { ModontyIconName } from '@/components/brand/ModontyIcon';
import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { useAppTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

/** صورة مودو نفسها التي يرسمها الموقع (`shared/lib/brand-assets.ts` — BRAND_CHARACTER_URL). */
const MODO_URL = 'https://modonty-asset.b-cdn.net/brand/modonty-avatar.webp';

type Glyph = { kind: 'mark' } | { kind: 'modo' } | { kind: 'icon'; name: ModontyIconName };

/** نفس التابات وترتيبها في شريط الموقع على الجوال (`OrbitQuickLinks.tsx` — ORBIT_LINKS). */
const ORBIT: { route: string; label: string; glyph: Glyph }[] = [
  { route: 'modonty', label: 'مدونتي', glyph: { kind: 'mark' } },
  { route: 'articles-tab', label: 'المقالات', glyph: { kind: 'icon', name: 'articles' } },
  { route: 'industries-tab', label: 'المجالات', glyph: { kind: 'icon', name: 'industries' } },
  { route: 'reels', label: 'الطلّات', glyph: { kind: 'icon', name: 'reels' } },
  { route: 'partners-tab', label: 'الشركاء', glyph: { kind: 'icon', name: 'partner' } },
  { route: 'audio-tab', label: 'اسمع', glyph: { kind: 'icon', name: 'audio' } },
  { route: 'modo', label: 'مودو', glyph: { kind: 'modo' } },
];

const ACTIVE = 56;
const IDLE = 48;
const BAR = 68;
/** فسحة إضافية حول النشط من الجهتين — نفس ACTIVE_CLEARANCE في الموقع. */
const CLEARANCE = 12;
const DURATION = 300;
/** نابض ناعم: يصل بارتداد خفيف لا يُلحظ إلا كإحساس بالوزن — لا قفز (خالد: «جنتل وأنيق»). */
const SPRING = { damping: 18, stiffness: 170, mass: 0.9 };

/** كم خانةً يبعد عن النشط في الحلقة — نفس `modonty/lib/nav/get-orbit-steps.ts`. */
function orbitSteps(index: number, active: number, count: number): number {
  const distance = (index - active + count) % count;
  return distance > count / 2 ? distance - count : distance;
}

type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

/**
 * الشريط السفلي = شريط الموقع على الجوال: النشط ثابت في المنتصف بدائرة زرقاء عليها اسمه، والباقي يدور
 * حوله في حلقة (٣٠٠ms هادئة). ما يقفز من طرف لطرف يختفي ويظهر بدل أن يعبر الشريط — كما في الموقع.
 * الشاشات خارج الحلقة (الرئيسية «/» · البحث · حسابي · استكشف) تُبقي «مدونتي» في المنتصف — مثل `getNavSectionPath`،
 * والضغط عليها يفتح صفحة مدونتي `/modonty` كما في الموقع (مقيس على متصفّح الجوال ٩ أكتوبر).
 */
export const TabBar = memo(function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colors } = useAppTheme();
  const current = state.routes[state.index]?.name;
  const active = Math.max(0, ORBIT.findIndex((o) => o.route === current));
  // ٣ خانات في كل جهة يجب أن تبقى داخل الشاشة مع هامش ٨.
  const gap = Math.min(54, (width / 2 - IDLE / 2 - CLEARANCE - 8) / 3);

  return (
    <View style={[styles.bar, { height: BAR + insets.bottom, paddingBottom: insets.bottom, backgroundColor: colors.page, borderTopColor: colors.border }]}>
      {ORBIT.map((item, index) => {
        const route = state.routes.find((r) => r.name === item.route);
        if (!route) return null;
        const focused = index === active;
        const steps = orbitSteps(index, active, ORBIT.length);
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!(focused && current === item.route) && !event.defaultPrevented) {
            Haptics.selectionAsync().catch(() => undefined);
            navigation.navigate(route.name, route.params);
          }
        };
        return (
          <OrbitItem key={item.route} offset={steps * gap + Math.sign(steps) * CLEARANCE} jump={gap * 2.5} focused={focused} onPress={onPress} item={item} />
        );
      })}
    </View>
  );
});

function OrbitItem({
  item,
  offset,
  jump,
  focused,
  onPress,
}: {
  item: (typeof ORBIT)[number];
  offset: number;
  jump: number;
  focused: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  const x = useSharedValue(offset);
  const opacity = useSharedValue(focused ? 1 : 0.78);
  const on = useSharedValue(focused ? 1 : 0);
  const pop = useSharedValue(1);
  const ripple = useSharedValue(0);

  useEffect(() => {
    const rest = focused ? 1 : 0.78;
    const ease = { duration: DURATION, easing: Easing.out(Easing.quad) };
    on.value = withSpring(focused ? 1 : 0, SPRING);
    if (focused) {
      // لحظة الوصول: العلامة تنبض مرّة، وموجة ضوء واحدة تتّسع من الدائرة وتذوب.
      pop.value = withSequence(withTiming(0.82, { duration: 90 }), withSpring(1, { damping: 10, stiffness: 220 }));
      ripple.value = 0;
      ripple.value = withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) });
    }
    if (Math.abs(offset - x.value) > jump) {
      // يلتفّ من طرف الحلقة للطرف الآخر: يختفي، يُنقل، ثم يظهر — لا يعبر فوق الباقين.
      opacity.value = withTiming(0, { duration: 120 }, (done) => {
        if (!done) return;
        x.value = offset;
        opacity.value = withTiming(rest, { duration: 180 });
      });
    } else {
      x.value = withSpring(offset, SPRING);
      opacity.value = withTiming(rest, ease);
    }
  }, [offset, focused, jump, x, opacity, on, pop, ripple]);

  const move = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateX: x.value }] }));
  const circle = useAnimatedStyle(() => {
    const d = IDLE + (ACTIVE - IDLE) * on.value;
    return { width: d, height: d, borderRadius: d / 2, transform: [{ scale: 0.92 + 0.08 * on.value }] };
  });

  const glyph = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const wave = useAnimatedStyle(() => ({ opacity: 0.45 * (1 - ripple.value), transform: [{ scale: 1 + 0.55 * ripple.value }] }));

  return (
    <Animated.View style={[styles.slot, move]} pointerEvents="box-none">
      {focused ? <Animated.View pointerEvents="none" style={[styles.wave, { borderColor: colors.primary }, wave]} /> : null}
      <Tap label={item.label} role="tab" accessibilityState={{ selected: focused }} onPress={onPress} style={styles.hit}>
        <Animated.View
          style={[
            styles.circle,
            circle,
            focused
              ? [styles.glow, { backgroundColor: colors.primary, borderColor: colors.primary, shadowColor: colors.primary }]
              : { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Animated.View style={glyph}>
            <Glyph glyph={item.glyph} focused={focused} />
          </Animated.View>
          {focused ? (
            <Animated.Text entering={FadeInDown.duration(220).delay(80)} maxFontSizeMultiplier={1} style={[styles.label, { color: colors.onPrimary }]} numberOfLines={1}>
              {item.label}
            </Animated.Text>
          ) : null}
        </Animated.View>
      </Tap>
    </Animated.View>
  );
}

function Glyph({ glyph, focused }: { glyph: Glyph; focused: boolean }) {
  const { colors } = useAppTheme();
  // مثل الموقع: النشط علامته أصغر ليتّسع اسمه تحتها (size-7)، والساكن علامته أكبر (size-8).
  const size = focused ? 24 : 28;
  if (glyph.kind === 'mark') {
    const ink = focused ? colors.onPrimary : colors.text;
    return <ModontyMark size={size} color={ink} accent={focused ? ink : colors.accent} />;
  }
  if (glyph.kind === 'modo') {
    return <Image source={MODO_URL} style={[styles.modo, { width: size + 4, height: size + 4 }]} contentFit="cover" cachePolicy="disk" />;
  }
  return <Icon name={glyph.name} size={size} tone={focused ? 'onPrimary' : 'text'} monochrome={focused} />;
}

const styles = StyleSheet.create({
  bar: { borderTopWidth: StyleSheet.hairlineWidth },
  slot: { position: 'absolute', top: 0, start: 0, end: 0, height: BAR, alignItems: 'center', justifyContent: 'center' },
  hit: { width: ACTIVE + 8, height: BAR, alignItems: 'center', justifyContent: 'center' },
  circle: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  glow: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 8, elevation: 6 },
  label: { fontFamily: fonts.bold, fontSize: 11, lineHeight: 13, marginTop: 2 },
  modo: { borderRadius: 999 },
  wave: { position: 'absolute', width: ACTIVE, height: ACTIVE, borderRadius: ACTIVE / 2, borderWidth: 2 },
});
