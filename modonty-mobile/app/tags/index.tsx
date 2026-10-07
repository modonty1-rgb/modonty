import { useCallback, useState } from 'react';

import { SearchField } from '@/components/content/SearchField';
import { TermRow, type TermModel } from '@/components/content/TermRow';
import { ChipRow } from '@/components/ui/ChipRow';
import { Header } from '@/components/ui/Header';
import { PagedList } from '@/components/ui/PagedList';
import { Screen } from '@/components/ui/Screen';
import { usePagedList } from '@/hooks/usePagedList';
import { plainNumber } from '@/lib/format';
import { open } from '@/lib/nav';
import { moreContentApi } from '@/services/api-content';

type TagSort = 'articles' | 'trending' | 'name';
const SORTS = [
  { value: 'articles', label: 'الأكثر مقالات' },
  { value: 'trending', label: 'الرائجة' },
  { value: 'name', label: 'الاسم' },
] as const satisfies readonly { value: TagSort; label: string }[];

/** S06 — الوسوم (C9). */
export default function TagsScreen() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<TagSort>('articles');
  const list = usePagedList<TermModel, number>(
    async (page, signal) => {
      const p = page ?? 1;
      const d = await moreContentApi.tags({ page: p, search: search || undefined, sort }, signal);
      return {
        items: d.items.map((t) => ({
          key: t.id,
          slug: t.slug,
          name: `#${t.name}`,
          description: null,
          meta: `${plainNumber(t.articleCount)} مقال`,
          logos: t.clientPreviews.flatMap((p) => (p.logoUrl ? [p.logoUrl] : [])),
        })),
        next: d.hasMore ? p + 1 : null,
      };
    },
    [search, sort],
  );
  const renderItem = useCallback(({ item }: { item: TermModel }) => <TermRow item={item} icon="tags" onOpen={open.tag} />, []);
  return (
    <Screen>
      <Header back title="الوسوم" />
      <PagedList
        list={list}
        renderItem={renderItem}
        keyOf={(t) => t.key}
        what="الوسوم"
        skeleton="row"
        header={
          <>
            <SearchField placeholder="ابحث في الوسوم" onChange={setSearch} />
            <ChipRow label="الترتيب" options={SORTS} value={sort} onChange={setSort} />
          </>
        }
        empty={{ icon: 'tags', title: search ? `لا وسم يطابق «${search}»` : 'لا وسوم بعد' }}
      />
    </Screen>
  );
}
