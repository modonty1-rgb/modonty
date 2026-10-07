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
import { contentApi } from '@/services/api';
import type { CategorySort } from '@/services/api-types';

const SORTS = [
  { value: 'articles', label: 'الأكثر مقالات' },
  { value: 'trending', label: 'الرائجة' },
  { value: 'recent', label: 'الأحدث' },
  { value: 'name', label: 'الاسم' },
] as const satisfies readonly { value: CategorySort; label: string }[];

/** S05 — التصنيفات (C7): بحث + ترتيب، نفس صفحات loadMoreCategories. */
export default function CategoriesScreen() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<CategorySort>('articles');
  const list = usePagedList<TermModel, number>(
    async (page, signal) => {
      const p = page ?? 1;
      const d = await contentApi.categories({ page: p, search: search || undefined, sort }, signal);
      return {
        items: d.items.map((c) => ({
          key: c.id,
          slug: c.slug,
          name: c.name,
          description: c.description ?? null,
          meta: `${plainNumber(c.articleCount)} مقال`,
          logos: (c.clientPreviews ?? []).flatMap((p) => (p.logoUrl ? [p.logoUrl] : [])),
        })),
        next: d.hasMore ? p + 1 : null,
      };
    },
    [search, sort],
  );
  const renderItem = useCallback(({ item }: { item: TermModel }) => <TermRow item={item} icon="categories" onOpen={open.category} />, []);
  return (
    <Screen>
      <Header back title="التصنيفات" />
      <PagedList
        list={list}
        renderItem={renderItem}
        keyOf={(t) => t.key}
        what="التصنيفات"
        skeleton="row"
        header={
          <>
            <SearchField placeholder="ابحث في التصنيفات" onChange={setSearch} />
            <ChipRow label="الترتيب" options={SORTS} value={sort} onChange={setSort} />
          </>
        }
        empty={{ icon: 'categories', title: search ? `لا تصنيف يطابق «${search}»` : 'لا تصنيفات بعد', actionLabel: search ? undefined : 'تحديث', onAction: search ? undefined : list.reload }}
      />
    </Screen>
  );
}
