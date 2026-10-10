import { router, useLocalSearchParams, useSegments } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SearchField } from '@/components/content/SearchField';
import { ArticleRow } from '@/components/home/ArticleRow';
import { FeedTabs } from '@/components/home/FeedTabs';
import { TimeTiles } from '@/components/home/TimeTiles';
import { HeaderCircle, useTabHeader } from '@/components/navigation/TabHeader';
import { Header } from '@/components/ui/Header';
import { PagedList } from '@/components/ui/PagedList';
import { Screen } from '@/components/ui/Screen';
import { usePagedList } from '@/hooks/usePagedList';
import { usePinnedFilters } from '@/hooks/usePinnedFilters';
import { plainNumber } from '@/lib/format';
import { toArticleRow, type ArticleRowModel } from '@/lib/models';
import { open } from '@/lib/nav';
import { contentApi } from '@/services/api';
import type { ArchiveFilters, ArchiveReadingTime } from '@/services/api-types';
import { ds } from '@/theme/tokens';

const ALL = '__all__';

/** «٢٥٢ مقالاً منشوراً» بصيغة العدد العربية. */
function publishedCount(n: number): string {
  if (n === 1) return 'مقال واحد منشور';
  if (n === 2) return 'مقالان منشوران';
  if (n <= 10) return `${plainNumber(n)} مقالات منشورة`;
  return `${plainNumber(n)} مقالاً منشوراً`;
}

/**
 * S04 — المقالات، نظام التصميم ١٫٠ (Screens A · 03): الرأس الكبير «المقالات» وتحته عدد المنشور، و«المحفوظة»
 * وحدها إجراءً · بحث بالعنوان · «عندك كم دقيقة؟» فلترٌ في مكانه · تبويبات التصنيفات (تثبت تحت الشريط المطوي)
 * · صفوف المقالات. البيانات: `/articles/archive` (الفلاتر والعدد في الصفحة الأولى، و`readingTimeCounts`).
 * مفتوحةً من بطاقة وقت أو تصنيف أو وسم أو مجال: رأس رجوع بعنوانها، والمحتوى نفسه.
 */
export default function ArchiveScreen() {
  const params = useLocalSearchParams<{ category?: string; tag?: string; industry?: string; title?: string; time?: ArchiveReadingTime }>();
  const inTabs = useSegments()[0] === '(tabs)';
  const [time, setTime] = useState<ArchiveReadingTime | null>(params.time ?? null);
  const [category, setCategory] = useState<string>(params.category ?? ALL);
  const [search, setSearch] = useState('');
  const filters = useRef<ArchiveFilters | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [counts, setCounts] = useState<Record<ArchiveReadingTime, number> | null>(null);
  const [filtersReady, setFiltersReady] = useState(false);

  // التصنيفات الجذرية تبويبات (والمفتوح من خارجها إن كان ابناً) — بلا تبويبات في صفحة وسم.
  const tabsData = useMemo(() => {
    const roots = filters.current?.categories ?? [];
    const tabs: { key: string; label: string }[] = [{ key: ALL, label: 'الكل' }, ...roots.map((c) => ({ key: c.slug, label: c.name }))];
    if (category !== ALL && !tabs.some((t) => t.key === category)) {
      const child = roots.flatMap((c) => c.children).find((k) => k.slug === category);
      if (child) tabs.splice(1, 0, { key: child.slug, label: child.name });
    }
    return tabs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersReady, category]);
  const showTabs = !params.tag && tabsData.length > 1;
  // التبويب يتغيّر وهو مثبّت: يبقى مكانه والمقالات تبدأ تحته (usePinnedFilters — يُربط بعد القائمة).
  const keepRef = useRef<() => void>(() => undefined);
  const pickCategory = useCallback((key: string) => {
    keepRef.current();
    setCategory(key);
  }, []);
  const tabs = useMemo(
    () => (showTabs ? <FeedTabs tabs={tabsData} value={category} onChange={pickCategory} /> : null),
    [showTabs, tabsData, category, pickCategory],
  );

  const saved = useMemo(() => <HeaderCircle icon="bookmark" label="المحفوظة" onPress={() => router.push('/account/favorites')} />, []);
  const top = useTabHeader({ title: 'المقالات', eyebrow: total != null ? publishedCount(total) : undefined, sticky: tabs, actions: saved });

  const list = usePagedList<ArticleRowModel, number>(
    async (page, signal) => {
      const p = page ?? 1;
      const data = await contentApi.archive(
        {
          page: p,
          time: time ?? undefined,
          industry: params.industry,
          category: category === ALL ? undefined : category,
          tag: params.tag,
          search: search || undefined,
          withFilters: p === 1 && filters.current === null,
        },
        signal,
      );
      if (data.filters) {
        filters.current = data.filters;
        setTotal(data.filters.total);
        setFiltersReady(true);
      }
      if (data.readingTimeCounts) setCounts(data.readingTimeCounts);
      return { items: data.items.map(toArticleRow), next: data.hasMore ? p + 1 : null };
    },
    [time, category, search, params.industry, params.tag],
  );

  const pin = usePinnedFilters<ArticleRowModel>(list.status);
  pin.attach(top);
  keepRef.current = pin.keep;

  const renderItem = useCallback(({ item }: { item: ArticleRowModel }) => <ArticleRow item={item} onOpen={open.article} />, []);

  const header = useMemo(
    () => (
      <View>
        {inTabs ? top.large : null}
        <View style={styles.search}>
          <SearchField placeholder="ابحث عن أي موضوع" onChange={setSearch} />
        </View>
        <TimeTiles title={null} counts={counts} value={time} onSelect={setTime} />
        <View style={styles.tabs} onLayout={inTabs ? top.stickyAnchor : undefined}>
          {tabs}
        </View>
      </View>
    ),
    [inTabs, top.large, top.stickyAnchor, counts, time, tabs],
  );

  return (
    <Screen>
      {inTabs ? null : <Header back title={params.title ?? 'المقالات'} />}
      <PagedList
        list={list}
        renderItem={renderItem}
        keyOf={(a) => a.key}
        what="المقالات"
        header={header}
        skeleton="row"
        inTabs={inTabs}
        flush
        onScroll={inTabs ? pin.onScroll : undefined}
        listRef={pin.listRef}
        empty={{
          icon: 'filter',
          title: 'لا مقالات بهذه الفلاتر',
          body: 'جرّب وقت قراءة آخر أو تصنيفاً آخر.',
          actionLabel: 'إزالة الفلاتر',
          onAction: () => {
            setTime(null);
            pickCategory(ALL);
          },
        }}
      />
      {inTabs ? top.bar : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: { paddingTop: ds.space.s3, paddingBottom: ds.space.s1 },
  tabs: { marginTop: ds.space.s4 },
});
