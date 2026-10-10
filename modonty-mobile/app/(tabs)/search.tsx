import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SearchField } from '@/components/content/SearchField';
import { ArticleRow } from '@/components/home/ArticleRow';
import { FeedTabs } from '@/components/home/FeedTabs';
import { Icon } from '@/components/ui/Icon';
import { PagedList } from '@/components/ui/PagedList';
import { Screen } from '@/components/ui/Screen';
import { Tap } from '@/components/ui/Tap';
import { usePagedList } from '@/hooks/usePagedList';
import { partnersCount, plainNumber } from '@/lib/format';
import { toArticleRow, type ArticleRowModel } from '@/lib/models';
import { open } from '@/lib/nav';
import { clearSearches, forgetSearch, rememberSearch, useRecentSearches } from '@/lib/recent-searches';
import { contentApi } from '@/services/api';
import type { SearchArticleSort, SearchType } from '@/services/api-types';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds, dsFontScale } from '@/theme/tokens';

const TABS: { key: SearchType; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'articles', label: 'المقالات' },
  { key: 'partners', label: 'الشركاء' },
];
const SORTS: { value: SearchArticleSort; label: string }[] = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'oldest', label: 'الأقدم' },
  { value: 'title', label: 'العنوان' },
];

type Partner = { id: string; slug: string; name: string; logo: string | null; industry: string | null; verified: boolean };

/** «١٢ مقالاً» بصيغة العدد العربية. */
function articlesCount(n: number) {
  if (n === 1) return 'مقال واحد';
  if (n === 2) return 'مقالان';
  return `${plainNumber(n)} ${n <= 10 ? 'مقالات' : 'مقالاً'}`;
}

/**
 * البحث (S1 — نفس `/search` في الويب) على نظام التصميم ١٫٠: شريط ثابت (رجوع · حقل حبّة يفتح بالكيبورد ·
 * الكل/المقالات/الشركاء) · قبل الكتابة عمليات البحث الحديثة (على الجهاز) · النتائج: الشركاء صفوفاً مختصرة
 * (٣ في «الكل» و«كل الشركاء» يفتح تبويبهم) ثم المقالات بصفّ الرئيسية مع العدد والترتيب. أقلّ من حرفين لا طلب.
 */
