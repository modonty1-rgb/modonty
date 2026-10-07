import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ChipRow } from '@/components/ui/ChipRow';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { PagedList } from '@/components/ui/PagedList';
import { Screen } from '@/components/ui/Screen';
import { Tap } from '@/components/ui/Tap';
import { usePagedList } from '@/hooks/usePagedList';
import { dateTime } from '@/lib/format';
import { open } from '@/lib/nav';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { accountApi } from '@/services/api';
import type { NotificationItem, NotificationTab } from '@/services/api-types';
import { toApiError } from '@/services/errors';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, radius, space } from '@/theme/tokens';

const TABS = [
  { value: 'all', label: 'الكل' },
  { value: 'unread', label: 'غير المقروءة' },
  { value: 'read', label: 'المقروءة' },
] as const satisfies readonly { value: NotificationTab; label: string }[];

type Row = NotificationItem & { when: string | null };

/** S16 — الإشعارات (N1/N2): غير المقروء أوّلاً، والضغط يقرأ ويفتح الوجهة. */
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
      return { items: d.items.map((n) => ({ ...n, when: dateTime(n.createdAt) })), next: d.nextCursor };
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
    ({ item }: { item: Row }) => (
      <Tap
        label={`${item.readAt ? '' : 'غير مقروء: '}${item.title}`}
        role="link"
        onPress={() => void openRow(item)}
        style={[styles.row, { backgroundColor: item.readAt ? colors.surface : colors.primaryContainer, borderColor: colors.border }]}
      >
        <Icon name={item.target?.kind === 'reel' ? 'reels' : item.target?.kind === 'contact' ? 'email' : 'comment'} tone={item.readAt ? 'muted' : 'onPrimaryContainer'} />
        <View style={styles.text}>
          <AppText variant="label" tone={item.readAt ? 'text' : 'onPrimaryContainer'}>
            {item.title}
          </AppText>
          <AppText variant="body" tone={item.readAt ? 'muted' : 'onPrimaryContainer'} numberOfLines={3}>
            {item.body}
          </AppText>
          {item.when ? (
            <AppText variant="secondary" tone="muted">
              {item.readAt ? item.when : `جديد · ${item.when}`}
            </AppText>
          ) : null}
        </View>
        {item.target && item.target.kind !== 'contact' ? <Icon name="forward" size={control.iconSmall} tone="muted" /> : null}
      </Tap>
    ),
    [colors, openRow],
  );

  return (
    <Screen>
      <Header back title="الإشعارات" />
      <PagedList
        list={list}
        renderItem={renderItem}
        keyOf={(n) => n.id}
        what="الإشعارات"
        skeleton="row"
        header={
          <View>
            <ChipRow label="عرض" options={TABS} value={tab} onChange={setTab} />
            {unread > 0 ? (
              <View style={styles.readAll}>
                <Button label="تعليم الكل كمقروء" kind="text" compact icon="check" onPress={() => void readAll()} busy={marking} busyLabel="يُعلَّم…" />
              </View>
            ) : null}
          </View>
        }
        empty={{
          icon: 'notifications',
          title: tab === 'unread' ? 'لا إشعارات غير مقروءة' : 'لا إشعارات بعد',
          body: 'يصلك إشعار حين يعتمد الشريك تعليقك أو يردّ على سؤالك.',
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start', borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: space.card },
  text: { flex: 1, gap: space.xxs },
  readAll: { alignItems: 'flex-start', paddingHorizontal: space.screen - space.xs },
});
