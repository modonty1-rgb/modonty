import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArticleCard } from '@/src/components/articles/ArticleCard';
import { PublishedArticleCard } from '@/src/components/articles/PublishedArticleCard';
import { DecisionCountBar } from '@/src/components/articles/DecisionCountBar';
import { EmptyState, ErrorState, ListScreenSkeleton, OfflineState } from '@/src/components/ui/MobileUI';
import { articleFallbackText, type ArticleListCollection, type ArticleListItem } from '@/src/services/articles-api';
import { control, darkColors, fonts, lightColors, spacing, typography } from '@/src/theme/tokens';
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
};

const keyOf = (article: ArticleListItem) => article.id;

export function ArticlesApiRoute({ collection, error, siteOpenError, onRetry, onReview, onOpenSite, onRefresh, isRefreshing, offline = false }: ArticlesApiRouteProps) {
  const { mode, theme } = useAppTheme();
  const styles = mode === 'dark' ? darkStyles : lightStyles;
  const insets = useSafeAreaInsets();
  /** The list reserves the tab bar plus the gesture bar, so the last card is never buried. */
  const listContentStyle = useMemo(() => [styles.list, { paddingBottom: control.footerHeight + insets.bottom + spacing.xxl }], [insets.bottom, styles.list]);
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
  const renderItem = useCallback(({ item }: { item: ArticleListItem }) => {
    const isDecision = item.status === 'AWAITING_APPROVAL';
    if (!isDecision) return <PublishedArticleCard
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
  }, [onOpenSite, onReview, openLabelPrefix, reviewActionLabel, siteOpenAccessibilityPrefix, siteOpenLabel]);

  /** دوّارة السحب تأخذ ألوان الماركة: الافتراضي رماديّ النظام ويكاد يختفي على صفحة داكنة. */
  const refreshControl = useMemo(() => <RefreshControl
    refreshing={isRefreshing}
    onRefresh={onRefresh}
    colors={[theme.colors.textInteractive]}
    progressBackgroundColor={theme.colors.surfaceRaised}
    tintColor={theme.colors.textInteractive}
  />, [isRefreshing, onRefresh, theme.colors.textInteractive, theme.colors.surfaceRaised]);

  /** العنصر كان يُبنى داخل الـJSX فيُعاد إنشاؤه مع كل رسم، فيهتزّ رأس القائمة بلا سبب. */
  const listHeader = useMemo(() => collection === null ? null : <View style={styles.header}>
    <Text style={styles.title}>{collection.review.title}</Text>
    {collection.review.subtitle ? <Text style={styles.subtitle}>{collection.review.subtitle}</Text> : null}
    {collection.review.countLabel ? <View style={styles.countBar}><DecisionCountBar label={collection.review.countLabel} /></View> : null}
    {siteOpenError ? <Text style={styles.siteOpenError}>{siteOpenError}</Text> : null}
  </View>, [collection, siteOpenError, styles]);

  if (offline) return <ScrollView contentContainerStyle={styles.state}><OfflineState title={review?.offlineTitle ?? articleFallbackText.offlineTitle} description={review?.offlineDescription ?? articleFallbackText.offlineDescription} retryLabel={review?.retryLabel ?? articleFallbackText.retryLabel} onRetry={onRetry} /></ScrollView>;
  if (error) return <ScrollView contentContainerStyle={styles.state}><ErrorState message={error} retryLabel={review?.retryLabel ?? articleFallbackText.retryLabel} onRetry={onRetry} /></ScrollView>;
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
  state: { flexGrow: 1, paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.md, paddingBottom: control.footerHeight + spacing.xxl },
  list: { paddingBottom: control.footerHeight + spacing.xxl, paddingHorizontal: spacing.screenHorizontal },
  header: { marginBottom: spacing.md, marginTop: spacing.md },
  title: { fontFamily: fonts.medium, fontSize: typography.pageTitle, lineHeight: typography.lineHeightPageTitle, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  subtitle: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, marginTop: spacing.xs, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  countBar: { marginTop: spacing.md },
  siteOpenError: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, marginTop: spacing.sm, textAlign: 'right' as const, writingDirection: 'rtl' as const },
};

const darkStyles = StyleSheet.create({ ...shared, title: { ...shared.title, color: darkColors.text }, subtitle: { ...shared.subtitle, color: darkColors.muted }, siteOpenError: { ...shared.siteOpenError, color: darkColors.errorText } });
const lightStyles = StyleSheet.create({ ...shared, title: { ...shared.title, color: lightColors.text }, subtitle: { ...shared.subtitle, color: lightColors.muted }, siteOpenError: { ...shared.siteOpenError, color: lightColors.errorText } });