export default function SearchScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const recent = useRecentSearches();
  const [q, setQ] = useState('');
  const [fill, setFill] = useState({ text: '', n: 0 });
  const [type, setType] = useState<SearchType>('all');
  const [sort, setSort] = useState<SearchArticleSort>('newest');
  const partners = useRef<Partner[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const ready = q.length >= 2;

  const list = usePagedList<ArticleRowModel, number>(
    async (page, signal) => {
      if (!ready) return { items: [], next: null };
      const p = page ?? 1;
      const d = await contentApi.search({ q, type, page: p, sortArticles: sort }, signal);
      if (p === 1) {
        partners.current = d.partners.map((c) => ({ id: c.id, slug: c.slug, name: c.name, logo: c.logo ?? null, industry: c.industry?.name ?? null, verified: c.isVerified }));
        setTotal(d.articles.total);
      }
      return { items: type === 'partners' ? [] : d.articles.items.map(toArticleRow), next: d.articles.hasMore && type !== 'partners' ? p + 1 : null };
    },
    [q, type, sort],
  );
  const onQuery = useCallback((v: string) => setQ(v), []);
  // البحث يُحفظ حين يُفتح منه شيء — لا مع كل حرف.
  const openArticle = useCallback((slug: string) => (rememberSearch(q), open.article(slug)), [q]);
  const openPartner = useCallback((slug: string) => (rememberSearch(q), open.partner(slug)), [q]);
  const renderItem = useCallback(({ item }: { item: ArticleRowModel }) => <ArticleRow item={item} onOpen={openArticle} />, [openArticle]);

  const shown = list.status === 'success' && type !== 'articles' ? (type === 'all' ? partners.current.slice(0, 3) : partners.current) : [];
  const sortLabel = SORTS.find((s) => s.value === sort)!.label;
  const header = useMemo(
    () => (
      <View>
        {shown.length ? (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={[styles.sectionTitle, { color: colors.text }]} accessibilityRole="header" maxFontSizeMultiplier={1.2}>
                الشركاء
              </Text>
              {type === 'all' && partners.current.length > shown.length ? (
                <Tap label={`كل الشركاء، ${partnersCount(partners.current.length)}`} role="link" onPress={() => setType('partners')} style={styles.more}>
                  <Text style={[styles.moreText, { color: colors.primaryText }]} maxFontSizeMultiplier={1.2}>{`الكل · ${plainNumber(partners.current.length)}`}</Text>
                  <Icon name="chevron" size={18} tone="primaryText" monochrome />
                </Tap>
              ) : null}
            </View>
            <View style={[styles.partners, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {shown.map((p, i) => (
                <Tap key={p.id} label={p.name} role="link" onPress={() => openPartner(p.slug)} style={[styles.partnerRow, i > 0 && { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
                  <View style={[styles.logo, { borderColor: colors.border }]}>{p.logo ? <Image cachePolicy="memory-disk" source={p.logo} style={StyleSheet.absoluteFill} contentFit="cover" recyclingKey={p.id} /> : <Icon name="company" size={20} tone="muted" />}</View>
                  <View style={styles.flex}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.partnerName, { color: colors.text }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                        {p.name}
                      </Text>
                      {p.verified ? <Icon name="trust" size={16} tone="interactive" /> : null}
                    </View>
                    {p.industry ? (
                      <Text style={[styles.partnerSub, { color: colors.interactive }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                        {p.industry}
                      </Text>
                    ) : null}
                  </View>
                  <Icon name="chevron" size={18} tone="muted" monochrome />
                </Tap>
              ))}
            </View>
          </View>
        ) : null}
        {type !== 'partners' && total !== null && total > 0 ? (
          <View style={styles.countRow}>
            <Text style={[styles.count, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
              {articlesCount(total)}
            </Text>
            <Tap
              label={`الترتيب: ${sortLabel}، غيّر`}
              minTarget={false}
              hitSlop={{ top: 6, bottom: 6 }}
              onPress={() => setSort(SORTS[(SORTS.findIndex((s) => s.value === sort) + 1) % SORTS.length]?.value ?? sort)}
              style={[styles.sort, { backgroundColor: colors.sunken }]}
            >
              <Icon name="sort" size={16} tone="text" monochrome />
              <Text style={[styles.sortText, { color: colors.text }]} maxFontSizeMultiplier={1.2}>
                {sortLabel}
              </Text>
            </Tap>
          </View>
        ) : null}
      </View>
    ),
    [shown, type, total, sort, sortLabel, colors, openPartner],
  );

  return (
    <Screen>
      <View style={[styles.top, { paddingTop: insets.top, backgroundColor: colors.page }]}>
        <View style={styles.bar}>
          <Tap label="رجوع" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={styles.back}>
            <Icon name="back" size={24} tone="text" monochrome />
          </Tap>
          <View style={styles.flex}>
            <SearchField key={fill.n} initial={fill.text} placeholder="ابحث في المقالات والشركاء" onChange={onQuery} autoFocus />
          </View>
        </View>
        {ready ? <FeedTabs tabs={TABS} value={type} onChange={setType} /> : null}
      </View>

      {!ready ? (
        <ScrollView contentContainerStyle={[styles.idle, { paddingBottom: insets.bottom + ds.space.s8 }]} keyboardShouldPersistTaps="handled">
          {recent.length ? (
            <>
              <View style={styles.sectionHead}>
                <Text style={[styles.sectionTitle, { color: colors.text }]} accessibilityRole="header" maxFontSizeMultiplier={1.2}>
                  عمليات بحث حديثة
                </Text>
                <Tap label="مسح عمليات البحث الحديثة" onPress={clearSearches} style={styles.more}>
                  <Text style={[styles.moreText, { color: colors.primaryText }]} maxFontSizeMultiplier={1.2}>
                    مسح الكل
                  </Text>
                </Tap>
              </View>
              <View style={[styles.partners, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {recent.map((r, i) => (
                  <View key={r} style={[styles.recentRow, i > 0 && { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
                    <Tap label={`ابحث عن ${r}`} onPress={() => setFill((f) => ({ text: r, n: f.n + 1 }))} style={styles.recentMain}>
                      <Icon name="clock" size={18} tone="muted" monochrome />
                      <Text style={[styles.recentText, { color: colors.text }]} numberOfLines={1} maxFontSizeMultiplier={dsFontScale.max}>
                        {r}
                      </Text>
                    </Tap>
                    <Tap label={`احذف ${r} من الحديثة`} onPress={() => forgetSearch(r)} style={styles.recentX}>
                      <Icon name="close" size={16} tone="muted" monochrome />
                    </Tap>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.hint}>
              <View style={[styles.hintIcon, { backgroundColor: colors.primaryContainer }]}>
                <Icon name="search" size={28} tone="primaryText" monochrome />
              </View>
              <Text style={[styles.hintTitle, { color: colors.text }]} maxFontSizeMultiplier={1.2}>
                ابحث في مدونتي
              </Text>
              <Text style={[styles.hintBody, { color: colors.textSecondary }]} maxFontSizeMultiplier={dsFontScale.max}>
                اكتب حرفين على الأقلّ — نبحث في المقالات والشركاء معاً.
              </Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <PagedList
          list={list}
          renderItem={renderItem}
          keyOf={(a) => a.key}
          what="نتائج البحث"
          header={header}
          skeleton="row"
          flush
          empty={
            type === 'partners'
              ? shown.length > 0
                ? null
                : { icon: 'partner', title: `لا شريك يطابق «${q}»`, body: 'جرّب اسماً آخر أو تبويب «الكل».' }
              : shown.length > 0
                ? { icon: 'articles', title: 'لا مقالات تطابق البحث', body: 'الشركاء المطابقون أعلاه.' }
                : { icon: 'search', title: `لا نتائج لـ«${q}»`, body: 'جرّب كلمة أقصر أو مرادفاً.' }
          }
        />
      )}
    </Screen>
  );
}

const XB = 'Tajawal_800ExtraBold';
const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  top: { zIndex: 2 },
  bar: { flexDirection: 'row', alignItems: 'center', paddingStart: 4 },
  back: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', marginEnd: -12 },
  idle: { paddingHorizontal: ds.layout.gutter, paddingTop: ds.space.s3 },
  section: { paddingHorizontal: ds.layout.gutter, paddingTop: ds.space.s3 },
  sectionHead: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: XB, fontSize: 18, lineHeight: 28 },
  more: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 2 },
  moreText: { fontFamily: 'Tajawal_700Bold', fontSize: 14, lineHeight: 20 },
  partners: { borderRadius: ds.radius.lg, borderWidth: 1, overflow: 'hidden' },
  partnerRow: { minHeight: 64, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, overflow: 'hidden', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  partnerName: { flexShrink: 1, fontFamily: XB, fontSize: 15, lineHeight: 22 },
  partnerSub: { fontFamily: 'Tajawal_700Bold', fontSize: 12, lineHeight: 18 },
  countRow: { paddingHorizontal: ds.layout.gutter, paddingTop: ds.space.s4, paddingBottom: ds.space.s2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  count: { fontFamily: 'Tajawal_700Bold', fontSize: 14, lineHeight: 20 },
  sort: { height: 36, paddingHorizontal: 12, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortText: { fontFamily: 'Tajawal_700Bold', fontSize: 13, lineHeight: 18 },
  recentRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center' },
  recentMain: { flex: 1, minHeight: 52, paddingStart: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  recentText: { flex: 1, fontFamily: 'Tajawal_500Medium', fontSize: 15, lineHeight: 22 },
  recentX: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  hint: { alignItems: 'center', gap: 10, paddingTop: ds.space.s8 },
  hintIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  hintTitle: { fontFamily: XB, fontSize: 20, lineHeight: 28 },
  hintBody: { fontFamily: 'Tajawal_400Regular', fontSize: 15, lineHeight: 24, textAlign: 'center' },
});
