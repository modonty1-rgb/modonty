import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ModontyIcon, type ModontyIconName } from '@/src/components/brand/icons/ModontyIcon';
import { ErrorState, OfflineState, RefreshNotice, SkeletonBar } from '@/src/components/ui/MobileUI';
import { badgeToneOf, Cookie, CountUpText, EnterView, GroupRow, HeroCard, IconShape, LargeTitle, ListGroup, PillButton, Ring, StatusBadge, TonalCard, useTabBarClearance } from '@/src/components/ui/Nabd';
import { networkCopy } from '@/src/services/account-api';
import { arabicDigits } from '@/src/services/engagement-api';
import { MobileDashboard } from '@/src/services/mobile-api';
import { PerformanceCard } from '@/src/components/home/PerformanceCard';
import { control, fonts, nabd, radii, skeleton, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type HomeRouteProps = {
  clientName?: string;
  /** العدّ الحيّ نفسه الذي تحمله شارة تاب التنبيهات — كي لا يختلف الرقمان. */
  unreadCount?: number;
  onOpenNotifications?: () => void;
  /** لبطاقة «زوّارك» التي تُجلب وحدها بعد الرئيسية. */
  accessToken?: string | null;
  dashboard: MobileDashboard | null;
  /** Wired from App.tsx; optional so the shell keeps compiling until it is. */
  error?: string | null;
  offline?: boolean;
  onRetry?: () => void;
  /** فشل تحديثٍ والرئيسية حاضرة: سطرٌ فوقها لا بديلٌ عنها. */
  refreshFailure?: { message: string; offline: boolean } | null;
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
  bookings: 'phone',
};

const noop = () => undefined;

/**
 * S02 الرئيسية — «نبض»: بطلٌ واحد (المهام) ← صفّ بنتو (حلقة الاشتراك + الإحالة) ← قائمة مقطّعة.
 *
 * البطل يحمل **أوّل** مهمّة ومجموع المهام في كعكة، وزرّه يفتحها مباشرةً — فالعميل يرى «ما
 * الذي ينتظرني» قبل أي شيء آخر، وكانت الشاشة تبدأ ببطاقة الإحالة التسويقية. والأرقام كلها من
 * `/dashboard`: لا رقم في الشاشة لا يحمله العقد (الحلقة = الأيّام الباقية ÷ مدّة الطلب الساري).
 */
export function HomeRoute({ clientName, unreadCount = 0, onOpenNotifications, accessToken, dashboard, error = null, offline = false, onRetry, refreshFailure = null, onOpenDecisionArticles, onOpenVideos, onOpenAudience, onOpenBookings, onRefresh, isRefreshing, onOpenSubscription, onOpenReferral }: HomeRouteProps) {
  const { theme } = useAppTheme();
  const clearance = useTabBarClearance();

  /**
   * الشاشة الكاملة للخطأ **فقط لو لا رئيسية أصلاً**. كان أي سحب أو عودة للتاب بلا شبكة
   * يمسح الرئيسية ويضع «Network request failed» مكانها، والبيانات الصالحة في الذاكرة.
   */
  if (offline && !dashboard) return <View style={styles.state}><OfflineState title={networkCopy.offlineTitle} description={networkCopy.offlineDescription} retryLabel={networkCopy.retryLabel} onRetry={onRetry ?? noop} /></View>;
  if (error !== null && !dashboard) return <View style={styles.state}><ErrorState message={error} retryLabel={networkCopy.retryLabel} onRetry={onRetry ?? noop} /></View>;
  if (!dashboard) return <View style={styles.state}>
    <SkeletonBar height={skeleton.titleHeight} width="45%" />
    <SkeletonBar height={skeleton.cardHeight} radius={nabd.heroRadius} />
    <SkeletonBar height={skeleton.blockHeight} radius={radii.card} />
  </View>;

  const items = dashboard.actionItems.map((item) => ({
    ...item,
    icon: iconByKey[item.key],
    onPress: item.key === 'approval' ? onOpenDecisionArticles : item.key === 'videos' ? onOpenVideos : item.key === 'bookings' ? onOpenBookings : onOpenAudience,
  }));
  const actionTotal = items.reduce((total, item) => total + item.value, 0);
  const [first, ...rest] = items;
  const subscription = dashboard.subscription;
  const daysRemaining = subscription?.daysRemaining ?? null;
  const durationDays = subscription?.durationDays ?? null;
  const ringProgress = daysRemaining !== null && durationDays ? daysRemaining / durationDays : null;

  /**
   * الرئيسية كانت تُقرأ **مرّة واحدة** عند بدء الجلسة ثم لا تسأل العقد أبداً، فيبقى «مهام تحتاج
   * إجراء» على أرقام عمرها ساعات. الآن: سحبٌ للتحديث + إعادة قراءة عند العودة إلى التاب.
   */
  const refreshControl = <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[theme.colors.textInteractive]} progressBackgroundColor={theme.colors.surfaceRaised} tintColor={theme.colors.textInteractive} />;

  return <ScrollView contentContainerStyle={[styles.content, { paddingBottom: clearance }]} refreshControl={refreshControl} showsVerticalScrollIndicator={false}>
    {refreshFailure ? <RefreshNotice message={refreshFailure.message} offline={refreshFailure.offline} retryLabel={networkCopy.retryLabel} onRetry={onRefresh} /> : null}
    <EnterView index={0}>
      <LargeTitle title={dashboard.review.title} subtitle={`${dashboard.review.greetingPrefix} ${clientName ?? dashboard.review.greetingFallback}`} />
    </EnterView>

    {/*
      * سطر التنبيهات الجديدة: الضغط على إشعار والتطبيق مقفول يفتح الرئيسية لا وجهته (خلل Expo
      * #49254، ملاحظة ٧) — فالتنبيه يجب أن يكون أوّل ما يراه العميل هنا، بضغطة تفتح التنبيهات.
      */}
    {unreadCount > 0 && dashboard.review.unreadBannerTemplate && onOpenNotifications ? <EnterView index={1}>
      <TonalCard tone="warning" onPress={onOpenNotifications} accessibilityLabel={dashboard.review.unreadBannerTemplate.replace('{count}', arabicDigits(unreadCount))} style={styles.unreadBanner}>
        <ModontyIcon name="notifications" size={control.iconSize} primary={theme.colors.onWarningContainer} accent={theme.colors.accent} />
        <Text maxFontSizeMultiplier={1.2} style={[styles.unreadText, { color: theme.colors.onWarningContainer }]}>{dashboard.review.unreadBannerTemplate.replace('{count}', arabicDigits(unreadCount))}</Text>
        <ModontyIcon name="arrow-left" size={control.iconSizeSmall} primary={theme.colors.onWarningContainer} accent={theme.colors.accent} />
      </TonalCard>
    </EnterView> : null}

    <EnterView index={1}>
      <HeroCard>
        <View style={styles.heroHead}>
          <Text maxFontSizeMultiplier={1} style={[styles.heroLabel, { color: theme.colors.onHeroMuted }]}>{dashboard.review.actionItemsTitle}</Text>
          {first ? <ModontyIcon name="arrow-left" size={control.iconSizeSmall} primary={theme.colors.onHero} accent={theme.colors.accent} /> : null}
        </View>
        <View style={styles.heroRow}>
          <Cookie size={nabd.cookieSize} color={theme.colors.heroNumeral}>
            <CountUpText onceKey="home-hero-total" value={actionTotal} format={arabicDigits} style={[styles.cookieNumeral, { color: theme.colors.onHero }]} />
          </Cookie>
          <View style={styles.heroCopy}>
            {first ? <>
              {dashboard.review.firstActionLabel ? <Text style={[styles.secondary, { color: theme.colors.onHeroMuted }]}>{dashboard.review.firstActionLabel}</Text> : null}
              <Text style={[styles.heroTitle, { color: theme.colors.onHero }]}>{first.label}</Text>
            </> : <Text style={[styles.heroTitle, { color: theme.colors.onHero }]}>{dashboard.review.noActionItemsLabel}</Text>}
          </View>
        </View>
        {first ? <PillButton tone="onHero" label={first.actionLabel ?? first.label} icon="arrow-left" onPress={first.onPress} style={styles.heroAction} accessibilityLabel={`${first.actionLabel ?? first.label} ${arabicDigits(first.value)}`} /> : null}
      </HeroCard>
    </EnterView>

    <EnterView index={2} style={styles.bento}>
      {subscription ? <TonalCard style={styles.tile} onPress={onOpenSubscription} accessibilityLabel={`${dashboard.review.subscriptionLabel} ${subscription.statusLabel} ${dashboard.review.daysRemainingText ?? ''}`.trim()}>
        <View style={styles.subscriptionTile}>
          {ringProgress !== null && daysRemaining !== null
            ? <Ring size={nabd.ringSize} stroke={nabd.ringStroke} progress={ringProgress} color={theme.colors.brandFill} track={theme.colors.surfaceHigh} onceKey="home-subscription-ring">
              <Text maxFontSizeMultiplier={1} style={[styles.ringNumeral, { color: theme.colors.text }]}>{arabicDigits(daysRemaining)}</Text>
            </Ring>
            : <IconShape icon="clock" />}
          <View style={styles.tileCopy}>
            <Text maxFontSizeMultiplier={1.2} style={[styles.secondary, { color: theme.colors.muted }]}>{dashboard.review.subscriptionLabel}</Text>
            {dashboard.review.daysRemainingText ? <Text maxFontSizeMultiplier={1.2} style={[styles.tileLabel, { color: theme.colors.text }]}>{dashboard.review.daysRemainingText}</Text> : null}
            <StatusBadge label={subscription.statusLabel} tone={subscription.statusTone === 'positive' ? 'positive' : badgeToneOf(subscription.statusTone)} />
          </View>
        </View>
      </TonalCard> : null}
      <TonalCard tone="tertiary" style={[styles.tile, styles.referralTile]} onPress={onOpenReferral} accessibilityLabel={dashboard.referral.hook}>
        <View style={styles.referralHead}>
          <ModontyIcon name="offers" size={control.iconSize} primary={theme.colors.onTertiary} accent={theme.colors.accent} />
          <ModontyIcon name="arrow-left" size={control.iconSizeSmall} primary={theme.colors.onTertiary} accent={theme.colors.accent} />
        </View>
        <Text maxFontSizeMultiplier={1.2} style={[styles.tileLabel, { color: theme.colors.onTertiary }]}>{dashboard.referral.hook}</Text>
      </TonalCard>
    </EnterView>

    {rest.length > 0 ? <EnterView index={3}>
      <ListGroup>
        {rest.map((item) => <GroupRow key={item.key} onPress={item.onPress} accessibilityLabel={`${item.label} ${arabicDigits(item.value)}`} style={styles.taskRow}>
          <View style={styles.taskInner}>
            <IconShape icon={item.icon} size={nabd.rowShapeSize} />
            <Text style={[styles.taskLabel, { color: theme.colors.text }]}>{item.label}</Text>
            <Text maxFontSizeMultiplier={1} style={[styles.taskValue, { color: theme.colors.text }]}>{arabicDigits(item.value)}</Text>
            <ModontyIcon name="arrow-left" size={control.iconSizeSmall} primary={theme.colors.muted} accent={theme.colors.accent} />
          </View>
        </GroupRow>)}
      </ListGroup>
    </EnterView> : null}

    {accessToken ? <EnterView index={4}><PerformanceCard accessToken={accessToken} /></EnterView> : null}
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { gap: spacing.sm, paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.xxs },
  state: { flex: 1, gap: spacing.sm, paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.md },
  unreadBanner: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.sm },
  unreadText: { flex: 1, fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'right', writingDirection: 'rtl' },
  heroHead: { alignItems: 'center', flexDirection: 'row-reverse', justifyContent: 'space-between' },
  heroLabel: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'right', writingDirection: 'rtl' },
  heroRow: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.md },
  heroCopy: { flex: 1, minWidth: 0 },
  heroTitle: { fontFamily: fonts.bold, fontSize: typography.heroTitle, lineHeight: typography.lineHeightHeroTitle, textAlign: 'right', writingDirection: 'rtl' },
  cookieNumeral: { fontFamily: fonts.extraBold, fontSize: typography.cookieNumeral, lineHeight: typography.lineHeightCookieNumeral, paddingTop: spacing.xxs, textAlign: 'center' },
  heroAction: { alignSelf: 'flex-end' },
  secondary: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl' },
  bento: { flexDirection: 'row-reverse', gap: spacing.sm },
  tile: { flex: 1, borderRadius: nabd.tileRadius, padding: spacing.sm },
  subscriptionTile: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.xs },
  ringNumeral: { fontFamily: fonts.bold, fontSize: typography.ringNumeral, lineHeight: typography.lineHeightRingNumeral, textAlign: 'center' },
  tileCopy: { flex: 1, gap: spacing.xxs, minWidth: 0 },
  tileLabel: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl' },
  referralTile: { justifyContent: 'space-between', gap: spacing.xs },
  referralHead: { alignItems: 'center', flexDirection: 'row-reverse', justifyContent: 'space-between' },
  taskRow: { paddingVertical: nabd.rowPaddingY },
  taskInner: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.sm, minHeight: control.minTouchTarget - spacing.xs },
  taskLabel: { flex: 1, fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl' },
  taskValue: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection },
});
