import { router, useLocalSearchParams, useSegments } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { FeedCard } from '@/components/content/FeedCard';
import { FollowCtaBar } from '@/components/content/FollowCtaBar';
import { ReadingTimeBar } from '@/components/content/ReadingTimeBar';
import { SearchField } from '@/components/content/SearchField';
import { TopBar } from '@/components/navigation/TopBar';
import { AppText } from '@/components/ui/AppText';
import { ChipRow, type ChipOption } from '@/components/ui/ChipRow';
import { Header } from '@/components/ui/Header';
import { PagedList } from '@/components/ui/PagedList';
import { Screen } from '@/components/ui/Screen';
import { useCoreSlug } from '@/hooks/useCoreSlug';
import { usePagedList } from '@/hooks/usePagedList';
import { toArticleCard, type ArticleCardModel } from '@/lib/models';
import { open } from '@/lib/nav';
import { contentApi } from '@/services/api';
import type { ArchiveFilters, ArchiveReadingTime } from '@/services/api-types';
import { useAppTheme } from '@/theme/ThemeProvider';
import { space } from '@/theme/tokens';

const ALL = '__all__';

/**
 * S04 — صفحة `/articles` في الموقع على الجوال (`ArticlesPageLayout`): شريط «تابع مدونتي · شاهد الطلّات» ·
 * «المقالات» ووعدها · بحث فوري بالعنوان · صفّ التصنيفات · بطاقات وقت القراءة بأعدادها · البطاقات.
 * الموقع لا يعرض على الجوال صفّ المجالات ولا الترتيب (خالد ٢١–٢٣ أغسطس) — فلا يعرضهما التطبيق.
 * تاباً في الشريط تُرسم برأس الموقع؛ ومفتوحةً من بطاقة وقت أو تصنيف أو وسم أو مجال برأس رجوع وعنوانها.
 */
export default function ArchiveScreen() {
  const params = useLocalSearchParams<{ category?: string; tag?: string; industry?: string; title?: string; time?: ArchiveReadingTime }>();
  const inTabs = useSegments()[0] === '(tabs)';
  const { colors } = useAppTheme();
  const coreSlug = useCoreSlug();
  const [time, setTime] = useState<ArchiveReadingTime | null>(params.time ?? null);
  const [category, setCategory] = useState<string>(params.category ?? ALL);
  const [search, setSearch] = useState('');
  const filters = useRef<ArchiveFilters | null>(null);
  const [counts, setCounts] = useState<Record<ArchiveReadingTime, number> | undefined>(undefined);
  const [filtersReady, setFiltersReady] = useState(false);

  const list = usePagedList<ArticleCardModel, number>(
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
        setFiltersReady(true);
      }
      if (data.readingTimeCounts) setCounts(data.readingTimeCounts);
      return { items: data.items.map(toArticleCard), next: data.hasMore ? p + 1 : null };
    },
    [time, category, search, params.industry, params.tag],
  );

  // صفّ واحد كالموقع (`FiltersBar.tsx`): «كل التصنيفات» ثم الجذور، وأبناء المفتوح منها بعده بـ«↳».
  const categoryOptions = useMemo<ChipOption<string>[]>(() => {
    const roots = filters.current?.categories ?? [];
    const options: ChipOption<string>[] = [{ value: ALL, label: 'كل التصنيفات' }];
    for (const c of roots) {
      options.push({ value: c.slug, label: c.name });
      const isOpen = category === c.slug || c.children.some((k) => k.slug === category);
      if (isOpen) for (const k of c.children) options.push({ value: k.slug, label: `↳ ${k.name}` });
    }
    return options;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersReady, category]);

  const renderItem = useCallback(({ item }: { item: ArticleCardModel }) => <FeedCard item={item} onOpen={open.article} />, []);

  const header = (
    <View style={styles.head}>
      {coreSlug ? (
        <View style={styles.pad}>
          <FollowCtaBar slug={coreSlug} secondary={{ label: 'شاهد الطلّات', icon: 'reels', onPress: () => router.navigate('/reels') }} />
        </View>
      ) : null}
      {inTabs ? (
        <View style={styles.pad}>
          <View style={styles.titleRow}>
            <View style={[styles.accentBar, { backgroundColor: colors.accent }]} />
            <AppText variant="pageTitle" accessibilityRole="header" style={styles.h1}>
              المقالات
            </AppText>
          </View>
          <AppText variant="body" style={styles.promise}>
            اقرأ اللي يهمّك — بأقلام أهل التخصص.
          </AppText>
        </View>
      ) : null}
      <SearchField placeholder="اكتب كلمة من العنوان..." onChange={setSearch} />
      {params.tag || categoryOptions.length < 2 ? null : (
        <ChipRow label="تصفية بالتصنيف" shape="filter" options={categoryOptions} value={category} onChange={(v) => setCategory(v === category ? ALL : v)} />
      )}
      <ReadingTimeBar value={time} counts={counts} onChange={setTime} />
    </View>
  );

  return (
    <Screen>
      {inTabs ? <TopBar /> : <Header back title={params.title ?? 'المقالات'} />}
      <PagedList
        list={list}
        renderItem={renderItem}
        keyOf={(a) => a.key}
        what="المقالات"
        header={header}
        inTabs={inTabs}
        empty={{
          icon: 'filter',
          title: 'لا مقالات بهذه الفلاتر',
          body: 'جرّب وقت قراءة آخر أو تصنيفاً آخر.',
          actionLabel: 'إزالة الفلاتر',
          onAction: () => {
            setTime(null);
            setCategory(ALL);
          },
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { gap: space.sm, paddingTop: space.sm, paddingBottom: space.xs },
  pad: { paddingHorizontal: space.screen },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  accentBar: { width: 3, height: 26, borderRadius: 2 },
  h1: { fontSize: 28, lineHeight: 34, fontWeight: '900' },
  promise: { marginTop: 4, paddingStart: space.xs + 3, lineHeight: 26 },
});
