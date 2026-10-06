import * as Haptics from 'expo-haptics';
import { Children, cloneElement, isValidElement, ReactElement, ReactNode, useEffect, useId, useRef, useState } from 'react';
import { AccessibilityInfo, AccessibilityState, Animated, Easing, Platform, Pressable, StyleProp, StyleSheet, TextInput, View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ModontyIcon, ModontyIconName } from '@/src/components/brand/icons/ModontyIcon';
import type { MobileStat } from '@/src/services/mobile-api';
import { control, fonts, motion, nabd, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/**
 * عُدّة «نبض» — الاتجاه «د» المعتمد (خالد، ٤ أكتوبر ٢٠٢٦).
 *
 * بطلٌ أزرق واحد · أسطح نغمية بلا حدود · مجموعات مقطّعة · أزرار كبسولية · شريط أرقام حيث
 * الرقم حقيقي · توهّج ثابت خلف المحتوى · وكل ضغطة تنكمش ٣٪ وتهتزّ. الحركة كلها `Animated`
 * المدمج و`useNativeDriver` (transform/opacity)، إلا رسم الحلقة: خاصّية SVG لا تمرّ بالمشغّل
 * الأصلي، فتُرسم مرّة واحدة في ٦٠٠ms ثم تسكن. «تقليل الحركة» يُبقي الانكماش وحده بلا نبضة.
 */

// ─── الحركة والاهتزاز ───────────────────────────────────────────────────────

let reduceMotionCache = false;

/** «تقليل الحركة» من إعدادات النظام، ويُتابَع إن غيّره المستخدم والتطبيق مفتوح. */
export function useReduceMotion(): boolean {
  const [reduced, setReduced] = useState(reduceMotionCache);
  useEffect(() => {
    let alive = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => { reduceMotionCache = value; if (alive) setReduced(value); });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => { reduceMotionCache = value; setReduced(value); });
    return () => { alive = false; subscription.remove(); };
  }, []);
  return reduced;
}

export type HapticKind = 'light' | 'medium' | 'selection' | 'none';

/**
 * أندرويد: `performAndroidHapticsAsync` بنصّ توثيق Expo (محرّك الاهتزاز، بلا إذن VIBRATE) —
 * خفيف = Virtual_Key · متوسّط (اعتماد/قبول/إرسال) = Confirm · تبديل تاب = Segment_Tick.
 */
