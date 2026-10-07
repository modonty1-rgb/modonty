import { InfoRow } from '@/components/content/InfoRow';
import { Header } from '@/components/ui/Header';
import { PagedList } from '@/components/ui/PagedList';
import { Screen } from '@/components/ui/Screen';
import { usePagedList } from '@/hooks/usePagedList';
import { cardDate, plainNumber } from '@/lib/format';
import { open } from '@/lib/nav';
import { meApi } from '@/services/api-actions';
import type { MeCommentsData } from '@/services/api-types-actions';

type Item = MeCommentsData['comments'][number];
const STATUS = { APPROVED: 'منشور', PENDING: 'بانتظار الشريك', REJECTED: 'مرفوض' } as const;

/** S22 — تعليقاتي (getProfileComments) بحالة كل تعليق نصّاً. */
export default function MyCommentsScreen() {
  const list = usePagedList<Item, number>(async (page, signal) => {
    const p = page ?? 1;
    const d = await meApi.comments(p, signal);
    return { items: d.comments, next: p < d.pagination.totalPages ? p + 1 : null };
  }, []);
  return (
    <Screen>
      <Header back title="تعليقاتي" />
      <PagedList
        list={list}
        skeleton="row"
        renderItem={({ item }) => (
          <InfoRow
            icon="comment"
            title={item.article.title}
            body={item.content}
            badge={STATUS[item.status]}
            meta={[cardDate(item.createdAt), item.likesCount > 0 ? `${plainNumber(item.likesCount)} إعجاب` : null, item.repliesCount > 0 ? `${plainNumber(item.repliesCount)} ردّ` : null].filter(Boolean).join(' · ')}
            onPress={() => open.article(item.article.slug)}
          />
        )}
        keyOf={(i) => i.id}
        what="تعليقاتك"
        empty={{ icon: 'comment', title: 'لم تعلّق بعد', body: 'تعليقك يظهر بعد اعتماد الشريك.' }}
      />
    </Screen>
  );
}
