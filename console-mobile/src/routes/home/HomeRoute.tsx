import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ModontyIcon, type ModontyIconName } from '@/src/components/brand/icons/ModontyIcon';
import { ErrorState, OfflineState, SkeletonBar } from '@/src/components/ui/MobileUI';
import { networkCopy } from '@/src/services/account-api';
import { MobileDashboard } from '@/src/services/mobile-api';
import { control, fonts, radii, skeleton, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type HomeRouteProps = {
  clientName?: string;
  dashboard: MobileDashboard | null;
  /** Wired from App.tsx; optional so the shell keeps compiling until it is. */
  error?: string | null;
  offline?: boolean;
  onRetry?: () => void;
  onOpenDecisionArticles: () => void;
  onOpenVideos: () => void;
  onOpenAudience: () => void;
  onOpenBookings: () => void;
  /** إعادة قراءة الرئيسية من العقد — بالسحب وعند العودة إليها. */
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenSubscription: () => void;
  onOpenReferral: () => void;
};

const iconByKey: Record<MobileDashboard['actionItems'][number]['key'], ModontyIconName> = {
  approval: 'articles',
  questions: 'question',
  comments: 'comment',
  videos: 'reels',
  bookings: 'comment',
};

const noop = () => undefined;

export function HomeRoute({ clientName, dashboard, error = null, offline = false, onRetry, onOpenDecisionArticles, onOpenVideos, onOpenAudience, onOpenBookings, onRefresh, isRefreshing, onOpenSubscription, onOpenReferral }: HomeRouteProps) {
  const { theme } = useAppTheme();

  if (offline) return <View style={styles.state}><OfflineState title={networkCopy.offlineTitle} description={networkCopy.offlineDescription} retryLabel={networkCopy.retryLabel} onRetry={onRetry ?? noop} /></View>;
  if (error !== null) return <View style={styles.state}><ErrorState message={error} retryLabel={networkCopy.retryLabel} onRetry={onRetry ?? noop} /></View>;
  if (!dashboard) return <View style={styles.state}>
    <SkeletonBar height={skeleton.blockHeight} radius={radii.card} />
    <SkeletonBar height={skeleton.blockHeight} radius={radii.card} />
    <SkeletonBar height={skeleton.cardHeight} radius={radii.card} />
  </View>;

  const cards = dashboard.actionItems.map((item) => ({
    ...item,
    icon: iconByKey[item.key],
    onPress: item.key === 'approval' ? onOpenDecisionArticles : item.key === 'videos' ? onOpenVideos : item.key === 'bookings' ? onOpenBookings : onOpenAudience,
  }));
  const actionTotal = cards.reduce((total, card) => total + card.value, 0);
  const subscriptionStatus = dashboard.subscription?.status;
  const statusColor = subscriptionStatus === 'ACTIVE' ? theme.colors.textInteractive
    : subscriptionStatus === 'EXPIRED' || subscriptionStatus === 'CANCELLED' ? theme.colors.danger
      : theme.colors.warning;

  /**
   * الرئيسية كانت تُقرأ **مرّة واحدة** عند بدء الجلسة ثم لا تسأل العقد أبداً.
   *
   * فيبقى «مهام تحتاج إجراء» على أرقام ونصوص عمرها ساعات: خالد رأى «ردّ على طلبات التواصل ٠»
   * وصفّ «مقالات بانتظار قرارك ٠» بعد ربع ساعة من حذفهما من العقد. والشاشة التي تعلن العمل
   * المنتظِر هي **أسوأ** شاشة تتقادم — يقرأ العميل صفراً فيظنّ أنه فرغ، أو رقماً فيفتح شاشة فارغة.
   * الآن: سحبٌ للتحديث + إعادة قراءة عند العودة إلى التاب (`useReloadOnFocus` في الجذر).
   */
  const refreshControl = <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[theme.colors.textInteractive]} progressBackgroundColor={theme.colors.surfaceRaised} tintColor={theme.colors.textInteractive} />;

  return <ScrollView contentContainerStyle={styles.content} refreshControl={refreshControl} showsVerticalScrollIndicator={false}>
    <View style={styles.pageIntro}>
      <View style={styles.pageTitle}>
        <ModontyIcon name="home" size={control.iconSize} primary={theme.colors.text} accent={theme.colors.accent} />
        <Text maxFontSizeMultiplier={1} style={[styles.pageTitleText, { color: theme.colors.text }]}>{dashboard.review.title}</Text>
      </View>
      <Text maxFontSizeMultiplier={1} numberOfLines={1} style={[styles.greeting, { color: theme.colors.muted }]}>{dashboard.review.greetingPrefix} {clientName ?? dashboard.review.greetingFallback}</Text>
    </View>

    <Pressable accessibilityRole="button" accessibilityLabel={dashboard.referral.hook} onPress={onOpenReferral} style={({ pressed }) => [styles.referral, { borderColor: theme.colors.warning, backgroundColor: theme.colors.surfaceRaised }, pressed && styles.pressed]}>
      <Text maxFontSizeMultiplier={1} style={[styles.referralText, { color: theme.colors.text }]}>{dashboard.referral.hook}</Text>
      <ModontyIcon name="arrow-left" size={control.iconSize} primary={theme.colors.warning} accent={theme.colors.accent} />
    </Pressable>

    {dashboard.subscription ? <View style={styles.subscriptionSection}>
      <Pressable accessibilityRole="button" accessibilityLabel={dashboard.review.subscriptionLabel} onPress={onOpenSubscription} style={({ pressed }) => [styles.subscription, { backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.border }, pressed && styles.pressed]}>
        <Text maxFontSizeMultiplier={1} style={[styles.subscriptionHeading, { color: theme.colors.text }]}>{dashboard.review.subscriptionLabel}</Text>
        <View style={[styles.subscriptionDivider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.subscriptionTopRow}>
          <Text style={[styles.subscriptionTitle, { color: statusColor }]}>{dashboard.subscription.statusLabel}</Text>
          {dashboard.review.daysRemainingText ? <View style={styles.subscriptionDays}>
            <Text style={[styles.daysText, { color: theme.colors.text }]}>{dashboard.review.daysRemainingText}</Text>
            <ModontyIcon name="arrow-left" size={control.iconSize} primary={theme.colors.muted} accent={theme.colors.accent} />
          </View> : null}
        </View>
      </Pressable>
    </View> : null}

    <View style={[styles.actionPanel, { backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.border }]}>
      <View style={styles.actionHeader}>
        <View style={[styles.actionBadge, { backgroundColor: theme.colors.brandFill }]}>
          <Text maxFontSizeMultiplier={1} style={[styles.actionBadgeText, { color: theme.colors.navy }]}>{actionTotal}</Text>
        </View>
        <Text maxFontSizeMultiplier={1} style={[styles.sectionTitle, { color: theme.colors.text }]}>{dashboard.review.actionItemsTitle}</Text>
      </View>
      {actionTotal === 0
        ? <Text style={[styles.actionEmpty, { color: theme.colors.muted }]}>{dashboard.review.noActionItemsLabel}</Text>
        : <View>{cards.map((card, index) => <Pressable
          key={card.key}
          accessibilityRole="button"
          accessibilityLabel={`${card.label} ${card.value}`}
          onPress={card.onPress}
          style={({ pressed }) => [styles.actionCard, index > 0 && { borderTopColor: theme.colors.border, borderTopWidth: StyleSheet.hairlineWidth }, pressed && styles.pressed]}
        >
          <ModontyIcon name={card.icon} size={control.iconSize} primary={card.value === 0 ? theme.colors.muted : theme.colors.text} accent={theme.colors.accent} />
          <Text maxFontSizeMultiplier={1} style={[styles.actionLabel, { color: card.value === 0 ? theme.colors.muted : theme.colors.text }]}>{card.label}</Text>
          {/* Plain number, no chip: S02 draws the count as bare text beside its label. */}
          <Text maxFontSizeMultiplier={1} style={[styles.actionValue, { color: card.value === 0 ? theme.colors.muted : theme.colors.text }]}>{card.value}</Text>
          <ModontyIcon name="arrow-left" size={control.iconSize} primary={theme.colors.muted} accent={theme.colors.accent} />
        </Pressable>)}</View>}
    </View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.screenBottom, paddingHorizontal: spacing.screenHorizontal },
  pressed: { opacity: 0.72 },
  state: { flex: 1, gap: spacing.sm, paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.md },
  pageIntro: { alignItems: 'center', flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: spacing.md },
  pageTitle: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.xs },
  pageTitleText: { fontFamily: fonts.medium, fontSize: typography.pageTitle, lineHeight: typography.lineHeightPageTitle, writingDirection: 'rtl' },
  greeting: { flexShrink: 1, fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'left', writingDirection: 'rtl' },
  referral: { alignItems: 'center', borderRadius: radii.card, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row-reverse', gap: spacing.sm, justifyContent: 'space-between', marginTop: spacing.xl, minHeight: control.minTouchTarget, paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  referralText: { flex: 1, fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl' },
  subscriptionSection: { marginTop: spacing.xl },
  subscription: { borderRadius: radii.card, borderWidth: StyleSheet.hairlineWidth, padding: spacing.md },
  subscriptionHeading: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right', writingDirection: 'rtl' },
  subscriptionDivider: { height: StyleSheet.hairlineWidth, marginVertical: spacing.sm },
  subscriptionTopRow: { alignItems: 'center', flexDirection: 'row-reverse', justifyContent: 'space-between', minHeight: control.minTouchTarget },
  subscriptionTitle: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, writingDirection: 'rtl' },
  subscriptionDays: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.xs },
  daysText: { fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, writingDirection: 'rtl' },
  actionPanel: { borderRadius: radii.card, borderWidth: StyleSheet.hairlineWidth, marginTop: spacing.xl, overflow: 'hidden' },
  // كان 'row' فيُقرأ العدّاد قبل العنوان في واجهة عربية.
  actionHeader: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.xs, justifyContent: 'space-between', padding: spacing.md },
  actionBadge: { alignItems: 'center', borderRadius: radii.field, height: control.iconSize, justifyContent: 'center', minWidth: control.iconSize, paddingHorizontal: spacing.xxs },
  actionBadgeText: { fontFamily: fonts.bold, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary },
  sectionTitle: { flex: 1, fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right', writingDirection: 'rtl' },
  actionEmpty: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, paddingBottom: spacing.md, paddingHorizontal: spacing.md, textAlign: 'right', writingDirection: 'rtl' },
  actionCard: { alignItems: 'center', flexDirection: 'row-reverse', minHeight: control.minTouchTarget, paddingHorizontal: spacing.md },
  // Four counts on one screen, so weight 700 is out (UIUX §4: it is for ONE number).
  actionValue: { fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, marginEnd: spacing.sm, textAlign: 'center' },
  actionLabel: { flex: 1, fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, marginHorizontal: spacing.sm, textAlign: 'right', writingDirection: 'rtl' },
});
