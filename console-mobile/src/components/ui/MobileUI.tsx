import { Pressable, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ReactNode } from 'react';
import { ModontyIcon, ModontyIconName } from '@/src/components/brand/icons/ModontyIcon';
import { ModontyWordmark } from '@/src/components/brand/ModontyWordmark';
import { brand, control, fonts, radii, skeleton, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

export function Screen({ title, icon, children }: { title: string; icon: ModontyIconName; children: ReactNode }) {
  const { theme } = useAppTheme();
  return <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="automatic">
    <View style={styles.screenTitle}><ModontyIcon name={icon} size={control.headerIconSize} primary={theme.colors.text} accent={theme.colors.accent}/><Text style={[styles.pageTitle, { color: theme.colors.text }]}>{title}</Text></View>
    {children}
  </ScrollView>;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { theme } = useAppTheme();
  return <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, style]}>{children}</View>;
}

export function SectionTitle({ children, actionLabel, onAction }: { children: string; actionLabel?: string; onAction?: () => void }) {
  const { theme } = useAppTheme();
  return <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{children}</Text>{actionLabel && onAction ? <Pressable onPress={onAction} accessibilityRole="button" accessibilityLabel={actionLabel} style={styles.sectionActionTarget}><Text style={[styles.sectionAction, { color: theme.colors.textInteractive }]}>{actionLabel}</Text></Pressable> : null}</View>;
}

export function StatusPill({ children, tone = 'primary' }: { children: string; tone?: 'primary' | 'warning' | 'danger' | 'muted' }) {
  const { theme } = useAppTheme();
  const color = tone === 'warning' ? theme.colors.warning : tone === 'danger' ? theme.colors.danger : tone === 'muted' ? theme.colors.muted : theme.colors.textInteractive;
  return <View style={[styles.pill, { borderColor: color }]}><Text style={[styles.pillText, { color }]}>{children}</Text></View>;
}

export function PrimaryAction({ label, icon, onPress, style, tone = 'primary' }: { label: string; icon?: ModontyIconName; onPress: () => void; style?: StyleProp<ViewStyle>; tone?: 'primary' | 'secondary' }) {
  const { theme } = useAppTheme();
  const foreground = tone === 'primary' ? theme.colors.textOnPrimary : theme.colors.text;
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={[styles.primaryAction, { backgroundColor: tone === 'primary' ? theme.colors.primary : theme.colors.surfaceRaised, borderColor: tone === 'primary' ? theme.colors.primary : theme.colors.textInteractive, borderWidth: tone === 'primary' ? 0 : StyleSheet.hairlineWidth }, style]}>{icon ? <ModontyIcon name={icon} size={control.iconSize} primary={foreground} accent={tone === 'primary' ? theme.colors.navy : theme.colors.accent}/> : null}<Text style={[styles.primaryText, { color: foreground }]}>{label}</Text></Pressable>;
}

export function EmptyState({ icon, title, copy, actionLabel, onAction }: { icon: ModontyIconName; title: string; copy: string; actionLabel?: string; onAction?: () => void }) {
  const { theme } = useAppTheme();
  return <Card style={styles.empty}><ModontyIcon name={icon} size={control.headerIconSize} primary={theme.colors.text} accent={theme.colors.accent}/><Text style={[styles.emptyTitle, { color: theme.colors.text }]}>{title}</Text><Text style={[styles.emptyCopy, { color: theme.colors.muted }]}>{copy}</Text>{actionLabel && onAction ? <PrimaryAction label={actionLabel} icon={icon} onPress={onAction} style={styles.emptyAction}/> : null}</Card>;
}

/**
 * The branded pushed-screen header: wordmark centred with a back chevron beside it, the page
 * title on its own row, then a divider — exactly what S10 · S13 · S14 show. The plain pushed
 * screens (S03 · S04 · S06 · S07 · S08-reply) carry no wordmark and keep their own header.
 */

/** Loading placeholder shaped like the content it replaces — never a centred spinner. */
export function SkeletonBar({ height = skeleton.lineHeight, width, radius = radii.field }: { height?: number; width?: number | `${number}%`; radius?: number }) {
  const { theme } = useAppTheme();
  return <View style={[styles.skeletonBar, { height, borderRadius: radius, backgroundColor: theme.colors.surfaceRaised, opacity: skeleton.opacity }, width === undefined ? styles.skeletonFill : { width }]} />;
}

