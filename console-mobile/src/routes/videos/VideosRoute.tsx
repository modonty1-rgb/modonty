import { FlashList } from '@shopify/flash-list';
import { useCallback } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { VideoCard } from '@/src/components/videos/VideoCard';
import { EmptyState, ErrorState, ListScreenSkeleton, OfflineState, RefreshNotice } from '@/src/components/ui/MobileUI';
import { EnterView, groupPositionOf, IconShape, LargeTitle, PillButton, SectionHeading, StatStrip, TonalCard, useTabBarClearance } from '@/src/components/ui/Nabd';
import { getVideoCollection, type VideoSummary } from '@/src/services/engagement-api';
import { CONNECTION_COPY, useEngagementResource } from '@/src/services/use-engagement-resource';
import { fonts, nabd, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/**
 * S09 «الطلّات» — «نبض»: عنوان كبير · شريط الأرقام (منشور · قيد المراجعة · مرفوض) من عدّ القاعدة
 * في `/videos` · بطاقة الرفع · ثم «آخر الطلّات» مجموعةً مقطّعة.
 */

type Props = { accessToken: string; onUpload: () => void };

const videoKey = (item: VideoSummary) => item.id;

export function VideosRoute({ accessToken, onUpload }: Props) {
  const { theme } = useAppTheme();
  const clearance = useTabBarClearance();
  const { resource, reload, refresh, isRefreshing, refreshFailure } = useEngagementResource(accessToken, getVideoCollection);
  const collection = resource.data;
  const review = collection?.review;
  const count = collection?.videos.length ?? 0;

  const renderVideo = useCallback(({ item, index }: { item: VideoSummary; index: number }) => <VideoCard item={item} position={groupPositionOf(index, count)} />, [count]);

  if (resource.status === 'loading') return <View style={styles.state}><ListScreenSkeleton count={3} /></View>;
  if (resource.status === 'offline') return <View style={styles.state}><OfflineState title={CONNECTION_COPY.offlineTitle} description={CONNECTION_COPY.offlineDescription} retryLabel={CONNECTION_COPY.retryLabel} onRetry={reload} /></View>;
  if (resource.status === 'error' || collection === null || review === undefined) return <View style={styles.state}><ErrorState message={resource.message ?? CONNECTION_COPY.errorTitle} retryLabel={CONNECTION_COPY.retryLabel} onRetry={reload} /></View>;

  /**
   * الرفع يُعرض **فقط حين يقدر النظام عليه** (`upload.available`). اليوم الخادم يقول لا، فتظهر
   * جملته بدل الزرّ — العميل يعرف من أين يرفع قبل أن يخسر ضغطة ونقلة شاشة.
   */
  const canUpload = collection.upload.available;
  const stats = review.stats ?? [];

  const header = <View style={styles.header}>
    <EnterView index={0}><LargeTitle title={review.title} /></EnterView>
    {refreshFailure ? <RefreshNotice message={refreshFailure.message} offline={refreshFailure.offline} retryLabel={CONNECTION_COPY.retryLabel} onRetry={refresh} /> : null}
    {stats.length > 0 ? <EnterView index={1}><StatStrip stats={stats} /></EnterView> : null}
    <EnterView index={2}>
      {canUpload
        ? <PillButton label={review.uploadActionLabel} icon="upload" onPress={onUpload} />
        : <TonalCard style={styles.uploadCard}>
          <IconShape icon="upload" />
          <Text style={[styles.uploadText, { color: theme.colors.text }]}>{collection.upload.unavailableLabel}</Text>
        </TonalCard>}
    </EnterView>
    {count > 0 ? <EnterView index={3} style={styles.sectionGap}><SectionHeading>{review.latestSectionTitle}</SectionHeading></EnterView> : null}
  </View>;

  /** التلميح نصٌّ لا زرّ — زرّ ثانٍ لنفس الفعل يجعل العميل يوازن بين وعدين متساويين. */
  const footer = canUpload ? <Text style={[styles.hint, { color: theme.colors.muted }]}>{review.uploadHintLabel}</Text> : null;

  return <FlashList
    data={collection.videos}
    renderItem={renderVideo}
    keyExtractor={videoKey}
    contentContainerStyle={[styles.list, { paddingBottom: clearance }]}
    ListHeaderComponent={header}
    ListEmptyComponent={<EmptyState icon="reels" title={review.emptyTitle} copy={review.emptyDescription} actionLabel={canUpload ? review.uploadActionLabel : undefined} onAction={canUpload ? onUpload : undefined} />}
    ListFooterComponent={footer}
    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={theme.colors.textInteractive} colors={[theme.colors.textInteractive]} progressBackgroundColor={theme.colors.surfaceRaised} />}
  />;
}

const styles = StyleSheet.create({
  state: { flex: 1, paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.md, paddingBottom: nabd.tabBarClearance },
  list: { paddingHorizontal: spacing.screenHorizontal },
  header: { gap: spacing.sm, marginBottom: spacing.sm, marginTop: spacing.xxs },
  uploadCard: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.sm },
  uploadText: { flex: 1, fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'right', writingDirection: 'rtl' },
  sectionGap: { marginTop: spacing.xxs },
  hint: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, marginTop: spacing.md, textAlign: 'center', writingDirection: 'rtl' },
});
