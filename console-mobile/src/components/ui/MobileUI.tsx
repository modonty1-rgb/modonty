import { Pressable, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ReactNode } from 'react';
import { ModontyIcon, ModontyIconName } from '@/src/components/brand/icons/ModontyIcon';
import { control, fonts, nabd, radii, skeleton, spacing, typography } from '@/src/theme/tokens';
import { PillButton, StatusBadge } from '@/src/components/ui/Nabd';
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
  // «نبض»: البطاقة نغمية — لونها يفصلها عن الأرضية، بلا حدّ ١px.
  return <View style={[styles.card, { backgroundColor: theme.colors.surface }, style]}>{children}</View>;
}

export function SectionTitle({ children, actionLabel, onAction }: { children: string; actionLabel?: string; onAction?: () => void }) {
  const { theme } = useAppTheme();
  return <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{children}</Text>{actionLabel && onAction ? <Pressable onPress={onAction} accessibilityRole="button" accessibilityLabel={actionLabel} style={styles.sectionActionTarget}><Text style={[styles.sectionAction, { color: theme.colors.textInteractive }]}>{actionLabel}</Text></Pressable> : null}</View>;
}

/** حالةٌ نغمية: نصّ + رمز + لون (`StatusBadge`). */
export function StatusPill({ children, tone = 'primary' }: { children: string; tone?: 'primary' | 'warning' | 'danger' | 'muted' }) {
  return <StatusBadge label={children} tone={tone === 'primary' ? 'positive' : tone === 'muted' ? 'neutral' : tone} />;
}

export function PrimaryAction({ label, icon, onPress, style, tone = 'primary' }: { label: string; icon?: ModontyIconName; onPress: () => void; style?: StyleProp<ViewStyle>; tone?: 'primary' | 'secondary' }) {
  return <PillButton label={label} icon={icon} onPress={onPress} tone={tone} size="medium" style={style} />;
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

/**
 * فشلُ **تحديث** فوق بيانات صالحة: سطر صغير فوق المحتوى، والمحتوى يبقى.
 *
 * كان فشل السحب أو العودة للتاب يمسح الشاشة كلها ويضع مكانها بطاقة خطأ — فيخسر العميل
 * ما كان يقرؤه بسبب نفقٍ عابر. والعكس كان أسوأ في شاشات أخرى: يُبتلع الفشل بلا كلمة.
 * هنا الاثنان معاً: البيانات القديمة ظاهرة، وسطرٌ يقول إنها لم تتحدّث ومعه «إعادة المحاولة».
 */
export function RefreshNotice({ message, offline, retryLabel, onRetry }: { message: string; offline: boolean; retryLabel: string; onRetry: () => void }) {
  const { theme } = useAppTheme();
  const tone = offline ? theme.colors.onWarningContainer : theme.colors.onDangerContainer;
  return <View accessibilityLiveRegion="polite" style={[styles.notice, { backgroundColor: offline ? theme.colors.warningContainer : theme.colors.dangerContainer }]}>
    <ModontyIcon name={offline ? 'info' : 'error'} size={control.iconSize} primary={tone} accent={theme.colors.accent} />
    <Text style={[styles.noticeText, { color: offline ? theme.colors.onWarningContainer : theme.colors.onDangerContainer }]}>{message}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={retryLabel} onPress={onRetry} style={({ pressed }) => [styles.noticeAction, pressed && styles.noticePressed]}>
      <Text maxFontSizeMultiplier={1.3} style={[styles.noticeActionText, { color: offline ? theme.colors.onWarningContainer : theme.colors.onDangerContainer }]}>{retryLabel}</Text>
    </Pressable>
  </View>;
}

const styles = StyleSheet.create({
  notice: { alignItems: 'center', borderRadius: nabd.statRadius, flexDirection: 'row-reverse', gap: spacing.xs, marginTop: spacing.sm, paddingHorizontal: spacing.sm },
  noticeText: { flex: 1, fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, paddingVertical: spacing.xs, textAlign: 'right', writingDirection: 'rtl' },
  noticeAction: { alignItems: 'center', justifyContent: 'center', minHeight: control.minTouchTarget, minWidth: control.minTouchTarget, paddingHorizontal: spacing.xs },
  noticeActionText: { fontFamily: fonts.bold, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textDecorationLine: 'underline', writingDirection: 'rtl' },
  noticePressed: { opacity: 0.72 },
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
  card: { borderRadius: nabd.cardRadius, padding: spacing.md },
  sectionHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xl, marginBottom: spacing.sm },
  sectionTitle: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, writingDirection: 'rtl' },
  sectionActionTarget: { alignItems: 'center', justifyContent: 'center', minHeight: control.minTouchTarget, minWidth: control.minTouchTarget },
  sectionAction: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, writingDirection: 'rtl' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl },
  emptyTitle: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, writingDirection: 'rtl', marginTop: spacing.md, textAlign: 'center' },
  emptyCopy: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, writingDirection: 'rtl', marginTop: spacing.xs, textAlign: 'center' },
  emptyAction: { alignSelf: 'stretch', marginTop: spacing.md },
});
