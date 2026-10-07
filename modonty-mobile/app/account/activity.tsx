import { InfoRow } from '@/components/content/InfoRow';
import { Header } from '@/components/ui/Header';
import { PagedList } from '@/components/ui/PagedList';
import { Screen } from '@/components/ui/Screen';
import { usePagedList } from '@/hooks/usePagedList';
import { dateTime } from '@/lib/format';
import { openHref } from '@/lib/nav';
import { meApi } from '@/services/api-actions';
import type { MeActivityData } from '@/services/api-types-actions';

type Item = MeActivityData['activities'][number] & { key: string };
const ICON = { comment: 'comment', like_article: 'like', like_comment: 'like', favorite_article: 'bookmark', follow_client: 'partner' } as const;

/** S24 — نشاطي (getProfileActivity). */
export default function ActivityScreen() {
  const list = usePagedList<Item, number>(async (page, signal) => {
    const p = page ?? 1;
    const d = await meApi.activity(p, signal);
    return { items: d.activities.map((a, i) => ({ ...a, key: `${p}-${i}-${a.timestamp}` })), next: p < d.pagination.totalPages ? p + 1 : null };
  }, []);
  return (
    <Screen>
      <Header back title="نشاطي" />
      <PagedList
        list={list}
        skeleton="row"
        renderItem={({ item }) => <InfoRow icon={ICON[item.type]} title={item.content} meta={dateTime(item.timestamp)} onPress={item.link ? () => openHref(item.link!) : undefined} />}
        keyOf={(i) => i.key}
        what="نشاطك"
        empty={{ icon: 'clock', title: 'لا نشاط بعد' }}
      />
    </Screen>
  );
}
