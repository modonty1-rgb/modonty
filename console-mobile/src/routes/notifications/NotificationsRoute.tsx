import { FlashList } from '@shopify/flash-list';
import { useCallback, useEffect } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { NotificationCard } from '@/src/components/notifications/NotificationCard';
import { EmptyState, ErrorState, ListScreenSkeleton, OfflineState, RefreshNotice } from '@/src/components/ui/MobileUI';
import { EnterView, groupPositionOf, LargeTitle, StatusBadge, useTabBarClearance } from '@/src/components/ui/Nabd';
import { getNotificationCollection, markNotificationRead, type NotificationSummary } from '@/src/services/engagement-api';
import { CONNECTION_COPY, useEngagementResource } from '@/src/services/use-engagement-resource';
import { nabd, spacing } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/** S12 «التنبيهات» — «نبض»: عنوان كبير وسطر الأولوية · شارة «٢ جديد» · مجموعة مقطّعة غير المقروء فيها بدائرة البطل. */

type Props = {
  accessToken: string;
  /** `articleId` حين يعرف التنبيه مقاله — فيُفتح المقال نفسه لا القائمة. */
  onOpenArticle: (articleId: string | null) => void;
  onOpenAudience: () => void;
  onOpenVideos: () => void;
  /** Feeds the footer badge from the same response this screen rendered, so the number on
   *  the tab and the number in the list can never disagree — and no second request is made. */
  onUnreadCountChange?: (unreadCount: number) => void;
};

const notificationKey = (item: NotificationSummary) => item.id;

export function NotificationsRoute({ accessToken, onOpenArticle, onOpenAudience, onOpenVideos, onUnreadCountChange }: Props) {
  const { theme } = useAppTheme();
  const clearance = useTabBarClearance();
  const { resource, reload, refresh, isRefreshing, replace, refreshFailure } = useEngagementResource(accessToken, getNotificationCollection);
  const collection = resource.data;
  const review = collection?.review;
  const unreadCount = collection?.unreadCount;

  useEffect(() => {
    if (unreadCount !== undefined) onUnreadCountChange?.(unreadCount);
  }, [onUnreadCountChange, unreadCount]);

  /**
   * الفتح **يوسم مقروءاً** ثم ينتقل.
   *
   * كان ينتقل ولا يوسم — ولا فعل واحد في عقد الجوّال كان يكتب `readAt` أصلاً، فالشارة على
   * التاب لا تصل صفراً أبداً والتنبيه يبقى «جديد» للأبد. وشارةٌ لا تُطفأ يتعلّم صاحبها
   * تجاهلها، فتضيع معها التنبيهات الحقيقية.
   *
   * والتحديث محلّي **فوراً** لا بانتظار الشبكة: الانتقال يقع الآن، فلو انتظرنا الردّ لعاد
   * العميل ليجد التنبيه ما زال «جديد». والخادم يرجع العدّ الجديد فيصحّح المحلّي إن اختلفا.
   */
  const open = useCallback((item: NotificationSummary) => {
    if (item.isUnread && collection !== null) {
      const optimisticCount = Math.max(0, collection.unreadCount - 1);
      replace({
        ...collection,
        unreadCount: optimisticCount,
        notifications: collection.notifications.map((row) => row.id === item.id ? { ...row, isUnread: false } : row),
      });
      /**
       * الشارة تُبلَّغ **مباشرةً هنا** لا عبر أثرٍ يراقب العدّ.
       *
       * الانتقال لتاب آخر يزيل هذه الشاشة في نفس الدور، فالأثر لا يعمل أبداً، ونتيجة
       * `refresh()` تُرمى لأن الشاشة زالت — فبقيت الشارة «١» بعد فتح التنبيه حتى يُسحب
       * تحديث الرئيسية. والجذر حيّ دائماً، فالعدّ الذي يرجعه الخادم يصله ولو زالت الشاشة.
       */
      onUnreadCountChange?.(optimisticCount);
      markNotificationRead(accessToken, item.id)
        .then((result) => { onUnreadCountChange?.(result.unreadCount); refresh(); })
        .catch(() => refresh());
    }
    if (item.target === 'article') return onOpenArticle(item.relatedId);
    if (item.target === 'audience') return onOpenAudience();
    if (item.target === 'videos') return onOpenVideos();
  }, [accessToken, collection, onOpenArticle, onOpenAudience, onOpenVideos, onUnreadCountChange, refresh, replace]);

  const rowCount = collection?.notifications.length ?? 0;
  const renderNotification = useCallback(({ item, index }: { item: NotificationSummary; index: number }) => review === undefined ? null
    : <NotificationCard item={item} openPrefix={review.openPrefix} position={groupPositionOf(index, rowCount)} onOpen={open} />, [open, review, rowCount]);

  if (resource.status === 'loading') return <View style={styles.state}><ListScreenSkeleton count={3} /></View>;
  if (resource.status === 'offline') return <View style={styles.state}><OfflineState title={CONNECTION_COPY.offlineTitle} description={CONNECTION_COPY.offlineDescription} retryLabel={CONNECTION_COPY.retryLabel} onRetry={reload} /></View>;
  if (resource.status === 'error' || collection === null || review === undefined) return <View style={styles.state}><ErrorState message={resource.message ?? CONNECTION_COPY.errorTitle} retryLabel={CONNECTION_COPY.retryLabel} onRetry={reload} /></View>;

  const header = <View style={styles.header}>
    <EnterView index={0}><LargeTitle title={review.title} subtitle={review.priorityNote} /></EnterView>
    {refreshFailure ? <RefreshNotice message={refreshFailure.message} offline={refreshFailure.offline} retryLabel={CONNECTION_COPY.retryLabel} onRetry={refresh} /> : null}
    {review.unreadBadgeLabel && collection.notifications.length > 0 ? <EnterView index={1}><StatusBadge label={review.unreadBadgeLabel} tone="primary" /></EnterView> : null}
  </View>;

  // «ما في تنبيهات جديدة» حالة نجاح لا خطأ — فلا زرّ «إعادة المحاولة» في فراغها، والسحب يكفي.
  return <FlashList
    data={collection.notifications}
    renderItem={renderNotification}
    keyExtractor={notificationKey}
    contentContainerStyle={[styles.list, { paddingBottom: clearance }]}
    ListHeaderComponent={header}
    ListEmptyComponent={<EmptyState icon="notifications" title={review.emptyTitle} copy={review.emptyDescription} />}
    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={theme.colors.textInteractive} colors={[theme.colors.textInteractive]} progressBackgroundColor={theme.colors.surfaceRaised} />}
  />;
}

const styles = StyleSheet.create({
  state: { flex: 1, paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.md, paddingBottom: nabd.tabBarClearance },
  list: { paddingHorizontal: spacing.screenHorizontal },
  header: { gap: spacing.sm, marginBottom: spacing.sm, marginTop: spacing.xxs },
});
