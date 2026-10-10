import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedReaction, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ModontyIconName } from '@/components/brand/ModontyIcon';
import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds, dsMotion, dsType } from '@/theme/tokens';

/** ارتفاع صورة المقال (Screens A · 04). */
export const ARTICLE_HERO = 316;

type Action = { icon: ModontyIconName; label: string; onPress: () => void; text?: string };

/**
 * إطار صفحة المقال — Screens A · 04:
 * فوق الصورة: أزرار دائرية بيضاء Ø48 (رجوع · Aa · مشاركة) فوق ظلّ كحلي خفيف.
 * بعد الصورة: شريط مطوي ٥٦ (رجوع · العنوان + «باقي N د» · Aa · مشاركة) وخطّ تقدّم القراءة أسفله.
 * التبديل بين الحالتين على مسار الرسم (قيم مشتركة) — لا يُعاد رسم المقال مع التمرير.
 */
export function ArticleChrome({
  scrollY,
  progress,
  title,
  remaining,
  onBack,
  actions,
  heroHeight = ARTICLE_HERO,
}: {
  scrollY: SharedValue<number>;
  /** خطّ تقدّم القراءة تحت الشريط المطوي — يُحذف في الشاشات التي لا قراءة فيها (صفحة الشريك). */
  progress?: SharedValue<number>;
  title: string;
  remaining: string | null;
  onBack: () => void;
  actions: Action[];
  /** ارتفاع صورة الرأس: ٣١٦ للمقال، ٢٢٤ لصفحة الشريك (Screens B · 08). */
  heroHeight?: number;
}) {
  const insets = useSafeAreaInsets();
  const { colors, scheme } = useAppTheme();
  const reduced = useReducedMotion();
  const focused = useIsFocused();
  const v = useSharedValue(0);
  const [compact, setCompact] = useState(false);
  useAnimatedReaction(
    () => scrollY.value > heroHeight - insets.top - ds.layout.appbarCollapsed,
    (now, prev) => {
      if (now === prev) return;
      v.value = withTiming(now ? 1 : 0, { duration: reduced ? dsMotion.reducedFade : dsMotion.appbar.duration, easing: Easing.bezier(0.2, 0, 0, 1) });
      runOnJS(setCompact)(now);
    },
    [insets.top, reduced, heroHeight],
  );
  const barStyle = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ translateY: reduced ? 0 : (1 - v.value) * -dsMotion.appbar.translateY }] }));
  const floatStyle = useAnimatedStyle(() => ({ opacity: 1 - v.value }));
  const fill = useAnimatedStyle(() => ({ width: `${Math.min(1, Math.max(0, progress?.value ?? 0)) * 100}%` }));

  return (
    <>
      {/* أيقونات شريط الحالة بيضاء فوق الصورة وظلّها، وبلون الثيم مع الشريط المطوي. يُزال حين تغادر فيعود إعداد التطبيق. */}
      {focused ? <StatusBar style={compact ? (scheme === 'dark' ? 'light' : 'dark') : 'light'} /> : null}
      {/* فوق الصورة */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.floatLayer, floatStyle]} pointerEvents={compact ? 'none' : 'box-none'}>
        <LinearGradient pointerEvents="none" colors={['rgba(8,6,40,0.8)', 'rgba(8,6,40,0.5)', 'rgba(8,6,40,0)']} style={[styles.topShade, { height: insets.top + 104 }]} />
        <View style={[styles.floatRow, { top: insets.top + 12 }]} pointerEvents="box-none">
          <Circle icon="back" label="رجوع" onPress={onBack} />
          <View style={styles.row}>
            {actions.map((a) => (
              <Circle key={a.label} {...a} />
            ))}
          </View>
        </View>
      </Animated.View>

      {/* الشريط المطوي */}
      <Animated.View
        style={[styles.bar, { paddingTop: insets.top, backgroundColor: colors.surface, borderBottomColor: colors.border }, barStyle]}
        pointerEvents={compact ? 'auto' : 'none'}
        accessibilityElementsHidden={!compact}
        importantForAccessibility={compact ? 'auto' : 'no-hide-descendants'}
      >
        <View style={styles.barRow}>
          <Tap label="رجوع" onPress={onBack} style={styles.icon48}>
            <Icon name="back" size={24} tone="text" monochrome />
          </Tap>
          <View style={styles.flex}>
            <Text style={[dsType.label, { color: colors.text }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
              {title}
            </Text>
            {remaining ? (
              <Text style={[dsType.caption, { color: colors.muted }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                {remaining}
              </Text>
            ) : null}
          </View>
          {actions.map((a) => (
            <Tap key={a.label} label={a.label} onPress={a.onPress} style={[styles.icon48, a.text ? { borderRadius: 24, backgroundColor: colors.primaryContainer } : null]}>
              {a.text ? (
                // «Aa» بخلفية الحاوية الأساسية في الشريط المطوي — Screens A · 04ب.
                <Text style={[styles.aa, { color: colors.primaryText }]} maxFontSizeMultiplier={1}>
                  {a.text}
                </Text>
              ) : (
                <Icon name={a.icon} size={22} tone="text" monochrome />
              )}
            </Tap>
          ))}
        </View>
        {progress ? (
          <View style={[styles.track, { backgroundColor: colors.border }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Animated.View style={[styles.fill, { backgroundColor: colors.primary }, fill]} />
          </View>
        ) : null}
      </Animated.View>
    </>
  );
}

function Circle({ icon, label, onPress, text }: Action) {
  const { colors } = useAppTheme();
  return (
    <Tap label={label} onPress={onPress} scale={0.94} style={[styles.circle, { backgroundColor: colors.surface }]}>
      {text ? (
        <Text style={[styles.aa, { color: colors.text }]} maxFontSizeMultiplier={1}>
          {text}
        </Text>
      ) : (
        <Icon name={icon} size={22} tone="text" monochrome />
      )}
    </Tap>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', gap: ds.space.s2 },
  floatLayer: { zIndex: 4 },
  topShade: { position: 'absolute', top: 0, start: 0, end: 0 },
  floatRow: { position: 'absolute', start: ds.layout.gutter, end: ds.layout.gutter, flexDirection: 'row', justifyContent: 'space-between' },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0E065A',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: ds.elevation.floating,
  },
  bar: { position: 'absolute', top: 0, start: 0, end: 0, zIndex: 5, borderBottomWidth: StyleSheet.hairlineWidth },
  barRow: { height: ds.layout.appbarCollapsed, flexDirection: 'row', alignItems: 'center', gap: ds.space.s1, paddingHorizontal: ds.space.s1 },
  icon48: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  aa: { fontFamily: 'Tajawal_800ExtraBold', fontSize: 16, lineHeight: 20 },
  track: { position: 'absolute', start: 0, end: 0, bottom: -1, height: 2 },
  fill: { position: 'absolute', top: 0, bottom: 0, start: 0 },
});
