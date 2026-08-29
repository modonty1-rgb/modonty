import { FlashList } from '@shopify/flash-list';
import { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { NotificationCard } from '@/src/components/notifications/NotificationCard';
import { EmptyState, ErrorState, ListScreenSkeleton, OfflineState, StatusPill } from '@/src/components/ui/MobileUI';
import { getNotificationCollection, type NotificationSummary } from '@/src/services/engagement-api';
import { CONNECTION_COPY, useEngagementResource } from '@/src/services/use-engagement-resource';
import { fonts, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/** S12 «التنبيهات» — what needs the client's attention, unread first by border and by word. */

type Props = {
  accessToken: string;
  onOpenArticle: () => void;
  onOpenAudience: () => void;
  onOpenVideos: () => void;
  /** Feeds the footer badge from the same response this screen rendered, so the number on
   *  the tab and the number in the list can never disagree — and no second request is made. */
  onUnreadCountChange?: (unreadCount: number) => void;
};

const notificationKey = (item: NotificationSummary) => item.id;

export function NotificationsRoute({ accessToken, onOpenArticle, onOpenAudience, onOpenVideos, onUnreadCountChange }: Props) {
  const { theme } = useAppTheme();
  const { resource, reload } = useEngagementResource(accessToken, getNotificationCollection);
  const collection = resource.data;
  const review = collection?.review;
  const unreadCount = collection?.unreadCount;

  useEffect(() => {
    if (unreadCount !== undefined) onUnreadCountChange?.(unreadCount);
  }, [onUnreadCountChange, unreadCount]);

  const open = useCallback((item: NotificationSummary) => {
    if (item.target === 'article') return onOpenArticle();
    if (item.target === 'audience') return onOpenAudience();
    if (item.target === 'videos') return onOpenVideos();
  }, [onOpenArticle, onOpenAudience, onOpenVideos]);

  const renderNotification = useCallback(({ item }: { item: NotificationSummary }) => review === undefined ? null
    : <NotificationCard item={item} openPrefix={review.openPrefix} onOpen={open} />, [open, review]);

  if (resource.status === 'loading') return <View style={styles.state}><ListScreenSkeleton count={3} /></View>;
  if (resource.status === 'offline') return <View style={styles.state}><OfflineState title={CONNECTION_COPY.offlineTitle} description={CONNECTION_COPY.offlineDescription} retryLabel={CONNECTION_COPY.retryLabel} onRetry={reload} /></View>;
  if (resource.status === 'error' || collection === null || review === undefined) return <View style={styles.state}><ErrorState message={resource.message ?? CONNECTION_COPY.errorTitle} retryLabel={CONNECTION_COPY.retryLabel} onRetry={reload} /></View>;

  const header = <View>
    <View style={[styles.heading, { borderBottomColor: theme.colors.border }]}>
      <Text style={[styles.pageTitle, { color: theme.colors.text }]}>{review.title}</Text>
    </View>
    {collection.notifications.length > 0 ? <View style={[styles.summary, { backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.border }]}>
      {review.unreadBadgeLabel ? <StatusPill>{review.unreadBadgeLabel}</StatusPill> : null}
      <Text style={[styles.summaryText, { color: theme.colors.text }]}>{review.priorityNote}</Text>
    </View> : null}
  </View>;

  // «ما في تنبيهات جديدة» حالة نجاح لا خطأ — فلا زرّ «إعادة المحاولة» في فراغها.
  return <FlashList
    data={collection.notifications}
    renderItem={renderNotification}
    keyExtractor={notificationKey}
    contentContainerStyle={styles.list}
    ListHeaderComponent={header}
    ListEmptyComponent={<EmptyState icon="notifications" title={review.emptyTitle} copy={review.emptyDescription} />}
  />;
}

const styles = StyleSheet.create({
  state: { flex: 1, paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.md },
  list: { paddingHorizontal: spacing.screenHorizontal, paddingBottom: spacing.screenBottom },
  heading: { alignItems: 'flex-end', borderBottomWidth: StyleSheet.hairlineWidth, marginTop: spacing.md, paddingBottom: spacing.md },
  pageTitle: { fontFamily: fonts.medium, fontSize: typography.pageTitle, lineHeight: typography.lineHeightPageTitle, textAlign: 'right', writingDirection: 'rtl' },
  summary: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, borderWidth: StyleSheet.hairlineWidth, borderRadius: radii.card, padding: spacing.md, marginTop: spacing.lg, marginBottom: spacing.md },
  summaryText: { flex: 1, fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl' },
});
