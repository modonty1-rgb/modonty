import { useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ArticleCard } from '@/components/content/ArticleCard';
import { AppText } from '@/components/ui/AppText';
import { ChipRow, type ChipOption } from '@/components/ui/ChipRow';
import { Header } from '@/components/ui/Header';
import { PagedList } from '@/components/ui/PagedList';
import { Screen } from '@/components/ui/Screen';
import { usePagedList } from '@/hooks/usePagedList';
import { plainNumber } from '@/lib/format';
import { toArticleCard, type ArticleCardModel } from '@/lib/models';
import { open } from '@/lib/nav';
import { contentApi } from '@/services/api';
import type { ArchiveFilters, ArchiveReadingTime, ArchiveSort } from '@/services/api-types';
import { space } from '@/theme/tokens';

const SORTS: ChipOption<ArchiveSort>[] = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'mostRead', label: 'الأكثر قراءة' },
  { value: 'mostEngaged', label: 'الأكثر تفاعلاً' },
];
const TIMES: ChipOption<'any' | ArchiveReadingTime>[] = [
  { value: 'any', label: 'أي مدّة' },
  { value: 'short', label: 'قصيرة' },
  { value: 'medium', label: 'متوسطة' },
  { value: 'long', label: 'طويلة' },
];
const ALL = '__all__';

/**
 * S04 — أرشيف المقالات بفلاتره (C3): المجال · التصنيف · وقت القراءة · الترتيب. خيارات الفلتر من
 * `withFilters=1` في الصفحة الأولى (نفس getArticlesFilters) — لا قائمة مكتوبة في التطبيق.
 * تقبل `?category=` و`?tag=` و`?industry=` حين تُفتح من صفحة تصنيف أو وسم أو مجال.
 */
export default function ArchiveScreen() {
  const params = useLocalSearchParams<{ category?: string; tag?: string; industry?: string; title?: string }>();
  const [sort, setSort] = useState<ArchiveSort>('newest');
  const [time, setTime] = useState<'any' | ArchiveReadingTime>('any');
  const [industry, setIndustry] = useState<string>(params.industry ?? ALL);
  const [category, setCategory] = useState<string>(params.category ?? ALL);
  const filters = useRef<ArchiveFilters | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  const list = usePagedList<ArticleCardModel, number>(
    async (page, signal) => {
      const p = page ?? 1;
      const data = await contentApi.archive(
        {
          page: p,
          sort,
          time: time === 'any' ? undefined : time,
          industry: industry === ALL ? undefined : industry,
          category: category === ALL ? undefined : category,
          tag: params.tag,
          withFilters: p === 1 && filters.current === null,
        },
        signal,
      );
      if (data.filters) {
        filters.current = data.filters;
        setTotal(data.filters.total);
      }
      return { items: data.items.map(toArticleCard), next: data.hasMore ? p + 1 : null };
    },
    [sort, time, industry, category, params.tag],
  );

  const industryOptions = useMemo<ChipOption<string>[]>(
    () => [{ value: ALL, label: 'كل المجالات' }, ...(filters.current?.industries ?? []).map((i) => ({ value: i.slug, label: `${i.name} (${plainNumber(i.count)})` }))],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [total],
  );
  const categoryOptions = useMemo<ChipOption<string>[]>(() => {
    const all = filters.current?.categories ?? [];
    const visible = industry === ALL ? all : all.filter((c) => c.industrySlugs.includes(industry));
    return [{ value: ALL, label: 'كل التصنيفات' }, ...visible.map((c) => ({ value: c.slug, label: `${c.name} (${plainNumber(c.count)})` }))];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, industry]);

  const renderItem = useCallback(({ item }: { item: ArticleCardModel }) => <ArticleCard item={item} onOpen={open.article} />, []);

  const header = (
    <View style={styles.filters}>
      {params.tag ? null : (
        <>
          {industryOptions.length > 1 ? (
            <ChipRow label="المجال" options={industryOptions} value={industry} onChange={(v) => { setIndustry(v); setCategory(ALL); }} />
          ) : null}
          {categoryOptions.length > 1 ? <ChipRow label="التصنيف" options={categoryOptions} value={category} onChange={setCategory} /> : null}
        </>
      )}
      <ChipRow label="وقت القراءة" options={TIMES} value={time} onChange={setTime} />
      <ChipRow label="الترتيب" options={SORTS} value={sort} onChange={setSort} />
      {total !== null ? (
        <AppText variant="secondary" tone="muted" style={styles.total}>
          {`${plainNumber(total)} مقالاً في الأرشيف`}
        </AppText>
      ) : null}
    </View>
  );

  return (
    <Screen>
      <Header back title={params.title ?? 'المقالات'} />
      <PagedList
        list={list}
        renderItem={renderItem}
        keyOf={(a) => a.key}
        what="المقالات"
        header={header}
        empty={{
          icon: 'filter',
          title: 'لا مقالات بهذه الفلاتر',
          body: 'جرّب مدّة قراءة أخرى أو مجالاً آخر.',
          actionLabel: 'إزالة الفلاتر',
          onAction: () => {
            setTime('any');
            setIndustry(ALL);
            setCategory(ALL);
            setSort('newest');
          },
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { paddingTop: space.xs },
  total: { paddingHorizontal: space.screen, paddingTop: space.xs },
});
