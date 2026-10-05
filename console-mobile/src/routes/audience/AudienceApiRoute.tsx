import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { AudienceCommentCard, type CommentDecision } from '@/src/components/audience/AudienceCommentCard';
import { AudienceQuestionCard } from '@/src/components/audience/AudienceQuestionCard';
import { EmptyState, ErrorState, ListScreenSkeleton, OfflineState, RefreshNotice } from '@/src/components/ui/MobileUI';
import { EnterView, LargeTitle, SegmentedTabs, useTabBarClearance, type SegmentItem } from '@/src/components/ui/Nabd';
import { arabicDigits, decideAudienceComment, getAudienceInbox, type AudienceCommentSummary, type AudienceQuestionSummary } from '@/src/services/engagement-api';
import { emitLiveRefresh } from '@/src/services/live-refresh';
import { CONNECTION_COPY, useEngagementResource } from '@/src/services/use-engagement-resource';
import { nabd, spacing } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/**
 * S08 «الجمهور» — «نبض»: عنوان كبير وسطر العدد · مجموعة مقطّعة (الأسئلة | التعليقات) · بطاقات
 * نغمية. التبديل يغيّر ما تعرضه القائمة ولا يفعل شيئاً آخر — قاعدة التنقّل: التاب لا ينفّذ فعلاً.
 */

type Props = { accessToken: string; onOpenQuestion: (questionId: string) => void };
type AudienceTabKey = 'questions' | 'comments' | 'reviews';

const questionKey = (item: AudienceQuestionSummary) => item.id;
const commentKey = (item: AudienceCommentSummary) => item.id;

