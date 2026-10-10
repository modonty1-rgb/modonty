import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useMemo, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedReaction, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ModontyIconName } from '@/components/brand/ModontyIcon';
import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { useAuth } from '@/providers/AuthProvider';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds, dsFontScale, dsMotion, dsType } from '@/theme/tokens';
import { useNavScrollHandler } from './NavScroll';

/**
 * رأس جذور التابات — Components 02 «الشريط العلوي (كبير / مطوي)»:
 * كبير = تحية اختيارية + عنوان display 34 + بحث · مودو · الصورة الرمزية (نقطة حمراء للإشعارات غير المقروءة فقط).
 * يمرّ مع المحتوى، وحين يختفي العنوان الكبير يظهر شريط ٥٦ ثابت بالعنوان والإجراءات (motion.appbar ١٨٠ms).
 * شريط الحالة تحته سطح الصفحة دائماً حتى لا يمرّ المحتوى خلف الساعة (edge-to-edge على Android 16).
 */
type Options = {
  title: string;
  eyebrow?: string;
  /** صفحة غامرة (مدونتي): شريط الحالة بلون رأسها حتى يظهر الشريط المطوي. */
  statusColor?: string;
  /** يُستدعى فقط لحظة عبور العتبة (لا مع كل إطار) — مثلاً لتبديل لون أيقونات شريط الحالة. */
  onCompactChange?: (compact: boolean) => void;
  /**
   * صفّ يثبت تحت الشريط المطوي حين يمرّ موضعه الأصلي (تبويبات الفيد — Screens A · 01 «sticky»).
   * الشاشة تضع `stickyAnchor` على الحاوية الأصلية للصفّ داخل رأس القائمة ليُقاس موضعه.
   */
  sticky?: ReactElement | null;
  /** إجراءات الرأس بدل الثلاثة الافتراضية (بحث · مودو · الحساب) — مثلاً «المحفوظة» وحدها في المقالات. */
  actions?: ReactNode;
  /** شاشة مدفوعة (لا جذر تاب): زرّ رجوع قبل العنوان الكبير وفي الشريط المطوي — Screens B · 07. */
  back?: boolean;
};

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

function BackButton() {
  return (
    <Tap label="رجوع" onPress={goBack} style={styles.back}>
      <Icon name="back" size={24} tone="text" monochrome />
    </Tap>
  );
}

const COMPACT = ds.layout.appbarCollapsed;

/** تحية الرئيسية حسب ساعة الجهاز. */
export function greeting(now = new Date()) {
  const h = now.getHours();
  return h >= 4 && h < 12 ? 'صباح الخير' : 'مساء الخير';
}

/**
 * الأداء (قواعد `mobile-screen-standard`): التمرير لا يغيّر state في الشاشة أبداً — يكتب قيماً مشتركة فقط.
 * الشريط المطوي يراقبها على مسار الرسم ويعيد رسم نفسه وحده لحظة عبور العتبة؛ الشاشة وقائمتها لا تُعاد.
 */
export function useTabHeader({ title, eyebrow, statusColor, onCompactChange, sticky, actions, back }: Options) {
  const navScroll = useNavScrollHandler();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const largeH = useSharedValue(96);
  const anchorY = useSharedValue(Number.MAX_SAFE_INTEGER);
  const onChange = useRef(onCompactChange);
  onChange.current = onCompactChange;

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY.value = e.nativeEvent.contentOffset.y;
      navScroll(e);
    },
    [navScroll, scrollY],
  );
  const onHeight = useCallback((h: number) => {
    largeH.value = h;
  }, [largeH]);
  const notify = useCallback((c: boolean) => onChange.current?.(c), []);
  const stickyAnchor = useCallback((e: LayoutChangeEvent) => {
    anchorY.value = e.nativeEvent.layout.y;
  }, [anchorY]);

  const large = useMemo(() => <LargeHeader title={title} eyebrow={eyebrow} actions={actions} back={back} onHeight={onHeight} />, [title, eyebrow, actions, back, onHeight]);
  const bar = useMemo(
    () => (
      <CompactBar title={title} scrollY={scrollY} largeH={largeH} anchorY={anchorY} sticky={sticky} actions={actions} back={back} statusColor={statusColor} onChange={notify} />
    ),
    [title, scrollY, largeH, anchorY, sticky, actions, back, statusColor, notify],
  );
  /**
   * أوّل موضع تمرير يكون فيه الشريط المطوي ظاهراً والصفّ الثابت ملتصقاً — لإبقاء الرقاقات مكانها عند
   * تغيير فلتر (القائمة تُعاد من الأعلى). يُقرأ عند الضغط لا أثناء الرسم.
   */
  const pinnedOffset = useCallback(
    () => Math.max(0, Math.ceil(Math.max(anchorY.value - insets.top - COMPACT, largeH.value - COMPACT / 2)) + 1),
    [anchorY, largeH, insets.top],
  );
  return { large, bar, onScroll, stickyAnchor, pinnedOffset };
}