export function haptic(kind: HapticKind): void {
  if (kind === 'none') return;
  const run = Platform.OS === 'android'
    ? Haptics.performAndroidHapticsAsync(kind === 'medium' ? Haptics.AndroidHaptics.Confirm : kind === 'selection' ? Haptics.AndroidHaptics.Segment_Tick : Haptics.AndroidHaptics.Virtual_Key)
    : kind === 'selection' ? Haptics.selectionAsync() : Haptics.impactAsync(kind === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
  void run.catch(() => undefined);
}

type PressableScaleProps = {
  onPress?: () => void;
  haptic?: HapticKind;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  accessibilityRole?: 'button' | 'link' | 'tab' | 'switch' | 'checkbox';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: AccessibilityState;
};

/** كل ما يُضغط: ينكمش إلى ٠٫٩٧ بنبضة (damping 18 · stiffness 260 ≈ 180ms) ويهتزّ خفيفاً. */
export function PressableScale({ onPress, haptic: hapticKind = 'light', disabled = false, style, children, accessibilityRole = 'button', accessibilityLabel, accessibilityHint, accessibilityState }: PressableScaleProps) {
  const reduced = useReduceMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const to = (value: number) => (reduced
    ? Animated.timing(scale, { toValue: value, duration: 90, useNativeDriver: true })
    : Animated.spring(scale, { toValue: value, damping: motion.pressDamping, stiffness: motion.pressStiffness, mass: 1, useNativeDriver: true })).start();
  // عنصرٌ واحد يُضغط ويتحرّك: لو لُفّ `Pressable` حول `Animated.View` لضاعت خصائص التخطيط
  // (flex · alignSelf) على الغلاف — قِيس: بلاطتا البنتو انضغطتا إلى عرض محتواهما.
  return <AnimatedPressable
    accessibilityRole={accessibilityRole}
    accessibilityLabel={accessibilityLabel}
    accessibilityHint={accessibilityHint}
    accessibilityState={{ disabled, ...accessibilityState }}
    disabled={disabled || !onPress}
    onPressIn={() => to(motion.pressScale)}
    onPressOut={() => to(1)}
    onPress={() => { haptic(hapticKind); onPress?.(); }}
    style={[style, { transform: [{ scale }] }]}
  >
    {children}
  </AnimatedPressable>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** دخول الشاشة: يطلع ١٠ نقاط ويظهر في ٣٦٠ms، بتأخير ٤٠ms بين الكتل — خمس بالكثير. */
export function EnterView({ index = 0, style, children }: { index?: number; style?: StyleProp<ViewStyle>; children: ReactNode }) {
  const reduced = useReduceMotion();
  const progress = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  useEffect(() => {
    if (reduced) { progress.setValue(1); return; }
    Animated.timing(progress, {
      toValue: 1,
      duration: motion.enterDuration,
      delay: Math.min(index, motion.enterMaxSteps) * motion.enterStep,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      useNativeDriver: true,
    }).start();
  }, [index, progress, reduced]);
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [motion.enterOffset, 0] });
  return <Animated.View style={[style, { opacity: progress, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

/** ما عُدّ مرّة لا يُعاد عند الرجوع للشاشة — جدول الحركة: «مرّة واحدة عند أوّل ظهور». */
const playedOnce = new Set<string>();

/** رقم البطل يعدّ من ٠ إلى قيمته في ٥٠٠ms، مرّة واحدة للجلسة لكل `onceKey`. */
export function CountUpText({ value, format, onceKey, style }: { value: number; format: (value: number) => string; onceKey: string; style?: StyleProp<import('react-native').TextStyle> }) {
  const reduced = useReduceMotion();
  // يُحسم عند التركيب: بعده يُكتب الرقم مباشرةً (تحديثٌ بالسحب لا يُعيد العدّ).
  const skip = useRef(reduced || playedOnce.has(onceKey) || value <= 0).current;
  const played = useRef(false);
  const [shown, setShown] = useState(skip ? value : 0);
  useEffect(() => {
    if (skip || played.current) { setShown(value); return undefined; }
    played.current = true;
    playedOnce.add(onceKey);
    const counter = new Animated.Value(0);
    const listener = counter.addListener(({ value: next }) => setShown(Math.round(next)));
    const animation = Animated.timing(counter, { toValue: value, duration: motion.countUpDuration, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    animation.start(() => setShown(value));
    return () => { animation.stop(); counter.removeListener(listener); setShown(value); };
  }, [onceKey, skip, value]);
  return <Text maxFontSizeMultiplier={1} style={style}>{format(shown)}</Text>;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** حلقة تقدّم SVG تُرسم من صفر إلى نسبتها في ٦٠٠ms (مرّة للجلسة)، وفي وسطها ما يُمرَّر. */
export function Ring({ size, stroke, progress, color, track, onceKey, children, accessibilityLabel }: { size: number; stroke: number; progress: number; color: string; track: string; onceKey: string; children?: ReactNode; accessibilityLabel?: string }) {
  const reduced = useReduceMotion();
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const target = circumference * (1 - Math.min(Math.max(progress, 0), 1));
  const skip = useRef(reduced || playedOnce.has(onceKey)).current;
  const played = useRef(false);
  const offset = useRef(new Animated.Value(skip ? target : circumference)).current;
  useEffect(() => {
    if (skip || played.current) { offset.setValue(target); return; }
    played.current = true;
    playedOnce.add(onceKey);
    Animated.timing(offset, { toValue: target, duration: motion.ringDuration, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [offset, onceKey, skip, target]);
  return <View accessible={accessibilityLabel !== undefined} accessibilityLabel={accessibilityLabel} style={[styles.ring, { width: size, height: size }]}>
    <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
      <Circle cx={size / 2} cy={size / 2} r={radius} stroke={track} strokeWidth={stroke} fill="none" />
      <AnimatedCircle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={offset} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </Svg>
    {children}
  </View>;
}

/** الهامش تحت محتوى شاشات التابات: الشريط العائم يغطّي آخره بدونه (١٠٠ + شريط الإيماءة). */
export function useTabBarClearance(): number {
  return nabd.tabBarClearance + useSafeAreaInsets().bottom;
}

// ─── الأشكال ────────────────────────────────────────────────────────────────

/** شكل «الكعكة» (Material 3 Expressive): دائرة بتسع موجات — نفس معادلة الموكب `cookiePath`. */
function cookiePath(size: number): string {
  const center = size / 2;
  const radius = size * 0.4375;
  const amplitude = size * 0.047;
  const steps = 120;
  let path = '';
  for (let step = 0; step <= steps; step += 1) {
    const angle = (step / steps) * Math.PI * 2;
    const r = radius + amplitude * Math.cos(9 * angle);
    path += `${step === 0 ? 'M' : 'L'}${(center + r * Math.cos(angle)).toFixed(2)} ${(center + r * Math.sin(angle)).toFixed(2)}`;
  }
  return `${path}Z`;
}

export function Cookie({ size, color, children, style }: { size: number; color: string; children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.ring, { width: size, height: size }, style]}>
    <Svg width={size} height={size} style={StyleSheet.absoluteFill}><Path d={cookiePath(size)} fill={color} /></Svg>
    {children}
  </View>;
}

function gradientId(raw: string): string {
  return `g${raw.replace(/[^a-zA-Z0-9]/g, '')}`;
}

/**
 * التوهّج الثابت خلف المحتوى: تدرّجان شعاعيّان (أزرق أعلى اليمين · تركواز أسفل اليسار)
 * بلا تمويه ولا حركة — رخيص، يُرسم مرّة، ولا نصّ فوقه إلا على أسطح معتمة.
 */
export function BackgroundGlow() {
  const { theme } = useAppTheme();
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const id = gradientId(useId());
  return <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={(event) => setSize({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })}>
    {size ? <Svg width={size.width} height={size.height}>
      <Defs>
        <RadialGradient id={`${id}b`} cx={size.width * 0.94} cy={0} rx={380} ry={320} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={theme.colors.glowBlue} stopOpacity={theme.colors.glowBlueOpacity} />
          <Stop offset="0.7" stopColor={theme.colors.glowBlue} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={`${id}t`} cx={0} cy={size.height} rx={320} ry={300} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={theme.colors.glowTeal} stopOpacity={theme.colors.glowTealOpacity} />
          <Stop offset="0.7" stopColor={theme.colors.glowTeal} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width={size.width} height={size.height} fill={`url(#${id}b)`} />
      <Rect width={size.width} height={size.height} fill={`url(#${id}t)`} />
    </Svg> : null}
  </View>;
}

// ─── الأسطح ─────────────────────────────────────────────────────────────────

/**
 * البطل: أزرق الماركة، زاوية ٣٢، توهّج تركوازي خافت أسفل الطرف الأيسر وظلّ أزرق تحته.
 * **بطل واحد في الشاشة** — هذا شرط الاتجاه، لا ذوق.
 */
export function HeroCard({ children, style, onPress, accessibilityLabel }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; accessibilityLabel?: string }) {
  const { theme } = useAppTheme();
  const id = gradientId(useId());
  const body = <View style={[styles.heroClip, { backgroundColor: theme.colors.hero }]}>
    <Svg pointerEvents="none" width={nabd.heroGlowSize} height={nabd.heroGlowSize} style={styles.heroGlow}>
      <Defs>
        <RadialGradient id={id} cx={nabd.heroGlowSize / 2} cy={nabd.heroGlowSize / 2} r={nabd.heroGlowSize / 2} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={theme.colors.glowTeal} stopOpacity={0.35} />
          <Stop offset="1" stopColor={theme.colors.glowTeal} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width={nabd.heroGlowSize} height={nabd.heroGlowSize} fill={`url(#${id})`} />
    </Svg>
    <View style={styles.heroBody}>{children}</View>
  </View>;
  const shell = [styles.hero, { backgroundColor: theme.colors.hero, boxShadow: theme.colors.heroShadow }, style];
  return onPress
    ? <PressableScale onPress={onPress} accessibilityLabel={accessibilityLabel} style={shell}>{body}</PressableScale>
    : <View style={shell}>{body}</View>;
}

export type Tone = 'surface' | 'raised' | 'secondary' | 'tertiary' | 'warning' | 'positive' | 'danger';

export function toneColors(tone: Tone, colors: ReturnType<typeof useAppTheme>['theme']['colors']): { background: string; foreground: string } {
  switch (tone) {
    case 'raised': return { background: colors.surfaceRaised, foreground: colors.text };
    case 'secondary': return { background: colors.secondary, foreground: colors.onSecondary };
    case 'tertiary': return { background: colors.tertiary, foreground: colors.onTertiary };
    case 'warning': return { background: colors.warningContainer, foreground: colors.onWarningContainer };
    case 'positive': return { background: colors.positiveContainer, foreground: colors.onPositiveContainer };
    case 'danger': return { background: colors.dangerContainer, foreground: colors.onDangerContainer };
    default: return { background: colors.surface, foreground: colors.text };
  }
}

/** بطاقة نغمية: لون السطح يفصلها — لا حدّ ١px. */
export function TonalCard({ tone = 'surface', style, children, onPress, accessibilityLabel }: { tone?: Tone; style?: StyleProp<ViewStyle>; children: ReactNode; onPress?: () => void; accessibilityLabel?: string }) {
  const { theme } = useAppTheme();
  const shell = [styles.card, { backgroundColor: toneColors(tone, theme.colors).background }, style];
  return onPress
    ? <PressableScale onPress={onPress} accessibilityLabel={accessibilityLabel} style={shell}>{children}</PressableScale>
    : <View style={shell}>{children}</View>;
}

type GroupPosition = 'only' | 'first' | 'middle' | 'last';

export function groupPositionOf(index: number, count: number): GroupPosition {
  if (count <= 1) return 'only';
  if (index === 0) return 'first';
  if (index === count - 1) return 'last';
  return 'middle';
}

function groupCorners(position: GroupPosition): ViewStyle {
  const outer = nabd.groupRadius;
  const inner = nabd.groupInnerRadius;
  return {
    borderTopLeftRadius: position === 'first' || position === 'only' ? outer : inner,
    borderTopRightRadius: position === 'first' || position === 'only' ? outer : inner,
    borderBottomLeftRadius: position === 'last' || position === 'only' ? outer : inner,
    borderBottomRightRadius: position === 'last' || position === 'only' ? outer : inner,
  };
}

/**
 * صفّ من مجموعة مقطّعة: فجوة ٣ وزوايا ٢٤ للأطراف و٨ بينها. يُستعمل داخل `ListGroup`،
 * أو مباشرةً في قائمة FlashList بـ`position` محسوب من الفهرس (`groupPositionOf`).
 */
export function GroupRow({ position = 'only', onPress, accessibilityLabel, accessibilityRole, style, children }: { position?: GroupPosition; onPress?: () => void; accessibilityLabel?: string; accessibilityRole?: 'button' | 'link'; style?: StyleProp<ViewStyle>; children: ReactNode }) {
  const { theme } = useAppTheme();
  const shell = [styles.groupRow, { backgroundColor: theme.colors.surface }, groupCorners(position), position !== 'first' && position !== 'only' ? styles.groupGap : null, style];
  return onPress
    ? <PressableScale onPress={onPress} accessibilityLabel={accessibilityLabel} accessibilityRole={accessibilityRole} style={shell}>{children}</PressableScale>
    : <View style={shell}>{children}</View>;
}

export function ListGroup({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const rows = Children.toArray(children).filter(isValidElement) as ReactElement<{ position?: GroupPosition }>[];
  return <View style={style}>{rows.map((row, index) => cloneElement(row, { position: groupPositionOf(index, rows.length) }))}</View>;
}

/** دائرة/مربّع لوني حول أيقونة — ٤٠ (٣٦ في صفوف القوائم). */
export function IconShape({ icon, size = nabd.shapeSize, tone = 'secondary', round = true }: { icon: ModontyIconName; size?: number; tone?: 'secondary' | 'hero' | 'tertiary' | 'raised'; round?: boolean }) {
  const { theme } = useAppTheme();
  const background = tone === 'hero' ? theme.colors.hero : tone === 'tertiary' ? theme.colors.tertiary : tone === 'raised' ? theme.colors.surfaceRaised : theme.colors.secondary;
  const foreground = tone === 'hero' ? theme.colors.onHero : tone === 'tertiary' ? theme.colors.onTertiary : tone === 'raised' ? theme.colors.text : theme.colors.onSecondary;
  return <View style={[styles.shape, { width: size, height: size, borderRadius: round ? size : 14, backgroundColor: background }]}>
    <ModontyIcon name={icon} size={control.iconSizeSmall} primary={foreground} accent={theme.colors.accent} />
  </View>;
}

// ─── النصوص ─────────────────────────────────────────────────────────────────

/** العنوان الكبير ٢٨/٣٦ — يحمل الشاشة بدل رأس مزدحم، وتحته سطر ثانوي اختياري. */
export function LargeTitle({ title, subtitle, size = 'large' }: { title: string; subtitle?: string | null; size?: 'large' | 'medium' }) {
  const { theme } = useAppTheme();
  return <View style={styles.largeTitleBlock}>
    <Text accessibilityRole="header" style={[size === 'large' ? styles.largeTitle : styles.mediumTitle, { color: theme.colors.text }]}>{title}</Text>
    {subtitle ? <Text style={[styles.secondary, { color: theme.colors.muted }]}>{subtitle}</Text> : null}
  </View>;
}

export function SectionHeading({ children }: { children: string }) {
  const { theme } = useAppTheme();
  return <Text accessibilityRole="header" style={[styles.sectionHeading, { color: theme.colors.text }]}>{children}</Text>;
}

// ─── الأزرار والشارات ───────────────────────────────────────────────────────

export type PillTone = 'primary' | 'secondary' | 'ghost' | 'danger' | 'onHero';

/**
 * زرّ كبسولي. الأساسي بأزرق البطل وظلّه المتوهّج — **واحد في الشاشة المرئية** (UIUX §١)؛
 * الثانوي نغمي `secondary`؛ الشبحي بحدّ الحقل ٣:١؛ الهدّام بحاوية الخطر.
 */
export function PillButton({ label, onPress, tone = 'primary', icon, size = 'large', disabled = false, glow = true, haptic: hapticKind, style, accessibilityLabel, accessibilityState }: { label: string; onPress?: () => void; tone?: PillTone; icon?: ModontyIconName; size?: 'large' | 'medium'; disabled?: boolean; glow?: boolean; haptic?: HapticKind; style?: StyleProp<ViewStyle>; accessibilityLabel?: string; accessibilityState?: AccessibilityState }) {
  const { theme } = useAppTheme();
  const palette = tone === 'primary' ? { background: theme.colors.hero, foreground: theme.colors.onHero }
    : tone === 'secondary' ? { background: theme.colors.secondary, foreground: theme.colors.onSecondary }
      : tone === 'danger' ? { background: theme.colors.dangerContainer, foreground: theme.colors.onDangerContainer }
        : tone === 'onHero' ? { background: theme.colors.onHero, foreground: theme.colors.navy }
          : { background: 'transparent', foreground: theme.colors.text };
  const shell = [
    size === 'large' ? styles.pillLarge : styles.pillMedium,
    { backgroundColor: palette.background },
    tone === 'ghost' ? { borderWidth: control.inputBorderWidth, borderColor: theme.colors.inputBorder } : null,
    tone === 'primary' && glow && !disabled ? { boxShadow: theme.colors.heroShadow } : null,
    disabled ? styles.disabled : null,
    style,
  ];
  return <PressableScale onPress={onPress} disabled={disabled} haptic={hapticKind ?? (tone === 'primary' ? 'medium' : 'light')} accessibilityLabel={accessibilityLabel ?? label} accessibilityState={accessibilityState} style={shell}>
    {icon ? <ModontyIcon name={icon} size={control.iconSizeSmall} primary={palette.foreground} accent={tone === 'onHero' ? theme.colors.hero : theme.colors.accent} /> : null}
    <Text maxFontSizeMultiplier={1.3} numberOfLines={1} style={[size === 'large' ? styles.pillLabel : styles.pillLabelMedium, { color: palette.foreground }]}>{label}</Text>
  </PressableScale>;
}

export type BadgeTone = 'warning' | 'positive' | 'danger' | 'neutral' | 'primary' | 'onHero';

const badgeIcons: Partial<Record<BadgeTone, ModontyIconName>> = { warning: 'clock', positive: 'check', danger: 'close', onHero: 'check' };

/** شارة الحالة = نصّ + رمز + لون، ثلاثتها (UIUX §٢). */
export function StatusBadge({ label, tone, icon: iconOverride, style }: { label: string; tone: BadgeTone; icon?: ModontyIconName; style?: StyleProp<ViewStyle> }) {
  const { theme } = useAppTheme();
  const palette = badgePalette(tone, theme.colors);
  const icon = iconOverride ?? badgeIcons[tone];
  return <View style={[styles.badge, { backgroundColor: palette.background }, style]}>
    {icon ? <ModontyIcon name={icon} size={control.iconSizeBadge} primary={palette.foreground} accent={palette.foreground} /> : null}
    <Text maxFontSizeMultiplier={1} numberOfLines={1} style={[styles.badgeText, { color: palette.foreground }]}>{label}</Text>
  </View>;
}

function badgePalette(tone: BadgeTone, colors: ReturnType<typeof useAppTheme>['theme']['colors']): { background: string; foreground: string } {
  if (tone === 'neutral') return { background: colors.surfaceHigh, foreground: colors.text };
  if (tone === 'primary') return { background: colors.hero, foreground: colors.onHero };
  // على البطل: أبيض بكحلي (الموكب S04) — شارة نغمية فوق الأزرق تذوب فيه.
  if (tone === 'onHero') return { background: colors.onHero, foreground: colors.navy };
  return toneColors(tone, colors);
}

export function badgeToneOf(tone: string | null | undefined): BadgeTone {
  if (tone === 'warning' || tone === 'pending' || tone === 'waiting') return 'warning';
  if (tone === 'danger' || tone === 'closed') return 'danger';
  if (tone === 'primary' || tone === 'positive' || tone === 'done') return 'positive';
  return 'neutral';
}

/** شريط ثلاث خلايا أرقام — الرقم والتسمية من الخادم كما هما. */
export function StatStrip({ stats }: { stats: MobileStat[] }) {
  const { theme } = useAppTheme();
  if (stats.length === 0) return null;
  return <View style={styles.stats}>
    {stats.map((stat) => {
      const tone = badgeToneOf(stat.tone);
      const filled = badgePalette(tone, theme.colors);
      const palette = tone === 'neutral' ? { background: theme.colors.surfaceRaised, foreground: theme.colors.text, label: theme.colors.muted } : { ...filled, label: filled.foreground };
      return <View key={stat.key} accessible accessibilityLabel={`${stat.value} ${stat.label}`} style={[styles.stat, { backgroundColor: palette.background }]}>
        <Text maxFontSizeMultiplier={1} style={[styles.statValue, { color: palette.foreground }]}>{stat.value}</Text>
        <Text maxFontSizeMultiplier={1.2} numberOfLines={2} style={[styles.secondary, { color: palette.label }]}>{stat.label}</Text>
      </View>;
    })}
  </View>;
}


// ─── التبديل واللوح والحقل ──────────────────────────────────────────────────

export type SegmentItem<K extends string> = { key: K; label: string; count?: string };

/**
 * مجموعة مقطّعة «نبض» (‎.seg-tabs): كبسولات ٤٨ متساوية بفجوة ٨، النشطة `secondary` والباقي سطح
 * `surface` — التبديل يغيّر ما تعرضه الشاشة ولا يفعل شيئاً آخر، ويهتزّ «تحديداً» لا ضغطاً.
 */
export function SegmentedTabs<K extends string>({ items, activeKey, onSelect }: { items: SegmentItem<K>[]; activeKey: K; onSelect: (key: K) => void }) {
  const { theme } = useAppTheme();
  return <View accessibilityRole="tablist" style={styles.segments}>
    {items.map((item) => {
      const active = item.key === activeKey;
      const color = active ? theme.colors.onSecondary : theme.colors.text;
      return <PressableScale
        key={item.key}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        accessibilityLabel={item.count ? `${item.label} ${item.count}` : item.label}
        haptic={active ? 'none' : 'selection'}
        onPress={() => onSelect(item.key)}
        style={[styles.segment, { backgroundColor: active ? theme.colors.secondary : theme.colors.surface }]}
      >
        <Text maxFontSizeMultiplier={1.2} numberOfLines={1} style={[styles.segmentLabel, { color }]}>{item.label}</Text>
        {item.count ? <Text maxFontSizeMultiplier={1} style={[styles.segmentCount, { color }]}>{item.count}</Text> : null}
      </PressableScale>;
    })}
  </View>;
}

/** لوح الفعل (‎.dock-glass): سطح شبه معتم بزاوية ٢٨ وحافّة ضوء علوية — يحمل زرّ الشاشة الأساسي. */
export function DockSurface({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { theme } = useAppTheme();
  return <View style={[styles.dock, { backgroundColor: theme.colors.tabBar, boxShadow: `inset 0 1px 0 ${theme.colors.edgeHighlight}, ${theme.colors.liftShadow}` }, style]}>{children}</View>;
}

/**
 * حقل نصّ متعدّد الأسطر (‎.fld + ‎.inp.area): التسمية فوقه، بئر أغمق من الأرضية بحدّ ٣:١، وتحته سطر
 * مساعد وعدّاد على طرفين. العدّاد رقمٌ لاتيني الاتّجاه فيُعلن اتّجاهه.
 */
export function TextAreaField({ label, value, onChangeText, placeholder, maxLength, editable = true, minHeight = control.buttonHeight * 2, helper, counter }: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; maxLength?: number; editable?: boolean; minHeight?: number; helper?: string | null; counter?: string | null }) {
  const { theme } = useAppTheme();
  return <View style={styles.field}>
    <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>{label}</Text>
    <TextInput
      accessibilityLabel={label}
      editable={editable}
      maxLength={maxLength}
      multiline
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.inputPlaceholder}
      style={[styles.area, { minHeight, backgroundColor: theme.colors.inputSurface, borderColor: theme.colors.inputBorder, color: theme.colors.text }]}
      textAlign="right"
      textAlignVertical="top"
      value={value}
    />
    {helper || counter ? <View style={styles.fieldFoot}>
      {helper ? <Text style={[styles.secondary, styles.fieldHelper, { color: theme.colors.muted }]}>{helper}</Text> : <View style={styles.fieldHelper} />}
      {counter ? <Text maxFontSizeMultiplier={1} style={[styles.secondary, { color: theme.colors.muted }]}>{counter}</Text> : null}
    </View> : null}
  </View>;
}

const styles = StyleSheet.create({
  ring: { alignItems: 'center', justifyContent: 'center' },
  hero: { borderRadius: nabd.heroRadius },
  heroClip: { borderRadius: nabd.heroRadius, overflow: 'hidden' },
  heroGlow: { position: 'absolute', left: -90, bottom: -120 },
  heroBody: { gap: spacing.sm, padding: nabd.heroPadding },
  card: { borderRadius: nabd.cardRadius, padding: spacing.md },
  groupRow: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  groupGap: { marginTop: nabd.groupGap },
  shape: { alignItems: 'center', justifyContent: 'center' },
  largeTitleBlock: { gap: spacing.xxs },
  largeTitle: { fontFamily: fonts.bold, fontSize: typography.largeTitle, lineHeight: typography.lineHeightLargeTitle, textAlign: 'right', writingDirection: 'rtl' },
  mediumTitle: { fontFamily: fonts.bold, fontSize: typography.mediumTitle, lineHeight: typography.lineHeightMediumTitle, textAlign: 'right', writingDirection: 'rtl' },
  secondary: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl' },
  sectionHeading: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right', writingDirection: 'rtl' },
  pillLarge: { alignItems: 'center', borderRadius: nabd.pill, flexDirection: 'row-reverse', gap: spacing.xs, justifyContent: 'center', minHeight: control.buttonHeight, paddingHorizontal: spacing.lg },
  pillMedium: { alignItems: 'center', borderRadius: nabd.pill, flexDirection: 'row-reverse', gap: spacing.xs, justifyContent: 'center', minHeight: control.minTouchTarget, paddingHorizontal: spacing.md },
  pillLabel: { fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, writingDirection: 'rtl' },
  pillLabelMedium: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, writingDirection: 'rtl' },
  disabled: { opacity: 0.45 },
  badge: { alignItems: 'center', alignSelf: 'flex-end', borderRadius: nabd.pill, flexDirection: 'row-reverse', gap: spacing.xxs, height: spacing.xl, paddingHorizontal: nabd.badgePaddingX },
  badgeText: { fontFamily: fonts.medium, fontSize: typography.tabLabel, lineHeight: typography.lineHeightTabLabel, writingDirection: 'rtl' },
  stats: { flexDirection: 'row-reverse', gap: spacing.xs },
  stat: { borderRadius: nabd.statRadius, flex: 1, paddingHorizontal: spacing.sm, paddingVertical: nabd.statPaddingY },
  segments: { flexDirection: 'row-reverse', gap: spacing.xs },
  // تنمو من عرض نصّها لا أثلاثاً متساوية: التسمية الأطول تأخذ ما تحتاجه بدل أن تُقصّ.
  segment: { alignItems: 'center', borderRadius: nabd.pill, flexBasis: 'auto', flexGrow: 1, flexShrink: 1, flexDirection: 'row-reverse', gap: spacing.xxs, justifyContent: 'center', minHeight: control.minTouchTarget, paddingHorizontal: spacing.xs },
  // ١٣ لا ١٤: «كيف تعمل الإحالة» في ثلث العرض (١٠٦dp) كانت تُقصّ بنقاط عند ١٤.
  segmentLabel: { flexShrink: 1, fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, writingDirection: 'rtl' },
  segmentCount: { fontFamily: fonts.bold, fontSize: typography.label, lineHeight: typography.lineHeightLabel },
  dock: { borderRadius: nabd.bigCardRadius, gap: spacing.xs, padding: spacing.sm },
  field: { gap: spacing.xs },
  fieldLabel: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'right', writingDirection: 'rtl' },
  area: { borderRadius: radii.field, borderWidth: control.inputBorderWidth, fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, writingDirection: 'rtl' },
  fieldFoot: { alignItems: 'flex-start', flexDirection: 'row-reverse', gap: spacing.xs, justifyContent: 'space-between' },
  fieldHelper: { flex: 1 },
  statValue: { fontFamily: fonts.medium, fontSize: typography.statNumeral, lineHeight: typography.lineHeightStatNumeral, textAlign: 'right', writingDirection: 'rtl' },
});
