import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ArticleRow } from '@/components/home/ArticleRow';
import { FeatureCarousel } from '@/components/home/FeatureCarousel';
import { FeedTabs } from '@/components/home/FeedTabs';
import { IndustryChips } from '@/components/home/IndustryChips';
import { ReelRail } from '@/components/home/ReelRail';
import { TimeTiles } from '@/components/home/TimeTiles';
import { greeting, useTabHeader } from '@/components/navigation/TabHeader';
import { PagedList } from '@/components/ui/PagedList';
import { Screen } from '@/components/ui/Screen';
import { usePagedList } from '@/hooks/usePagedList';
import { usePinnedFilters } from '@/hooks/usePinnedFilters';
import { useResource } from '@/hooks/useResource';
import { toArticleRow, type ArticleRowModel } from '@/lib/models';
import { open } from '@/lib/nav';
import { contentApi } from '@/services/api';
import type { ArchiveReadingTime, HomeData } from '@/services/api-types';
import { ds } from '@/theme/tokens';

type Sections = Pick<HomeData, 'reels' | 'industries'> & { featured: ArticleRowModel[] };
/** أحدث ثلاثة في البطاقات المتقلّبة، والباقي في القائمة بلا تكرار. */
const FEATURED = 3;
type FeedView = 'latest' | 'popular';

const TABS: { key: FeedView; label: string }[] = [
  { key: 'latest', label: 'الأحدث' },
  { key: 'popular', label: 'الأكثر قراءة' },
];
/** رقاقات المجالات تدخل الفيد بعد الصفّ الثالث (Screens A · 01). */
const INDUSTRIES_AFTER = 2;

/**
 * S01 — الرئيسية، نظام التصميم ١٫٠ (Screens A · 01): الرأس الكبير · الطلّات · بطاقة «الأحدث» · «عندك كم دقيقة؟»
 * · تبويبات الفيد · صفوف المقالات و«تصفّح حسب المجال» بعد الثالث.
 * البيانات: `/home` (المقالات العشر الأولى + الطلّات + المجالات) ثم `/articles?page&view`.
 * العدّادات: مجموع `/reels/filters` لعدد الطلّات، و`readingTimeCounts` من `/articles/archive` — ويغيبان إن لم يرجعا.
 */
export default function HomeScreen() {
  const [view, setView] = useState<FeedView>('latest');
  // التبويبات تثبت تحت الشريط المطوي عند التمرير (Screens A · 01 — position: sticky).
  // التبويب يتغيّر وهو مثبّت: يبقى مكانه والقائمة تبدأ تحته (usePinnedFilters — يُربط بعد القائمة).
  const keepRef = useRef<() => void>(() => undefined);
  const pickView = useCallback((v: FeedView) => {
    keepRef.current();
    setView(v);
  }, []);
  const tabs = useMemo(() => <FeedTabs tabs={TABS} value={view} onChange={pickView} />, [view, pickView]);
  const top = useTabHeader({ title: 'مدونتي', eyebrow: greeting(), sticky: tabs });
  const [sections, setSections] = useState<Sections | null>(null);
  const featuredKeys = useRef<Set<string>>(new Set());

  const counts = useResource(async (signal) => {
    const [filters, archive] = await Promise.allSettled([contentApi.reelFilters(signal), contentApi.archive({ page: 1 }, signal)]);
    return {
      reels: filters.status === 'fulfilled' ? filters.value.items.reduce((n, f) => n + f.reelCount, 0) : null,
      times: archive.status === 'fulfilled' ? ((archive.value.readingTimeCounts ?? null) as Partial<Record<ArchiveReadingTime, number>> | null) : null,
    };
  }, []);

  const list = usePagedList<ArticleRowModel, number>(
    async (page, signal) => {
      if (view === 'latest' && page === null) {
        const home = await contentApi.home(signal);
        const rows = home.articles.map(toArticleRow);
        const featured = rows.slice(0, FEATURED);
        const rest = rows.slice(FEATURED);
        featuredKeys.current = new Set(featured.map((f) => f.key));
        setSections({ reels: home.reels, industries: home.industries, featured });
        return { items: rest, next: home.hasMore ? 2 : null };
      }
      const p = page ?? 1;
      const next = await contentApi.articles({ page: p, view }, signal);
      // بطاقات الرأس لا تتكرّر في القائمة.
      const items = next.items.map(toArticleRow).filter((a) => !featuredKeys.current.has(a.key));
      return { items, next: next.hasMore ? p + 1 : null };
    },
    [view],
  );

  const pin = usePinnedFilters<ArticleRowModel>(list.status);
  pin.attach(top);
  keepRef.current = pin.keep;

  const renderItem = useCallback(
    ({ item, index }: { item: ArticleRowModel; index: number }) => (
      <>
        <ArticleRow item={item} onOpen={open.article} divider={index !== INDUSTRIES_AFTER} />
        {index === INDUSTRIES_AFTER && sections ? <IndustryChips items={sections.industries} /> : null}
      </>
    ),
    [sections],
  );

  // الرأس ثابت المرجع: يُعاد رسمه فقط حين تتغيّر بياناته أو التبويب — لا مع التمرير.
  const reelsTotal = counts.status === 'success' ? (counts.data?.reels ?? null) : null;
  const times = counts.status === 'success' ? (counts.data?.times ?? null) : null;
  const header = useMemo(
    () => (
    <>
      {top.large}
      {sections ? (
        <View style={styles.sections}>
          <ReelRail reels={sections.reels} total={reelsTotal} />
          <View style={styles.feature}>
            <FeatureCarousel items={sections.featured} badge="الأحدث" onOpen={open.article} />
          </View>
          <TimeTiles counts={times} />
        </View>
      ) : null}
      <View onLayout={top.stickyAnchor}>{tabs}</View>
    </>
  ),
    [top.large, top.stickyAnchor, sections, reelsTotal, times, tabs],
  );

  return (
    <Screen>
      <PagedList
        list={list}
        renderItem={renderItem}
        keyOf={(a) => a.key}
        what="الرئيسية"
        header={header}
        skeleton="row"
        inTabs
        flush
        onScroll={pin.onScroll}
        listRef={pin.listRef}
        empty={{ icon: 'articles', title: 'لا توجد مقالات منشورة بعد', body: 'عُد لاحقاً — المقالات تُنشر هنا فور اعتمادها.', actionLabel: 'تحديث', onAction: list.reload }}
      />
      {top.bar}
    </Screen>
  );
}

const styles = StyleSheet.create({
  // الفجوة قبل التبويبات هنا لا في التبويبات نفسها: الصفّ الثابت لا يحمل هامشاً شفّافاً يكشف ما تحته.
  sections: { paddingTop: ds.space.s1, paddingBottom: ds.space.s5 },
  feature: { paddingTop: ds.space.s6, paddingBottom: ds.space.s1 },
});
