import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { ArticleCard } from '@/components/content/ArticleCard';
import { PartnerCard } from '@/components/content/PartnerCard';
import { SearchField } from '@/components/content/SearchField';
import { AppText } from '@/components/ui/AppText';
import { ChipRow } from '@/components/ui/ChipRow';
import { Header } from '@/components/ui/Header';
import { PagedList } from '@/components/ui/PagedList';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StateView } from '@/components/ui/StateView';
import { usePagedList } from '@/hooks/usePagedList';
import { plainNumber } from '@/lib/format';
import { toArticleCard, type ArticleCardModel, type PartnerCardModel } from '@/lib/models';
import { open } from '@/lib/nav';
import { contentApi } from '@/services/api';
import type { SearchArticleSort, SearchType } from '@/services/api-types';
import { space } from '@/theme/tokens';

const TYPES = [
  { value: 'all', label: 'الكل' },
  { value: 'articles', label: 'المقالات' },
  { value: 'partners', label: 'الشركاء' },
] as const satisfies readonly { value: SearchType; label: string }[];
const SORTS = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'oldest', label: 'الأقدم' },
  { value: 'title', label: 'العنوان' },
] as const satisfies readonly { value: SearchArticleSort; label: string }[];

/** S11 — البحث (S1): مقالات ٢٠ في الصفحة + أهمّ ١٠ شركاء — نفس ما تعرضه `/search`. أقلّ من حرفين لا طلب. */
export default function SearchScreen() {
  const [q, setQ] = useState('');
  const [type, setType] = useState<SearchType>('all');
  const [sort, setSort] = useState<SearchArticleSort>('newest');
  const partners = useRef<PartnerCardModel[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const ready = q.length >= 2;

  const list = usePagedList<ArticleCardModel, number>(
    async (page, signal) => {
      if (!ready) return { items: [], next: null };
      const p = page ?? 1;
      const d = await contentApi.search({ q, type, page: p, sortArticles: sort }, signal);
      if (p === 1) {
        partners.current = d.partners.map((c) => ({
          key: c.id,
          slug: c.slug,
          name: c.name,
          logo: c.logo ?? null,
          line: c.description ?? null,
          meta: [c.industry?.name, c.articleCount > 0 ? `${plainNumber(c.articleCount)} مقال` : null].filter(Boolean).join('، '),
          verified: c.isVerified,
          rating: null,
        }));
        setTotal(d.articles.total);
      }
      return { items: type === 'partners' ? [] : d.articles.items.map(toArticleCard), next: d.articles.hasMore && type !== 'partners' ? p + 1 : null };
    },
    [q, type, sort],
  );
  const onQuery = useCallback((v: string) => setQ(v), []);

  const renderItem = useCallback(({ item }: { item: ArticleCardModel }) => <ArticleCard item={item} onOpen={open.article} layout="row" />, []);
  const shownPartners = list.status === 'success' && type !== 'articles' ? partners.current : [];

  const header = useMemo(
    () => (
      <View>
        <ChipRow label="نوع النتائج" options={TYPES} value={type} onChange={setType} />
        {ready && type !== 'partners' ? <ChipRow label="الترتيب" options={SORTS} value={sort} onChange={setSort} /> : null}
        {shownPartners.length > 0 ? (
          <View style={styles.block}>
            <SectionHeader title="الشركاء" />
            <FlatList
              scrollEnabled={false}
              data={shownPartners}
              keyExtractor={(p) => p.key}
              contentContainerStyle={styles.partners}
              renderItem={({ item }) => <PartnerCard item={item} onOpen={open.partner} />}
            />
          </View>
        ) : null}
        {ready && type !== 'partners' && total !== null && total > 0 ? (
          <AppText variant="label" tone="muted" style={styles.total}>
            {`${plainNumber(total)} مقالاً`}
          </AppText>
        ) : null}
      </View>
    ),
    [type, sort, ready, shownPartners, total],
  );

  return (
    <Screen>
      <Header title="بحث" />
      <SearchField placeholder="ابحث في المقالات والشركاء" onChange={onQuery} />
      {!ready ? (
        <>
          {header}
          <StateView icon="search" title="ابحث في مدونتي" body="اكتب حرفين على الأقلّ للبحث في المقالات والشركاء." />
        </>
      ) : (
        <PagedList
          list={list}
          renderItem={renderItem}
          keyOf={(a) => a.key}
          what="نتائج البحث"
          header={header}
          inTabs
          skeleton="row"
          empty={
            shownPartners.length > 0
              ? { icon: 'articles', title: 'لا مقالات تطابق البحث', body: 'الشركاء المطابقون أعلاه.' }
              : { icon: 'search', title: `لا نتائج لـ«${q}»`, body: 'جرّب كلمة أقصر أو مرادفاً.' }
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { gap: space.sm, paddingTop: space.sm },
  partners: { paddingHorizontal: space.screen, gap: space.listGap },
  total: { paddingHorizontal: space.screen, paddingTop: space.sm },
});
