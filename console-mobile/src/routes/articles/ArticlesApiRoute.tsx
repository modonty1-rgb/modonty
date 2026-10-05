import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ArticleCard } from '@/src/components/articles/ArticleCard';
import { PublishedArticleCard } from '@/src/components/articles/PublishedArticleCard';
import { DecisionCountBar } from '@/src/components/articles/DecisionCountBar';
import { EmptyState, ErrorState, ListScreenSkeleton, OfflineState, RefreshNotice } from '@/src/components/ui/MobileUI';
import { EnterView, groupPositionOf, LargeTitle, StatStrip, TonalCard, useTabBarClearance } from '@/src/components/ui/Nabd';
import { articleFallbackText, type ArticleListCollection, type ArticleListItem } from '@/src/services/articles-api';
import type { RefreshFailure } from '@/src/services/use-engagement-resource';
import { darkColors, fonts, lightColors, nabd, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type ArticlesApiRouteProps = {
  collection: ArticleListCollection | null;
  error: string | null;
  siteOpenError: string | null;
  onRetry: () => void;
  onReview: (id: string) => void;
  onOpenSite: (url: string) => void;
  /** Set when the request never reached a server — «ما في اتصال» is its own state. */
  offline?: boolean;
  /**
   * السحب للتحديث. الشاشة طابور قرارات يتغيّر من الأدمن بينما العميل ينظر إليه،
   * ولم يكن فيها أي مسار تحديث يدوي — لا زرّ ولا سحبة — فالوسيلة الوحيدة كانت
   * الخروج من الشاشة والعودة. `onRefresh`/`refreshing` موثّقان في FlashList v2.
   */
  onRefresh: () => void;
  isRefreshing: boolean;
  /** تحديثٌ فشل والقائمة حاضرة — سطرٌ فوقها، والقائمة باقية. */
  refreshFailure?: RefreshFailure | null;
};

const keyOf = (article: ArticleListItem) => article.id;

export function ArticlesApiRoute({ collection, error, siteOpenError, onRetry, onReview, onOpenSite, onRefresh, isRefreshing, offline = false, refreshFailure = null }: ArticlesApiRouteProps) {
  const { mode, theme } = useAppTheme();
  const styles = mode === 'dark' ? darkStyles : lightStyles;
  /** الشريط العائم يغطّي آخر القائمة — المحتوى يحجز ١٠٠ + شريط الإيماءة (هامش «نبض»). */
  const clearance = useTabBarClearance();
  const listContentStyle = useMemo(() => [styles.list, { paddingBottom: clearance }], [clearance, styles.list]);
  const articleCount = collection?.articles.length ?? 0;
  const review = collection?.review;
  const openLabelPrefix = review?.openLabelPrefix ?? '';
  const siteOpenLabel = review?.openSiteLabel;
  const siteOpenAccessibilityPrefix = review?.openSiteAccessibilityPrefix;
  const reviewActionLabel = review?.reviewActionLabel;
  /**
   * بطاقتان لوظيفتين، لا بطاقة بمفاتيح.
   *
   * S05 طابور قرارات يُمسح بالعين → صفّ مضغوط بمصغّرة ٨٠dp. وS11 عرضٌ يقود إلى الموقع →
   * صورة كاملة وعنوان بلا قصّ ونبذة، والضغطة تفتح المتصفّح لا شاشةً داخلية. الفرق ليس
   * تجميلياً: كل فتحة من هنا زيارة حقيقية لموقع العميل.
   */
  const renderItem = useCallback(({ item, index }: { item: ArticleListItem; index: number }) => {
    const isDecision = item.status === 'AWAITING_APPROVAL';
    if (!isDecision) return <PublishedArticleCard
      position={groupPositionOf(index, articleCount)}
      article={item}
      accessibilityLabel={siteOpenAccessibilityPrefix ? `${siteOpenAccessibilityPrefix} ${item.title}` : item.title}
      openLabel={siteOpenLabel ?? ''}
      onOpen={onOpenSite}
    />;
    return <ArticleCard
      article={item}
      variant={isDecision ? 'decision' : 'published'}
      accessibilityLabel={`${openLabelPrefix} ${item.title}`}
      onPress={isDecision ? onReview : undefined}
      onOpenSite={onOpenSite}
      reviewActionLabel={isDecision ? reviewActionLabel : undefined}
      siteOpenLabel={siteOpenLabel}
      siteOpenAccessibilityLabel={siteOpenAccessibilityPrefix ? `${siteOpenAccessibilityPrefix} ${item.title}` : undefined}
    />;
  }, [articleCount, onOpenSite, onReview, openLabelPrefix, reviewActionLabel, siteOpenAccessibilityPrefix, siteOpenLabel]);

  /** دوّارة السحب تأخذ ألوان الماركة: الافتراضي رماديّ النظام ويكاد يختفي على صفحة داكنة. */
  const refreshControl = useMemo(() => <RefreshControl
    refreshing={isRefreshing}
    onRefresh={onRefresh}
    colors={[theme.colors.textInteractive]}
    progressBackgroundColor={theme.colors.surfaceRaised}
    tintColor={theme.colors.textInteractive}
  />, [isRefreshing, onRefresh, theme.colors.textInteractive, theme.colors.surfaceRaised]);

  /** العنصر كان يُبنى داخل الـJSX فيُعاد إنشاؤه مع كل رسم، فيهتزّ رأس القائمة بلا سبب. */
  /**
   * «نبض»: عنوان كبير ثم الأرقام — شريط ثلاث خلايا للقرارات (بانتظارك · أسئلة الفريق ·
   * استشهادات) وبلاطتان للمنشورة (العدد · آخر نشر). الأرقام والتسميات من `review.stats`؛
   * والخادم الأقدم بلا `stats` يرجع لشريط العدّ القديم.
   */
  const stats = collection?.review.stats ?? [];
  const isPublished = collection !== null && collection.review.openSiteLabel !== undefined;
  const listHeader = useMemo(() => collection === null ? null : <View style={styles.header}>
    <EnterView index={0}><LargeTitle title={collection.review.title} subtitle={collection.review.subtitle} /></EnterView>
    {stats.length > 0
      ? <EnterView index={1}>{isPublished
        ? <View style={styles.tiles}>{stats.map((stat) => <TonalCard key={stat.key} style={styles.tile}>
          {stat.key === 'lastPublished' ? <>
            <Text style={styles.subtitle}>{stat.label}</Text>
            <Text style={styles.tileLabel}>{stat.value}</Text>
          </> : <>
            <Text maxFontSizeMultiplier={1} style={styles.tileNumeral}>{stat.value}</Text>
            <Text style={styles.subtitle}>{stat.label}</Text>
          </>}
        </TonalCard>)}</View>
        : <StatStrip stats={stats} />}</EnterView>
      : collection.review.countLabel ? <View style={styles.countBar}><DecisionCountBar label={collection.review.countLabel} /></View> : null}
    {siteOpenError ? <Text style={styles.siteOpenError}>{siteOpenError}</Text> : null}
    {refreshFailure ? <RefreshNotice message={refreshFailure.message} offline={refreshFailure.offline} retryLabel={collection.review.retryLabel} onRetry={onRefresh} /> : null}
  </View>, [collection, isPublished, onRefresh, refreshFailure, siteOpenError, stats, styles]);

  // القائمة الحاضرة لا تُهدم بفشل تحديث — الحالتان أدناه للجلب الأوّل وحده.
  if (offline && collection === null) return <ScrollView contentContainerStyle={styles.state}><OfflineState title={review?.offlineTitle ?? articleFallbackText.offlineTitle} description={review?.offlineDescription ?? articleFallbackText.offlineDescription} retryLabel={review?.retryLabel ?? articleFallbackText.retryLabel} onRetry={onRetry} /></ScrollView>;
  if (error && collection === null) return <ScrollView contentContainerStyle={styles.state}><ErrorState message={error} retryLabel={review?.retryLabel ?? articleFallbackText.retryLabel} onRetry={onRetry} /></ScrollView>;
  if (collection === null) return <View style={styles.state}><ListScreenSkeleton count={3} withSubtitle /></View>;
  /**
   * الحالة الفارغة **داخل** القائمة لا بديلاً عنها — ثلاثة أعطال في فرع واحد:
   *
   * 1. **زرّ «إعادة المحاولة»:** نصّ حالة خطأ تسرّب إلى حالة نجاح. لا شيء فشل — الطابور
   *    فارغ لأن العميل أنهى عمله، والزرّ يدعوه لإصلاح ما ليس مكسوراً.
   * 2. **الرأس كان يختفي:** العنوان والعنوان الفرعي يذهبان مع القائمة، فتفقد الشاشة هويتها
   *    ويقف العميل أمام بطاقة معلّقة لا يعرف أين هو منها.
   * 3. **السحب للتحديث كان يموت:** الفرع الفارغ كان `ScrollView`، فالشاشة التي **أحوج** ما
   *    تكون لإعادة السؤال «هل وصل جديد؟» هي الوحيدة التي لا تُسحب.
   */
  return <FlashList
    data={collection.articles}
    renderItem={renderItem}
    keyExtractor={keyOf}
    contentContainerStyle={listContentStyle}
    refreshControl={refreshControl}
    ListHeaderComponent={listHeader}
    ListEmptyComponent={<EmptyState icon="articles" title={collection.review.emptyTitle} copy={collection.review.emptyDescription} />}
  />;
}

const shared = {
  state: { flexGrow: 1, paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.md, paddingBottom: nabd.tabBarClearance },
  list: { paddingHorizontal: spacing.screenHorizontal },
  header: { gap: spacing.sm, marginBottom: spacing.sm, marginTop: spacing.xxs },
  subtitle: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  countBar: { marginTop: spacing.xxs },
  tiles: { flexDirection: 'row-reverse' as const, gap: spacing.sm },
  tile: { borderRadius: nabd.tileRadius, flex: 1, gap: spacing.xxs, minHeight: nabd.ringSize + spacing.md, padding: spacing.sm },
  tileNumeral: { fontFamily: fonts.medium, fontSize: typography.tileNumeral, lineHeight: typography.lineHeightTileNumeral, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  tileLabel: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  siteOpenError: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, marginTop: spacing.sm, textAlign: 'right' as const, writingDirection: 'rtl' as const },
};

const darkStyles = StyleSheet.create({ ...shared, tileNumeral: { ...shared.tileNumeral, color: darkColors.text }, tileLabel: { ...shared.tileLabel, color: darkColors.text }, subtitle: { ...shared.subtitle, color: darkColors.muted }, siteOpenError: { ...shared.siteOpenError, color: darkColors.errorText } });
const lightStyles = StyleSheet.create({ ...shared, tileNumeral: { ...shared.tileNumeral, color: lightColors.text }, tileLabel: { ...shared.tileLabel, color: lightColors.text }, subtitle: { ...shared.subtitle, color: lightColors.muted }, siteOpenError: { ...shared.siteOpenError, color: lightColors.errorText } });
