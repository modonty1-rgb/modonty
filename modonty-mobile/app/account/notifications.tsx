import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import type { ModontyIconName } from '@/components/brand/ModontyIcon';
import { FeedTabs } from '@/components/home/FeedTabs';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { PagedList } from '@/components/ui/PagedList';
import { Screen } from '@/components/ui/Screen';
import { Tap } from '@/components/ui/Tap';
import { usePagedList } from '@/hooks/usePagedList';
import { agoFine } from '@/lib/format';
import { open } from '@/lib/nav';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { accountApi } from '@/services/api';
import type { NotificationItem, NotificationTab } from '@/services/api-types';
import { toApiError } from '@/services/errors';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds, dsFontScale } from '@/theme/tokens';

const TABS: { key: NotificationTab; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'unread', label: 'غير المقروءة' },
  { key: 'read', label: 'المقروءة' },
];

type Row = NotificationItem & { when: string | null };

/** أيقونة النوع — نفس قاعدة التوجيه في الخادم (`notification-target-kind.ts:9-14`). */
function iconOf(type: string): ModontyIconName {
  if (type.startsWith('reel_comment')) return 'reels';
  if (type.startsWith('comment')) return 'comment';
  if (type === 'faq_reply') return 'question';
  return 'email';
}

/**
 * S16 — الإشعارات (N1/N2) على نظام التصميم: رأس برجوع و«قرأتها كلها» حين يوجد غير مقروء · تبويبات
 * الكل/غير المقروءة/المقروءة · صفوف بعرض الشاشة: أيقونة النوع في دائرة · العنوان أثقل ونقطة زرقاء للجديد ·
 * النصّ ٣ أسطر · الوقت. غير المقروء أوّلاً (ترتيب الخادم)، والضغط يقرأ ويفتح الوجهة.
 */
export default function NotificationsScreen() {
  const { colors } = useAppTheme();
  const { setUnread } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<NotificationTab>('all');
  const [unread, setUnreadLocal] = useState(0);
  const [marking, setMarking] = useState(false);

  const list = usePagedList<Row, string>(
    async (cursor, signal) => {
      const d = await accountApi.notifications({ tab, cursor }, signal);
      setUnreadLocal(d.unreadCount);
      setUnread(d.unreadCount);
      return { items: d.items.map((n) => ({ ...n, when: agoFine(n.createdAt) })), next: d.nextCursor };
    },
    [tab],
  );

  const openRow = useCallback(
    async (n: Row) => {
      if (!n.readAt) {
        try {
          const r = await accountApi.readNotification(n.id);
          setUnreadLocal(r.unreadCount);
          setUnread(r.unreadCount);
          list.update((items) => items.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)));
        } catch (error) {
          toast.show(toApiError(error).message, 'error');
        }
      }
      if (n.target?.kind === 'article') open.article(n.target.slug);
      else if (n.target?.kind === 'reel') open.reel(n.target.slug);
    },
    [list, setUnread, toast],
  );

  const readAll = async () => {
    setMarking(true);
    try {
      const r = await accountApi.readAllNotifications();
      setUnreadLocal(r.unreadCount);
      setUnread(r.unreadCount);
      list.reload();
    } catch (error) {
      toast.show(toApiError(error).message, 'error');
    } finally {
      setMarking(false);
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: Row }) => {
      const fresh = !item.readAt;
      const goes = item.target && item.target.kind !== 'contact';
      return (
        <Tap label={`${fresh ? 'جديد: ' : ''}${item.title}`} role={goes ? 'link' : 'button'} onPress={() => void openRow(item)} style={[styles.row, { borderBottomColor: colors.border }]}>
          <View style={[styles.icon, { backgroundColor: fresh ? colors.primaryContainer : colors.sunken }]}>
            <Icon name={iconOf(item.type)} size={20} tone={fresh ? 'primaryText' : 'textSecondary'} monochrome />
          </View>
          <View style={styles.text}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.text, fontFamily: fresh ? 'Tajawal_800ExtraBold' : 'Tajawal_700Bold' }]} numberOfLines={3} maxFontSizeMultiplier={dsFontScale.max}>
                {item.title}
              </Text>
              {fresh ? <View style={[styles.dot, { backgroundColor: colors.primary }]} /> : null}
            </View>
            {item.body ? (
              <Text style={[styles.body, { color: colors.textSecondary }]} numberOfLines={3} maxFontSizeMultiplier={dsFontScale.max}>
                {item.body}
              </Text>
            ) : null}
            {item.when ? (
              <Text style={[styles.when, { color: colors.muted }]} maxFontSizeMultiplier={1.2}>
                {item.when}
              </Text>
            ) : null}
          </View>
        </Tap>
      );
    },
    [colors, openRow],
  );

  return (
    <Screen>
      <Header
        back
        title="الإشعارات"
        actions={
          unread > 0 ? (
            <Tap label="تعليم الكل كمقروء" disabled={marking} onPress={() => void readAll()} style={styles.readAll}>
              {marking ? <ActivityIndicator size="small" color={colors.primary} /> : <Icon name="check" size={18} tone="primaryText" monochrome />}
              <Text style={[styles.readAllText, { color: colors.primaryText }]} maxFontSizeMultiplier={1.2}>
                قرأتها كلها
              </Text>
            </Tap>
          ) : undefined
        }
      />
      <FeedTabs tabs={TABS} value={tab} onChange={setTab} />
      <PagedList
        list={list}
        renderItem={renderItem}
        keyOf={(n) => n.id}
        what="الإشعارات"
        skeleton="row"
        flush
        empty={{
          icon: 'notifications',
          title: tab === 'unread' ? 'لا إشعارات غير مقروءة' : tab === 'read' ? 'لا إشعارات مقروءة' : 'لا إشعارات بعد',
          body: 'يصلك إشعار حين يعتمد الشريك تعليقك أو يردّ على سؤالك.',
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: ds.layout.gutter, paddingVertical: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  title: { flex: 1, fontSize: 15, lineHeight: 22 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  body: { fontFamily: 'Tajawal_400Regular', fontSize: 14, lineHeight: 22 },
  when: { fontFamily: 'Tajawal_500Medium', fontSize: 12, lineHeight: 18 },
  readAll: { height: 48, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 4 },
  readAllText: { fontFamily: 'Tajawal_700Bold', fontSize: 14, lineHeight: 20 },
});