function LargeHeader({ title, eyebrow, actions, back, onHeight }: Options & { onHeight: (h: number) => void }) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  return (
    <View style={[styles.large, back && styles.largeBack, { paddingTop: insets.top + ds.space.s3 }]} onLayout={(e) => onHeight(e.nativeEvent.layout.height)}>
      {back ? <BackButton /> : null}
      <View style={styles.largeText}>
        {eyebrow ? (
          <Text style={[dsType.body, { color: colors.textSecondary }]} maxFontSizeMultiplier={dsFontScale.max} numberOfLines={2}>
            {eyebrow}
          </Text>
        ) : null}
        {/* لا adjustsFontSizeToFit: كان يصغّر العنوان حتى لا يُقرأ عند تكبير الخطّ ٢٠٠٪ (مقيس ١٠ أكتوبر).
            العنوان الكبير ٣٤ يكبر حتى ١٫٥ (٥١) ويلتفّ لسطرين — أكبر من ذلك يأكل الشاشة بلا فائدة. */}
        <Text style={[dsType.display, { color: colors.text }]} maxFontSizeMultiplier={1.2} numberOfLines={2} accessibilityRole="header">
          {title}
        </Text>
      </View>
      {actions === undefined && back ? null : (actions ?? <Actions />)}
    </View>
  );
}

