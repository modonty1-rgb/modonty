import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo, useState } from 'react';
import { Linking, RefreshControl, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { loadReelPlayer } from '@/src/components/videos/load-reel-player';
import { ReelTile } from '@/src/components/videos/ReelTile';
import { EmptyState, ErrorState, ListScreenSkeleton, OfflineState, RefreshNotice } from '@/src/components/ui/MobileUI';
import { EnterView, LargeTitle, PillButton, SectionHeading, StatStrip, TonalCard, useTabBarClearance } from '@/src/components/ui/Nabd';
import { getVideoCollection, type VideoSummary } from '@/src/services/engagement-api';
import { CONNECTION_COPY, useEngagementResource } from '@/src/services/use-engagement-resource';
import { control, fonts, nabd, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/**
 * S09 «الطلّات» — «نبض»: عنوان كبير · شريط الأرقام (منشور · قيد المراجعة · مرفوض) من عدّ القاعدة
 * في `/videos` · بطاقة الرفع · ثم «آخر الطلّات» **شبكة عمودية ٩:١٦** تفتح مشغّلاً ملء الشاشة.
 *
 * كانت صفوفاً بمصغّرة ١٢٨×٧٢ واسم الملف، والفيديو لا يُشغَّل (خالد ٥ أكتوبر ٢٠٢٦). الطلّة تُصوَّر
 * عمودية، فالمصغّرة العريضة كانت تقصّ نصفها، واسم الملف (`IMG_2041.mp4`) لا يعرّف العميل بشيء.
 */

type Props = { accessToken: string; onUpload: () => void };

/** عمودان: عرض ≈١٦٠ على ٣٦٠ — تتّسع شارة «قيد المراجعة» ولا تُقصّ؛ ثلاثة تضغطها لـ١٠٥. */
const COLUMNS = 2;

type ReelRow = { key: string; items: { item: VideoSummary; index: number }[] };

const rowKey = (row: ReelRow) => row.key;

// يُقرأ مرّة: غيابه (بناء قبل `expo-video`) ثابت طوال عمر التطبيق.
const ReelPlayer = loadReelPlayer();

export function VideosRoute({ accessToken, onUpload }: Props) {
  const { theme } = useAppTheme();
  const clearance = useTabBarClearance();
  const { resource, reload, refresh, isRefreshing, refreshFailure } = useEngagementResource(accessToken, getVideoCollection);
  const collection = resource.data;
  const review = collection?.review;
  const videos = collection?.videos;
  const count = videos?.length ?? 0;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  /**
   * صفوف من اثنين يرسمها الصفّ نفسه `row-reverse`: `numColumns` في FlashList يرتّب يساراً←يميناً،
   * فتقع أحدث طلّة في الطرف الأيسر بينما العين العربية تبدأ يميناً.
   */
  const rows = useMemo<ReelRow[]>(() => {
    const list = videos ?? [];
    const result: ReelRow[] = [];
    for (let start = 0; start < list.length; start += COLUMNS) {
      const items = list.slice(start, start + COLUMNS).map((item, offset) => ({ item, index: start + offset }));
      result.push({ key: items.map((entry) => entry.item.id).join(':'), items });
    }
    return result;
  }, [videos]);

  const canPlay = ReelPlayer !== null && review?.playerBackLabel !== undefined;
  const openPlayer = useCallback((index: number) => setOpenIndex(index), []);
  const renderRow = useCallback(({ item: row }: { item: ReelRow }) => <View style={styles.row}>
    {row.items.map(({ item, index }) => <ReelTile key={item.id} item={item} index={index} openPrefix={review?.openPrefix ?? null} onOpen={canPlay ? openPlayer : null} />)}
    {row.items.length < COLUMNS ? <View style={styles.filler} /> : null}
  </View>, [canPlay, openPlayer, review?.openPrefix]);

  if (resource.status === 'loading') return <View style={styles.state}><ListScreenSkeleton count={3} /></View>;
  if (resource.status === 'offline') return <View style={styles.state}><OfflineState title={CONNECTION_COPY.offlineTitle} description={CONNECTION_COPY.offlineDescription} retryLabel={CONNECTION_COPY.retryLabel} onRetry={reload} /></View>;
  if (resource.status === 'error' || collection === null || review === undefined) return <View style={styles.state}><ErrorState message={resource.message ?? CONNECTION_COPY.errorTitle} retryLabel={CONNECTION_COPY.retryLabel} onRetry={reload} /></View>;

  /**
   * الرفع يُعرض **فقط حين يقدر النظام عليه** (`upload.available`). اليوم الخادم يقول لا، فتظهر
   * جملته بدل الزرّ — العميل يعرف من أين يرفع قبل أن يخسر ضغطة ونقلة شاشة.
   */
  const upload = collection.upload;
  const canUpload = upload.available;
  const stats = review.stats ?? [];

  /**
   * بطاقة «الرفع غير متاح» **معلومة لا زرّ** (خالد ٥ أكتوبر ٢٠٢٦: «أيقونة الرفع شكلها زرّ ولا تعمل
   * شيئاً»): رمز «معلومة» بلا دائرة ملوّنة — الدائرة في «نبض» شكل الفعل. والفعل الحقيقي الوحيد
   * فيها **العنوان نفسه**: رابطٌ يُضغط ويفتح المتصفّح، من الخادم لا مكتوباً هنا.
   */
  const consoleUrl = upload.consoleUrl;
  const openConsole = consoleUrl ? () => { void Linking.openURL(consoleUrl).catch(() => undefined); } : undefined;
  const unavailableCard = <TonalCard style={styles.uploadCard}>
    <View style={styles.infoIcon}><ModontyIcon name="info" size={control.iconSize} primary={theme.colors.muted} accent={theme.colors.accent} /></View>
    <Text style={[styles.uploadText, { color: theme.colors.text }]}>
      {upload.unavailableText && upload.consoleLinkLabel && openConsole
        ? <>
          {`${upload.unavailableText} `}
          <Text accessibilityRole="link" onPress={openConsole} suppressHighlighting={false} style={[styles.link, { color: theme.colors.textInteractive }]}>{upload.consoleLinkLabel}</Text>
        </>
        : upload.unavailableLabel}
    </Text>
  </TonalCard>;

  const header = <View style={styles.header}>
    <EnterView index={0}><LargeTitle title={review.title} /></EnterView>
    {refreshFailure ? <RefreshNotice message={refreshFailure.message} offline={refreshFailure.offline} retryLabel={CONNECTION_COPY.retryLabel} onRetry={refresh} /> : null}
    {stats.length > 0 ? <EnterView index={1}><StatStrip stats={stats} /></EnterView> : null}
    <EnterView index={2}>{canUpload ? <PillButton label={review.uploadActionLabel} icon="upload" onPress={onUpload} /> : unavailableCard}</EnterView>
    {count > 0 ? <EnterView index={3} style={styles.sectionGap}><SectionHeading>{review.latestSectionTitle}</SectionHeading></EnterView> : null}
  </View>;

  /** التلميح نصٌّ لا زرّ — زرّ ثانٍ لنفس الفعل يجعل العميل يوازن بين وعدين متساويين. */
  const footer = canUpload ? <Text style={[styles.hint, { color: theme.colors.muted }]}>{review.uploadHintLabel}</Text> : null;

  return <>
    <FlashList
      data={rows}
      renderItem={renderRow}
      keyExtractor={rowKey}
      contentContainerStyle={[styles.list, { paddingBottom: clearance }]}
      ListHeaderComponent={header}
      ListEmptyComponent={<EmptyState icon="reels" title={review.emptyTitle} copy={review.emptyDescription} actionLabel={canUpload ? review.uploadActionLabel : undefined} onAction={canUpload ? onUpload : undefined} />}
      ListFooterComponent={footer}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={theme.colors.textInteractive} colors={[theme.colors.textInteractive]} progressBackgroundColor={theme.colors.surfaceRaised} />}
    />
    {ReelPlayer !== null && openIndex !== null && videos && review.playerBackLabel ? <ReelPlayer
      videos={videos}
      initialIndex={Math.min(openIndex, videos.length - 1)}
      copy={{
        backLabel: review.playerBackLabel,
        playLabel: review.playLabel ?? '',
        pauseLabel: review.pauseLabel ?? '',
        rejectionTitle: review.rejectionTitle ?? '',
        videoNotReadyLabel: review.videoNotReadyLabel ?? '',
        playbackErrorLabel: review.playbackErrorLabel ?? '',
      }}
      onClose={() => setOpenIndex(null)}
    /> : null}
  </>;
}

const styles = StyleSheet.create({
  state: { flex: 1, paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.md, paddingBottom: nabd.tabBarClearance },
  list: { paddingHorizontal: spacing.screenHorizontal },
  header: { gap: spacing.sm, marginBottom: spacing.sm, marginTop: spacing.xxs },
  row: { flexDirection: 'row-reverse', gap: spacing.xs, marginBottom: spacing.xs },
  filler: { flex: 1 },
  uploadCard: { alignItems: 'flex-start', flexDirection: 'row-reverse', gap: spacing.sm },
  infoIcon: { paddingTop: spacing.xxs },
  uploadText: { flex: 1, fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'right', writingDirection: 'rtl' },
  // الرابط مسطَّر ولونه لون الفعل: يُعرف أنه يُضغط بلا أن يصير زرّاً.
  link: { fontFamily: fonts.bold, textDecorationLine: 'underline' },
  sectionGap: { marginTop: spacing.xxs },
  hint: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, marginTop: spacing.md, textAlign: 'center', writingDirection: 'rtl' },
});
