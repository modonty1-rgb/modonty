import { FlashList } from '@shopify/flash-list';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { NotificationCard } from '@/src/components/notifications/NotificationCard';
import { EmptyState, ErrorState, ListScreenSkeleton, OfflineState, RefreshNotice } from '@/src/components/ui/MobileUI';
import { EnterView, groupPositionOf, LargeTitle, PillButton, StatusBadge, useTabBarClearance } from '@/src/components/ui/Nabd';
import { arabicDigits, getNotificationCollection, markAllNotificationsRead, markNotificationRead, type NotificationCollection, type NotificationSummary } from '@/src/services/engagement-api';
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
  /** طلبات التواصل (`booking*`) — شاشة مكدَّسة لا تبويب. */
  onOpenBookings: () => void;
  /** Feeds the footer badge from the same response this screen rendered, so the number on
   *  the tab and the number in the list can never disagree — and no second request is made. */
  onUnreadCountChange?: (unreadCount: number) => void;
};

const notificationKey = (item: NotificationSummary) => item.id;

type NotificationReview = NotificationCollection['review'];

/**
 * الصفّ مقروءاً فوراً: النقطة **والكلمة** معاً. كان التحديث الفوري يطفئ النقطة ويترك «جديد» تحتها
 * حتى تعود إعادة الجلب، فيرى العميل تنبيهاً مقروءاً مكتوباً عليه «جديد» (جوال خالد ٦ أكتوبر ٢٠٢٦).
 */
function asRead(row: NotificationSummary, review: NotificationReview): NotificationSummary {
  return { ...row, isUnread: false, stateLabel: review.readStateLabel ?? row.stateLabel };
}

/** شارة «٣ جديد» من قالب الخادم بالعدّ الجديد، وتختفي عند الصفر. */
function badgeLabelFor(review: NotificationReview, unreadCount: number): string | null {
  if (unreadCount === 0) return null;
  return review.unreadBadgeTemplate ? review.unreadBadgeTemplate.replace('{count}', arabicDigits(unreadCount)) : review.unreadBadgeLabel;
}

export function NotificationsRoute({ accessToken, onOpenArticle, onOpenAudience, onOpenVideos, onOpenBookings, onUnreadCountChange }: Props) {
  const { theme } = useAppTheme();
  const clearance = useTabBarClearance();
  const { resource, reload, refresh, isRefreshing, replace, refreshFailure } = useEngagementResource(accessToken, getNotificationCollection);
  const collection = resource.data;
  const review = collection?.review;
  const unreadCount = collection?.unreadCount;
  /** صفوف بلا وجهة فُتح نصّها كاملاً في مكانه — هنا لا في البطاقة، فالخليّة المعاد تدويرها لا ترثها. */
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(() => new Set());

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
        review: { ...collection.review, unreadBadgeLabel: badgeLabelFor(collection.review, optimisticCount) },
        notifications: collection.notifications.map((row) => row.id === item.id ? asRead(row, collection.review) : row),
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
    if (item.target === 'bookings') return onOpenBookings();
    if (item.target === 'audience') return onOpenAudience();
    if (item.target === 'videos') return onOpenVideos();
    // بلا وجهة: الضغطة تقرأه — النصّ كاملاً في مكانه، والضغطة الثانية تطويه.
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(item.id)) next.delete(item.id); else next.add(item.id);
      return next;
    });
  }, [accessToken, collection, onOpenArticle, onOpenAudience, onOpenBookings, onOpenVideos, onUnreadCountChange, refresh, replace]);

  /**
   * «تعليم الكل كمقروء» — خالد ٥ أكتوبر ٢٠٢٦. محلّي **فوراً** كالوسم الفردي، والخادم يرجع العدّ
   * الحقيقي فيصحّحه؛ والفشل يعيد القراءة فتعود الصفوف «جديد» كما هي على الخادم.
   */
  const markAllRead = useCallback(() => {
    if (collection === null || collection.unreadCount === 0) return;
    replace({ ...collection, unreadCount: 0, review: { ...collection.review, unreadBadgeLabel: null }, notifications: collection.notifications.map((row) => row.isUnread ? asRead(row, collection.review) : row) });
    onUnreadCountChange?.(0);
    markAllNotificationsRead(accessToken)
      .then((result) => { onUnreadCountChange?.(result.unreadCount); refresh(); })
      .catch(() => refresh());
  }, [accessToken, collection, onUnreadCountChange, refresh, replace]);

  const rowCount = collection?.notifications.length ?? 0;
  const renderNotification = useCallback(({ item, index }: { item: NotificationSummary; index: number }) => review === undefined ? null
    : <NotificationCard item={item} openPrefix={review.openPrefix} position={groupPositionOf(index, rowCount)} expanded={expandedIds.has(item.id)} onOpen={open} />, [expandedIds, open, review, rowCount]);

  if (resource.status === 'loading') return <View style={styles.state}><ListScreenSkeleton count={3} /></View>;
  if (resource.status === 'offline') return <View style={styles.state}><OfflineState title={CONNECTION_COPY.offlineTitle} description={CONNECTION_COPY.offlineDescription} retryLabel={CONNECTION_COPY.retryLabel} onRetry={reload} /></View>;
  if (resource.status === 'error' || collection === null || review === undefined) return <View style={styles.state}><ErrorState message={resource.message ?? CONNECTION_COPY.errorTitle} retryLabel={CONNECTION_COPY.retryLabel} onRetry={reload} /></View>;

  const header = <View style={styles.header}>
    <EnterView index={0}><LargeTitle title={review.title} subtitle={review.priorityNote} /></EnterView>
    {refreshFailure ? <RefreshNotice message={refreshFailure.message} offline={refreshFailure.offline} retryLabel={CONNECTION_COPY.retryLabel} onRetry={refresh} /> : null}
    {review.unreadBadgeLabel && collection.unreadCount > 0 && collection.notifications.length > 0 ? <EnterView index={1} style={styles.unreadRow}>
      <StatusBadge label={review.unreadBadgeLabel} tone="primary" />
      {/* يظهر فقط مع غير مقروء: زرّ لا عمل له يُقرأ تطبيقاً مكسوراً. */}
      {review.markAllReadLabel ? <PillButton label={review.markAllReadLabel} tone="ghost" size="medium" icon="check" onPress={markAllRead} /> : null}
    </EnterView> : null}
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
  unreadRow: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.sm, justifyContent: 'space-between' },
});