export function AudienceApiRoute({ accessToken, onOpenQuestion }: Props) {
  const { theme } = useAppTheme();
  const clearance = useTabBarClearance();
  const [activeTab, setActiveTab] = useState<AudienceTabKey>('questions');
  const { resource, reload, refresh, isRefreshing, refreshFailure, replace } = useEngagementResource(accessToken, getAudienceInbox);
  const inbox = resource.data;
  const review = inbox?.review;

  const tabs = useMemo<SegmentItem<AudienceTabKey>[]>(() => review === undefined ? [] : [
    { key: 'questions', label: review.questionsTabLabel, count: review.questionsTabCount },
    { key: 'comments', label: review.commentsTabLabel, count: review.commentsTabCount },
    ...(review.reviewsTabLabel ? [{ key: 'reviews' as const, label: review.reviewsTabLabel, count: review.reviewsTabCount ?? '' }] : []),
  ], [review]);

  const renderQuestion = useCallback(({ item }: { item: AudienceQuestionSummary }) => review === undefined ? null
    : <AudienceQuestionCard item={item} replyLabel={review.replyLinkLabel} openPrefix={review.openQuestionPrefix} badgeLabel={review.questionBadgeLabel} onOpen={onOpenQuestion} />, [onOpenQuestion, review]);
  /**
   * القرار يُزيل البطاقة فوراً ويُنقص عدّاد التاب، ثم الرئيسية تتحدّث (`emitLiveRefresh`) كي
   * لا تبقى «راجع التعليقات ١» بعد أن راجعه. الفشل يبقي البطاقة ويُظهر سببه عليها.
   */
  const onDecide = useCallback(async (item: AudienceCommentSummary, decision: CommentDecision): Promise<string | null> => {
    try {
      await decideAudienceComment(accessToken, item.id, item.kind ?? 'article', decision);
    } catch (reason) {
      return reason instanceof Error && reason.message ? reason.message : CONNECTION_COPY.errorTitle;
    }
    if (inbox) {
      if (item.kind === 'review') {
        const reviews = (inbox.reviews ?? []).filter((entry) => entry.id !== item.id);
        replace({ ...inbox, reviews, review: { ...inbox.review, reviewsTabCount: arabicDigits(reviews.length) } });
      } else {
        const comments = inbox.comments.filter((comment) => comment.id !== item.id);
        replace({ ...inbox, comments, review: { ...inbox.review, commentsTabCount: arabicDigits(comments.length) } });
      }
    }
    emitLiveRefresh();
    return null;
  }, [accessToken, inbox, replace]);
  const renderComment = useCallback(({ item }: { item: AudienceCommentSummary }) => review === undefined ? null
    : <AudienceCommentCard item={item} approveLabel={review.commentApproveLabel} rejectLabel={review.commentRejectLabel} badgeLabel={review.commentBadgeLabel} onDecide={onDecide} />, [onDecide, review]);

  const heading = <View style={styles.heading}>
    <EnterView index={0}><LargeTitle title={review?.title ?? ''} subtitle={review?.subtitle} /></EnterView>
    {refreshFailure ? <RefreshNotice message={refreshFailure.message} offline={refreshFailure.offline} retryLabel={CONNECTION_COPY.retryLabel} onRetry={refresh} /> : null}
    {tabs.length > 0 ? <EnterView index={1}><SegmentedTabs items={tabs} activeKey={activeTab} onSelect={setActiveTab} /></EnterView> : null}
  </View>;

  if (resource.status === 'loading') return <View style={styles.state}><ListScreenSkeleton count={3} withSubtitle /></View>;
  if (resource.status === 'offline') return <View style={styles.state}><OfflineState title={CONNECTION_COPY.offlineTitle} description={CONNECTION_COPY.offlineDescription} retryLabel={CONNECTION_COPY.retryLabel} onRetry={reload} /></View>;
  if (resource.status === 'error' || inbox === null || review === undefined) return <View style={styles.state}><ErrorState message={resource.message ?? CONNECTION_COPY.errorTitle} retryLabel={CONNECTION_COPY.retryLabel} onRetry={reload} /></View>;

  /**
   * بلا زرّ «إعادة المحاولة» — نصّ الحالة نفسه ينفي الفشل: «الأسئلة توصلك هنا لما يسأل قارئ».
   * لا شيء انكسر ليُعاد؛ وإعادة السؤال بالسحب للتحديث على القائمتين.
   */
  const listEmpty = activeTab === 'questions'
    ? <EmptyState icon="question" title={review.emptyQuestionsTitle} copy={review.emptyQuestionsDescription} />
    : activeTab === 'reviews'
      ? <EmptyState icon="comment" title={review.emptyReviewsTitle ?? ''} copy={review.emptyReviewsDescription ?? ''} />
      : <EmptyState icon="comment" title={review.emptyCommentsTitle} copy={review.emptyCommentsDescription} />;

  const refreshControl = <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={theme.colors.textInteractive} colors={[theme.colors.textInteractive]} progressBackgroundColor={theme.colors.surfaceRaised} />;
  // الشريط العائم يغطّي آخر القائمة — المحتوى يحجز هامش «نبض» تحته.
  const listStyle = [styles.list, { paddingBottom: clearance }];

  if (activeTab === 'questions') return <FlashList data={inbox.questions} renderItem={renderQuestion} keyExtractor={questionKey} contentContainerStyle={listStyle} ListHeaderComponent={heading} ListEmptyComponent={listEmpty} refreshControl={refreshControl} />;
  // التقييمات بنفس بطاقة التعليق وزرّيها — نجوم ونصّ، ثم «اعتماد» أو «رفض».
  return <FlashList key={activeTab} data={activeTab === 'reviews' ? inbox.reviews ?? [] : inbox.comments} renderItem={renderComment} keyExtractor={commentKey} contentContainerStyle={listStyle} ListHeaderComponent={heading} ListEmptyComponent={listEmpty} refreshControl={refreshControl} />;
}

const styles = StyleSheet.create({
  state: { flex: 1, paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.md, paddingBottom: nabd.tabBarClearance },
  list: { paddingHorizontal: spacing.screenHorizontal },
  heading: { gap: spacing.sm, marginBottom: spacing.sm, marginTop: spacing.xxs },
});