function CompactBar({
  title,
  scrollY,
  largeH,
  anchorY,
  sticky,
  actions,
  back,
  statusColor,
  onChange,
}: {
  title: string;
  scrollY: SharedValue<number>;
  largeH: SharedValue<number>;
  anchorY: SharedValue<number>;
  sticky?: ReactElement | null;
  actions?: ReactNode;
  back?: boolean;
  statusColor?: string;
  onChange: (compact: boolean) => void;
}) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const reduced = useReducedMotion();
  const v = useSharedValue(0);
  // حالة محلّية لهذا الشريط وحده (pointerEvents وقارئ الشاشة) — تتغيّر عند عبور العتبة فقط.
  const [shown, setShown] = useState(false);
  useAnimatedReaction(
    () => scrollY.value > largeH.value - COMPACT / 2,
    (now, prev) => {
      if (now === prev) return;
      v.value = withTiming(now ? 1 : 0, {
        duration: reduced ? dsMotion.reducedFade : dsMotion.appbar.duration,
        easing: Easing.bezier(0.2, 0, 0, 1),
      });
      runOnJS(setShown)(now);
      runOnJS(onChange)(now);
    },
    [reduced],
  );
  // الصفّ الثابت: يظهر حين يصل موضعه الأصلي إلى أسفل الشريط المطوي — فيبدو كأنه التصق مكانه.
  const [stuck, setStuck] = useState(false);
  useAnimatedReaction(
    () => scrollY.value > anchorY.value - insets.top - COMPACT,
    (now, prev) => {
      if (now !== prev) runOnJS(setStuck)(now);
    },
    [insets.top],
  );
  const rowStyle = useAnimatedStyle(() => ({
    opacity: v.value,
    transform: [{ translateY: reduced ? 0 : (1 - v.value) * -dsMotion.appbar.translateY }],
  }));

  return (
    <View style={[styles.overlay, { paddingTop: insets.top }]} pointerEvents="box-none">
      <View style={[styles.statusFill, { height: insets.top, backgroundColor: statusColor ?? colors.page }]} pointerEvents="none" />
      <Animated.View
        style={[styles.compact, back && styles.compactBack, { backgroundColor: colors.surface, borderBottomColor: colors.border }, rowStyle]}
        pointerEvents={shown ? 'auto' : 'none'}
        accessibilityElementsHidden={!shown}
        importantForAccessibility={shown ? 'auto' : 'no-hide-descendants'}
      >
        {back ? <BackButton /> : null}
        <Text style={[dsType.titleMd, styles.compactTitle, { color: colors.text }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
          {title}
        </Text>
        {actions === undefined && back ? null : (actions ?? <Actions />)}
      </Animated.View>
      {sticky && stuck ? <View style={{ backgroundColor: colors.page }}>{sticky}</View> : null}
      {/* سطح خلف شريط الحالة يمتدّ مع الشريط المطوي */}
      <Animated.View style={[styles.statusFill, { height: insets.top, backgroundColor: colors.surface }, rowStyle]} pointerEvents="none" />
    </View>
  );
}

/** زرّ رأس دائري Ø48 بخلفية bg.sunken — نفس زرّ البحث، لإجراءات الشاشة الخاصّة. */
export function HeaderCircle({ icon, label, onPress }: { icon: ModontyIconName; label: string; onPress: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Tap label={label} onPress={onPress} style={[styles.circle, { backgroundColor: colors.sunken }]}>
      <Icon name={icon} size={22} tone="text" monochrome />
    </Tap>
  );
}

/** بحث · مودو · الصورة الرمزية — Ø48 لكلٍّ وفجوة ٦. */
function Actions() {
  const { colors } = useAppTheme();
  const { user, unreadNotifications } = useAuth();
  const initial = user?.name?.trim().charAt(0);
  const avatarLabel = unreadNotifications > 0 ? `حسابك، ${unreadNotifications} إشعارات غير مقروءة` : 'حسابك';
  return (
    <View style={styles.actions}>
      <Tap label="بحث" onPress={() => router.navigate('/search')} style={[styles.circle, { backgroundColor: colors.sunken }]}>
        <Icon name="search" size={22} tone="text" monochrome />
      </Tap>
      <Tap label="مودو" onPress={() => router.navigate('/modo')} style={styles.circle}>
        <LinearGradient colors={[colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
          <Icon name="ai" size={22} tone="onPrimary" monochrome />
        </LinearGradient>
      </Tap>
      <Tap label={avatarLabel} onPress={() => router.navigate('/account')} style={[styles.circle, { backgroundColor: colors.primaryContainer }]}>
        {user?.image ? (
          <Image cachePolicy="memory-disk" source={{ uri: user.image }} style={styles.avatarImg} contentFit="cover" />
        ) : initial ? (
          <Text style={[dsType.titleSm, { color: colors.onPrimaryContainer }]} maxFontSizeMultiplier={1}>
            {initial}
          </Text>
        ) : (
          <Icon name="profile" size={22} tone="onPrimaryContainer" monochrome />
        )}
        {unreadNotifications > 0 ? <View style={[styles.dot, { backgroundColor: colors.danger, borderColor: colors.page }]} /> : null}
      </Tap>
    </View>
  );
}

const C = ds.touch.min;
const styles = StyleSheet.create({
  large: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: ds.space.s3,
    paddingHorizontal: ds.layout.gutter,
    paddingBottom: ds.space.s1,
  },
  largeText: { flex: 1 },
  // مع الرجوع: الحشو من جهة البداية ٨ والفجوة ٤ (Screens B · 07 «padding:8px 8px 4px 16px»).
  largeBack: { paddingStart: ds.space.s2, gap: ds.space.s1 },
  back: { width: C, height: C, marginBottom: ds.space.s1, alignItems: 'center', justifyContent: 'center' },
  overlay: { position: 'absolute', top: 0, start: 0, end: 0, zIndex: 3 },
  statusFill: { position: 'absolute', top: 0, start: 0, end: 0 },
  compact: {
    height: COMPACT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.space.s3,
    paddingStart: ds.layout.gutter,
    paddingEnd: ds.space.s2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  compactTitle: { flex: 1 },
  compactBack: { paddingStart: ds.space.s1, gap: ds.space.s1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  circle: { width: C, height: C, borderRadius: C / 2, alignItems: 'center', justifyContent: 'center' },
  gradient: { width: C, height: C, borderRadius: C / 2, alignItems: 'center', justifyContent: 'center' },
  avatarImg: { width: C, height: C, borderRadius: C / 2 },
  dot: { position: 'absolute', top: 2, end: 2, width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
});
