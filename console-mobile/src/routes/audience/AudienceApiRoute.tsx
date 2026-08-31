import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { AudienceCommentCard } from '@/src/components/audience/AudienceCommentCard';
import { AudienceQuestionCard } from '@/src/components/audience/AudienceQuestionCard';
import { AudienceTabs, type AudienceTab, type AudienceTabKey } from '@/src/components/audience/AudienceTabs';
import { EmptyState, ErrorState, ListScreenSkeleton, OfflineState } from '@/src/components/ui/MobileUI';
import { getAudienceInbox, type AudienceCommentSummary, type AudienceQuestionSummary } from '@/src/services/engagement-api';
import { CONNECTION_COPY, useEngagementResource } from '@/src/services/use-engagement-resource';
import { fonts, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/** S08 «الجمهور» — the questions and comments still waiting on the client. */

type Props = { accessToken: string; onOpenQuestion: (questionId: string) => void };

const questionKey = (item: AudienceQuestionSummary) => item.id;
const commentKey = (item: AudienceCommentSummary) => item.id;

export function AudienceApiRoute({ accessToken, onOpenQuestion }: Props) {
  const { theme } = useAppTheme();
  const [activeTab, setActiveTab] = useState<AudienceTabKey>('questions');
  const { resource, reload, refresh, isRefreshing } = useEngagementResource(accessToken, getAudienceInbox);
  const inbox = resource.data;
  const review = inbox?.review;

  const tabs = useMemo<AudienceTab[]>(() => review === undefined ? [] : [
    { key: 'questions', label: review.questionsTabLabel, count: review.questionsTabCount },
    { key: 'comments', label: review.commentsTabLabel, count: review.commentsTabCount },
  ], [review]);

  const renderQuestion = useCallback(({ item }: { item: AudienceQuestionSummary }) => review === undefined ? null
    : <AudienceQuestionCard item={item} replyLabel={review.replyLinkLabel} openPrefix={review.openQuestionPrefix} onOpen={onOpenQuestion} />, [onOpenQuestion, review]);
  const renderComment = useCallback(({ item }: { item: AudienceCommentSummary }) => <AudienceCommentCard item={item} />, []);

  const heading = <View style={styles.heading}>
    <Text style={[styles.pageTitle, { color: theme.colors.text }]}>{review?.title ?? ''}</Text>
    {review ? <Text style={[styles.subtitle, { color: theme.colors.muted }]}>{review.subtitle}</Text> : null}
    {tabs.length > 0 ? <View style={styles.tabsSlot}><AudienceTabs tabs={tabs} activeKey={activeTab} onSelect={setActiveTab} /></View> : null}
  </View>;

  if (resource.status === 'loading') return <View style={styles.state}><ListScreenSkeleton count={3} withSubtitle /></View>;
  if (resource.status === 'offline') return <View style={styles.state}><OfflineState title={CONNECTION_COPY.offlineTitle} description={CONNECTION_COPY.offlineDescription} retryLabel={CONNECTION_COPY.retryLabel} onRetry={reload} /></View>;
  if (resource.status === 'error' || inbox === null || review === undefined) return <View style={styles.state}><ErrorState message={resource.message ?? CONNECTION_COPY.errorTitle} retryLabel={CONNECTION_COPY.retryLabel} onRetry={reload} /></View>;

  /**
   * بلا زرّ «إعادة المحاولة» — نصّ الحالة نفسه ينفي الفشل: «الأسئلة توصلك هنا لما يسأل قارئ».
   * لا شيء انكسر ليُعاد؛ الصندوق فارغ لأن أحداً لم يسأل بعد، والزرّ يدعو لإصلاح ما ليس مكسوراً.
   * وإعادة السؤال بالسحب للتحديث — **وهو ما كان هذا التعليق يزعمه ولم يكن موجوداً**: لا
   * `refreshControl` على أيّ من القائمتين، فبقي الصندوق الفارغ بلا أي مخرج إطلاقاً.
   */
  const listEmpty = activeTab === 'questions'
    ? <EmptyState icon="question" title={review.emptyQuestionsTitle} copy={review.emptyQuestionsDescription} />
    : <EmptyState icon="comment" title={review.emptyCommentsTitle} copy={review.emptyCommentsDescription} />;

  const refreshControl = <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={theme.colors.textInteractive} colors={[theme.colors.textInteractive]} />;

  return activeTab === 'questions'
    ? <FlashList data={inbox.questions} renderItem={renderQuestion} keyExtractor={questionKey} contentContainerStyle={styles.list} ListHeaderComponent={heading} ListEmptyComponent={listEmpty} refreshControl={refreshControl} />
    : <FlashList data={inbox.comments} renderItem={renderComment} keyExtractor={commentKey} contentContainerStyle={styles.list} ListHeaderComponent={heading} ListEmptyComponent={listEmpty} refreshControl={refreshControl} />;
}

const styles = StyleSheet.create({
  state: { flex: 1, paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.md },
  list: { paddingHorizontal: spacing.screenHorizontal, paddingBottom: spacing.screenBottom },
  heading: { alignItems: 'flex-end', marginTop: spacing.md, marginBottom: spacing.md },
  pageTitle: { fontFamily: fonts.medium, fontSize: typography.pageTitle, lineHeight: typography.lineHeightPageTitle, textAlign: 'right', writingDirection: 'rtl' },
  subtitle: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.xxs },
  tabsSlot: { alignSelf: 'stretch', marginTop: spacing.md },
});