/**
 * هيكل شاشة قائمة: **مكان العنوان محفوظ** ثم البطاقات.
 *
 * شاشات التابات كانت تعرض بطاقات رمادية بلا عنوان، فيظهر العنوان فجأةً عند وصول البيانات
 * ويدفع القائمة لأسفل — قفزة تحدث في كل فتح. والعنوان جزء من التخطيط لا زينة، فيحجز مكانه.
 * ولأنها تابات فلا زرّ رجوع فيها أصلاً: شريط التابات هو التنقّل، فلا فخّ هنا كما في المدفوعة.
 */
export function ListScreenSkeleton({ count = 3, withSubtitle = false }: { count?: number; withSubtitle?: boolean }) {
  return <View style={styles.listScreenSkeleton}>
    <SkeletonBar height={skeleton.titleHeight} width="45%" />
    {withSubtitle ? <SkeletonBar width="70%" /> : null}
    <SkeletonCards count={count} />
  </View>;
}

/** Repeats a card-shaped skeleton so the list keeps its rhythm while loading. */
export function SkeletonCards({ count = 3 }: { count?: number }) {
  return <View accessibilityLabel="جاري التحميل" style={styles.skeletonList}>
    {Array.from({ length: count }, (_, index) => <Card key={index} style={styles.skeletonCard}>
      <SkeletonBar height={skeleton.titleHeight} width="70%" />
      <SkeletonBar />
      <SkeletonBar width="45%" />
    </Card>)}
  </View>;
}

/** Error state: names what failed, then offers one retry. */
export function ErrorState({ message, retryLabel, onRetry }: { message: string; retryLabel: string; onRetry: () => void }) {
  const { theme } = useAppTheme();
  return <Card style={styles.stateCard}>
    <ModontyIcon name="error" size={control.headerIconSize} primary={theme.colors.danger} accent={theme.colors.accent} />
    <Text style={[styles.stateTitle, { color: theme.colors.text }]}>{message}</Text>
    <PrimaryAction label={retryLabel} onPress={onRetry} style={styles.stateAction} />
  </Card>;
}

/** «ما في اتصال» is its own state — never folded into «ما في نتائج». */
export function OfflineState({ title, description, retryLabel, onRetry }: { title: string; description: string; retryLabel: string; onRetry: () => void }) {
  const { theme } = useAppTheme();
  return <Card style={styles.stateCard}>
    <ModontyIcon name="info" size={control.headerIconSize} primary={theme.colors.warning} accent={theme.colors.accent} />
    <Text style={[styles.stateTitle, { color: theme.colors.text }]}>{title}</Text>
    <Text style={[styles.stateCopy, { color: theme.colors.muted }]}>{description}</Text>
    <PrimaryAction label={retryLabel} onPress={onRetry} style={styles.stateAction} />
  </Card>;
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: spacing.screenHorizontal, paddingBottom: spacing.screenBottom },
  listScreenSkeleton: { gap: spacing.sm },
  skeletonList: { gap: spacing.sm },
  skeletonCard: { gap: spacing.sm },
  skeletonBar: {},
  skeletonFill: { alignSelf: 'stretch' },
  stateCard: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, gap: spacing.xs },
  stateTitle: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, writingDirection: 'rtl', textAlign: 'center' },
  stateCopy: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, writingDirection: 'rtl', textAlign: 'center' },
  stateAction: { alignSelf: 'stretch', marginTop: spacing.xs },
  screenTitle: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.xs, marginTop: spacing.md, marginBottom: spacing.xl },
  pageTitle: { fontFamily: fonts.medium, fontSize: typography.pageTitle, lineHeight: typography.lineHeightPageTitle, writingDirection: 'rtl' },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radii.card, padding: spacing.md },
  sectionHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xl, marginBottom: spacing.sm },
  sectionTitle: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, writingDirection: 'rtl' },
  sectionActionTarget: { alignItems: 'center', justifyContent: 'center', minHeight: control.minTouchTarget, minWidth: control.minTouchTarget },
  sectionAction: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, writingDirection: 'rtl' },
  pill: { alignSelf: 'flex-start', borderWidth: StyleSheet.hairlineWidth, borderRadius: radii.field, paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs },
  pillText: { fontFamily: fonts.medium, fontSize: typography.tabLabel, lineHeight: typography.lineHeightTabLabel, writingDirection: 'rtl' },
  primaryAction: { minHeight: control.minTouchTarget, borderRadius: radii.button, paddingHorizontal: spacing.md, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  primaryText: { fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, writingDirection: 'rtl' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl },
  emptyTitle: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, writingDirection: 'rtl', marginTop: spacing.md, textAlign: 'center' },
  emptyCopy: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, writingDirection: 'rtl', marginTop: spacing.xs, textAlign: 'center' },
  emptyAction: { alignSelf: 'stretch', marginTop: spacing.md },
});
