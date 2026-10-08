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
import type { IndustrySort } from '@/services/api-types';

const SORTS = [
  { value: 'clients', label: 'الأكثر شركاء' },
  { value: 'name', label: 'الاسم' },
] as const satisfies readonly { value: IndustrySort; label: string }[];

/** S07 — المجالات (C10a). */
export default function IndustriesScreen() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<IndustrySort>('clients');
  const list = usePagedList<TermModel, number>(
    async (page, signal) => {
      const p = page ?? 1;
      const d = await contentApi.industries({ page: p, search: search || undefined, sort }, signal);
      return {
        items: d.items.map((i) => ({
          key: i.id,
          slug: i.slug,
          name: i.name,
          description: i.description ?? null,
          meta: `${plainNumber(i.clientCount)} شريك`,
          logos: i.clientPreviews.flatMap((p) => (p.logoUrl ? [p.logoUrl] : [])),
        })),
        next: d.hasMore ? p + 1 : null,
      };
    },
    [search, sort],
  );
  const renderItem = useCallback(({ item }: { item: TermModel }) => <TermRow item={item} icon="industries" onOpen={open.industry} />, []);
  return (
    <Screen>
      <Header back title="المجالات" />
      <PagedList
        list={list}
        renderItem={renderItem}
        keyOf={(t) => t.key}
        what="المجالات"
        skeleton="row"
        header={
          <>
            <SearchField placeholder="ابحث في المجالات" onChange={setSearch} />
            <ChipRow label="الترتيب" options={SORTS} value={sort} onChange={setSort} />
          </>
        }
        empty={{ icon: 'industries', title: search ? `لا مجال يطابق «${search}»` : 'لا مجالات بعد' }}
      />
    </Screen>
  );
}
