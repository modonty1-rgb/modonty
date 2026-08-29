import { FlashList } from '@shopify/flash-list';
import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { VideoCard } from '@/src/components/videos/VideoCard';
import { EmptyState, ErrorState, ListScreenSkeleton, OfflineState } from '@/src/components/ui/MobileUI';
import { getVideoCollection, type VideoSummary } from '@/src/services/engagement-api';
import { CONNECTION_COPY, useEngagementResource } from '@/src/services/use-engagement-resource';
import { control, fonts, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/** S09 «الطلّات» — what the client uploaded, and the one way in to uploading more. */

type Props = { accessToken: string; onUpload: () => void };

const videoKey = (item: VideoSummary) => item.id;

export function VideosRoute({ accessToken, onUpload }: Props) {
  const { theme } = useAppTheme();
  const { resource, reload } = useEngagementResource(accessToken, getVideoCollection);
  const collection = resource.data;
  const review = collection?.review;

  const renderVideo = useCallback(({ item }: { item: VideoSummary }) => <VideoCard item={item} />, []);

  if (resource.status === 'loading') return <View style={styles.state}><ListScreenSkeleton count={3} /></View>;
  if (resource.status === 'offline') return <View style={styles.state}><OfflineState title={CONNECTION_COPY.offlineTitle} description={CONNECTION_COPY.offlineDescription} retryLabel={CONNECTION_COPY.retryLabel} onRetry={reload} /></View>;
  if (resource.status === 'error' || collection === null || review === undefined) return <View style={styles.state}><ErrorState message={resource.message ?? CONNECTION_COPY.errorTitle} retryLabel={CONNECTION_COPY.retryLabel} onRetry={reload} /></View>;

  /**
   * الرفع يُعرض **فقط حين يقدر النظام عليه**.
   *
   * الخادم يقول `upload.available: false` (لا مسار كتابة ولا مُنتقي صور مثبَّت) — وS10 يحترمه
   * ويعرض بدله سطر «الرفع من الجوال لسه ما فُتح». لكنّ هذه الشاشة كانت تتجاهله في **ثلاثة
   * مواضع**: زرّ رئيسي، وزرّ ثانٍ مطابق، وفعلٌ في الحالة الفارغة — كلها تعد بما لا يقع.
   * فالعميل يضغط أضخم عنصر في الشاشة (٣٦٤×٥٦) ليُقال له بعدها إنّ الباب مغلق.
   *
   * الصدق يسبق الضغطة لا يتبعها: حين يتعذّر الرفع تُعرض الجملة نفسها هنا، فيعرف من أين يرفع
   * قبل أن يخسر ضغطة ونقلة شاشة.
   */
  const canUpload = collection.upload.available;

  const header = <View>
    <View style={[styles.heading, { borderBottomColor: theme.colors.border }]}>
      <Text style={[styles.pageTitle, { color: theme.colors.text }]}>{review.title}</Text>
    </View>
    {canUpload
      ? <Pressable accessibilityRole="button" accessibilityLabel={review.uploadActionLabel} onPress={onUpload} style={({ pressed }) => [styles.uploadAction, { backgroundColor: theme.colors.primary }, pressed && styles.pressed]}>
        <Text style={[styles.uploadActionLabel, { color: theme.colors.textOnPrimary }]}>{review.uploadActionLabel}</Text>
      </Pressable>
      : <View style={[styles.notice, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.noticeText, { color: theme.colors.text }]}>{collection.upload.unavailableLabel}</Text>
      </View>}
    {collection.videos.length > 0 ? <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{review.latestSectionTitle}</Text> : null}
  </View>;

  /**
   * التلميح **نصّ لا زرّ**.
   *
   * كان ضاغطاً بنفس مقاس الزرّ الرئيسي (٣٦٤×٥٦) ويستدعي نفس `onUpload` — فعلان متساويان
   * في الوزن لفعلٍ واحد، والعميل يقف يوازن بينهما بلا سبب. والأسوأ أنّ اسمه المنطوق كان
   * «يمكنك التصوير أو الاختيار من الاستديو، زر» — جملةُ إرشاد لا اسمُ فعل، وWCAG 2.4.6
   * يفرض أن يصف اسم العنصر وظيفته.
   */
  const footer = canUpload
    ? <Text style={[styles.hintLabel, { color: theme.colors.muted }]}>{review.uploadHintLabel}</Text>
    : null;

  // «ما رفعت أي طلّة بعد» لها فعلٌ واحد حقيقي والشاشة تملكه — فتقوله بدل أن تترك العميل يبحث.
  return <FlashList
    data={collection.videos}
    renderItem={renderVideo}
    keyExtractor={videoKey}
    contentContainerStyle={styles.list}
    ListHeaderComponent={header}
    ListEmptyComponent={<EmptyState icon="reels" title={review.emptyTitle} copy={review.emptyDescription} actionLabel={canUpload ? review.uploadActionLabel : undefined} onAction={canUpload ? onUpload : undefined} />}
    ListFooterComponent={footer}
  />;
}

const styles = StyleSheet.create({
  state: { flex: 1, paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.md },
  list: { paddingHorizontal: spacing.screenHorizontal, paddingBottom: spacing.screenBottom },
  heading: { alignItems: 'flex-end', borderBottomWidth: StyleSheet.hairlineWidth, marginTop: spacing.md, paddingBottom: spacing.md },
  pageTitle: { fontFamily: fonts.medium, fontSize: typography.pageTitle, lineHeight: typography.lineHeightPageTitle, textAlign: 'right', writingDirection: 'rtl' },
  pressed: { opacity: 0.72 },
  uploadAction: { minHeight: control.buttonHeight, borderRadius: radii.button, alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg },
  uploadActionLabel: { fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, writingDirection: 'rtl' },
  notice: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radii.card, marginTop: spacing.lg, padding: spacing.md },
  noticeText: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl' },
  sectionTitle: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.xl, marginBottom: spacing.sm },
  hintLabel: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, marginTop: spacing.md, textAlign: 'center', writingDirection: 'rtl' },
});
