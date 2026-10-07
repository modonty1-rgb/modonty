import { useCallback, useMemo, useRef, useState } from 'react';

import { PartnerCard } from '@/components/content/PartnerCard';
import { SearchField } from '@/components/content/SearchField';
import { ChipRow, type ChipOption } from '@/components/ui/ChipRow';
import { Header } from '@/components/ui/Header';
import { PagedList } from '@/components/ui/PagedList';
import { Screen } from '@/components/ui/Screen';
import { usePagedList } from '@/hooks/usePagedList';
import { toPartnerCard, type PartnerCardModel } from '@/lib/models';
import { open } from '@/lib/nav';
import { contentApi } from '@/services/api';

const ALL = '__all__';

/**
 * S08 — دليل الشركاء (C11): بحث · مجال · المميّزون. ترتيب واحد ثابت كما الويب.
 * خيارات المجال من الشركاء أنفسهم في الصفحة الأولى، لا قائمة مكتوبة.
 */
export default function PartnersScreen() {
  const [q, setQ] = useState('');
  const [industry, setIndustry] = useState(ALL);
  const [featured, setFeatured] = useState<'all' | 'featured'>('all');
  const industries = useRef(new Map<string, string>());
  const [, bump] = useState(0);

  const list = usePagedList<PartnerCardModel, number>(
    async (page, signal) => {
      const p = page ?? 1;
      const d = await contentApi.partners({ page: p, q: q || undefined, industry: industry === ALL ? undefined : industry, featured: featured === 'featured' }, signal);
      let added = false;
      for (const c of d.items) {
        if (c.industry && !industries.current.has(c.industry.slug)) {
          industries.current.set(c.industry.slug, c.industry.name);
          added = true;
        }
      }
      if (added) bump((n) => n + 1);
      return { items: d.items.map(toPartnerCard), next: d.hasMore ? p + 1 : null };
    },
    [q, industry, featured],
  );
  const industryOptions = useMemo<ChipOption<string>[]>(
    () => [{ value: ALL, label: 'كل المجالات' }, ...[...industries.current].map(([value, label]) => ({ value, label }))],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [list.items.length],
  );
  const renderItem = useCallback(({ item }: { item: PartnerCardModel }) => <PartnerCard item={item} onOpen={open.partner} />, []);
  return (
    <Screen>
      <Header back title="دليل الشركاء" />
      <PagedList
        list={list}
        renderItem={renderItem}
        keyOf={(p) => p.key}
        what="الشركاء"
        skeleton="row"
        header={
          <>
            <SearchField placeholder="ابحث باسم الشريك أو خدمته" onChange={setQ} />
            <ChipRow
              label="العرض"
              options={[
                { value: 'all', label: 'الكل' },
                { value: 'featured', label: 'المميّزون' },
              ]}
              value={featured}
              onChange={setFeatured}
            />
            {industryOptions.length > 1 ? <ChipRow label="المجال" options={industryOptions} value={industry} onChange={setIndustry} /> : null}
          </>
        }
        empty={{ icon: 'partner', title: 'لا شركاء يطابقون البحث', body: 'جرّب كلمة أخرى أو مجالاً آخر.' }}
      />
    </Screen>
  );
}
