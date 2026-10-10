import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';

import { BecomePartner } from '@/components/content/BecomePartner';
import { DirectoryCard } from '@/components/content/DirectoryCard';
import { SearchField } from '@/components/content/SearchField';
import { useTabHeader } from '@/components/navigation/TabHeader';
import { Icon } from '@/components/ui/Icon';
import { PagedList } from '@/components/ui/PagedList';
import { Screen } from '@/components/ui/Screen';
import { Tap } from '@/components/ui/Tap';
import { usePagedList } from '@/hooks/usePagedList';
import { usePinnedFilters } from '@/hooks/usePinnedFilters';
import { useResource } from '@/hooks/useResource';
import { industriesCount, partnersCount, plainNumber } from '@/lib/format';
import { open } from '@/lib/nav';
import { contentApi } from '@/services/api';
import type { ClientListItem, IndustryListItem } from '@/services/api-types';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds } from '@/theme/tokens';

const ALL = '__all__';
const GOLD = '#E0A100';

/**
 * دليل الشركاء — Screens B · 07، والمستوى الثاني في هرم «اكتشف» (المجالات ← الشركاء ← الشريك):
 * رأس كبير بالرجوع «الشركاء» وتحته «٤٦ شريكاً في ٨ مجالات» · بحث «باسم أو تخصّص أو مدينة» (الخادم يبحث
 * في الاسم والوصف والمجال والمدينة) · رقاقات المجالات بأعدادها تثبت تحت الشريط المطوي · «المميّزون» دوائر
 * بحلقة ذهبية · العدد والترتيب · بطاقات بتمرير لانهائي · «صِر شريكاً» بعد آخر صفحة.
 * صفحة المجال = هذه الشاشة ورقاقته مختارة (`?industry=`)، و«المميّزون · الكل» = `?featured=1`.
 * الترتيب ثابت من الخادم (المميّز ثم الأكثر نشراً — sort-partners.ts، قرار خالد ١٦ أغسطس) فلا قائمة ترتيب.
 */
export default function PartnersScreen() {
  const params = useLocalSearchParams<{ industry?: string; featured?: string }>();
  const featuredOnly = params.featured === '1';
  const { colors } = useAppTheme();
  const [q, setQ] = useState('');
  const [industry, setIndustry] = useState(params.industry || ALL);
  const [count, setCount] = useState<number | null>(null);

  // المجالات بأعدادها + العدد الكلّي + المميّزون: طلب واحد عند الفتح، لا مع كل فلتر.
  const meta = useResource(
    async (signal) => {
      const [industries, all, featured] = await Promise.all([
        contentApi.industries({ page: 1 }, signal),
        contentApi.partners({ page: 1 }, signal),
        contentApi.partners({ page: 1, featured: true }, signal),
      ]);
      return {
        industries: [...industries.items].sort((a, b) => b.clientCount - a.clientCount),
        industriesTotal: industries.total,
        total: all.total,
        featured: featured.items,
      };
    },
    [],
  );
  const m = meta.status === 'success' ? meta.data : null;

  const list = usePagedList<ClientListItem, number>(
    async (page, signal) => {
      const p = page ?? 1;
      const d = await contentApi.partners({ page: p, q: q || undefined, industry: industry === ALL ? undefined : industry, featured: featuredOnly }, signal);
      if (p === 1) setCount(d.total);
      return { items: d.items, next: d.hasMore ? p + 1 : null };
    },
    [q, industry, featuredOnly],
  );

  // تغيير الفلتر والرقاقات مثبّتة: تبقى مكانها (usePinnedFilters)، والعدد القديم يُخفى حتى يصل الجديد.
  const pin = usePinnedFilters<ClientListItem>(list.status);
  const keepChips = useCallback(() => {
    setCount(null);
    pin.keep();
  }, [pin.keep]);
  const industryRef = useRef(industry);
  industryRef.current = industry;
  const pickIndustry = useCallback(
    (slug: string) => {
      if (slug === industryRef.current) return;
      keepChips();
      setIndustry(slug);
    },
    [keepChips],
  );
  // الحقل يرسل نصّه بعد ٤٠٠ms من التركيب أيضاً — لا يُعدّ تغييراً ما لم يختلف النصّ.
  const qRef = useRef('');
  const search = useCallback(
    (text: string) => {
      if (text === qRef.current) return;
      qRef.current = text;
      keepChips();
      setQ(text);
    },
    [keepChips],
  );

  const chips = useMemo(
    () => {
      if (!m) return null;
      // في قائمة المميّزين: المجالات التي فيها مميّز فقط، فلا رقاقة تفتح قائمة فارغة.
      const inFeatured = new Set(m.featured.map((p) => p.industry?.slug).filter(Boolean));
      const industries = featuredOnly ? m.industries.filter((i) => inFeatured.has(i.slug)) : m.industries;
      return <IndustryChips industries={industries} total={featuredOnly ? null : m.total} value={industry} onChange={pickIndustry} />;
    },
    [m, industry, featuredOnly, pickIndustry],
  );
  const title = featuredOnly ? 'المميّزون' : 'الشركاء';
  const eyebrow = m ? (featuredOnly ? partnersCount(m.featured.length) : `${partnersCount(m.total)} في ${industriesCount(m.industriesTotal)}`) : undefined;
  const top = useTabHeader({ title, eyebrow, back: true, sticky: chips });
  pin.attach(top);

  const showFeatured = !featuredOnly && !q && industry === ALL && (m?.featured.length ?? 0) > 0;
  const header = useMemo(
    () => (
      <>
        {top.large}
        <View style={styles.search}>
          <SearchField placeholder="ابحث باسم أو تخصّص أو مدينة" onChange={search} />
        </View>
        <View style={styles.chipsAnchor} onLayout={top.stickyAnchor}>
          {chips}
        </View>
        {showFeatured && m ? <FeaturedRow items={m.featured} /> : null}
        {count != null ? (
          <View style={styles.countRow}>
            <Text style={[styles.count, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
              {partnersCount(count)}
            </Text>
            <SortNote />
          </View>
        ) : null}
      </>
    ),
    [top.large, top.stickyAnchor, search, chips, showFeatured, m, count, colors.textSecondary],
  );

  const renderItem = useCallback(({ item }: { item: ClientListItem }) => <DirectoryCard item={item} />, []);
  const empty = q
    ? { icon: 'partner' as const, title: `لا شريك يطابق «${q}»`, body: 'جرّب اسماً آخر أو مدينة أو تخصّصاً.' }
    : { icon: 'partner' as const, title: 'لا شركاء في هذا المجال بعد', body: 'اختر مجالاً آخر أو «الكل».', actionLabel: 'الكل', onAction: () => pickIndustry(ALL) };

  return (
    <Screen>
      <PagedList
        list={list}
        renderItem={renderItem}
        keyOf={(p) => p.id}
        what="الشركاء"
        skeleton="card"
        flush
        header={header}
        onScroll={pin.onScroll}
        listRef={pin.listRef}
        footer={<BecomePartner />}
        empty={empty}
      />
      {top.bar}
    </Screen>
  );
}

/** الترتيب ثابت من الخادم — يُقال نصّاً لا زرّاً لا يفعل شيئاً. */
function SortNote() {
  const { colors } = useAppTheme();
  return (
    <View style={styles.sort} accessible accessibilityLabel="الترتيب: المميّزون ثم الأنشط نشراً">
      <Icon name="sort" size={16} tone="muted" monochrome />
      <Text style={[styles.sortText, { color: colors.muted }]} maxFontSizeMultiplier={1.2}>
        الأنشط أولاً
      </Text>
    </View>
  );
}

/** رقاقات المجالات ٤٠ بأعدادها — المختارة كحلية ممتلئة (Screens B · 07)، وتمرّ أفقياً. */
const IndustryChips = memo(function IndustryChips({
  industries,
  total,
  value,
  onChange,
}: {
  industries: IndustryListItem[];
  total: number | null;
  value: string;
  onChange: (slug: string) => void;
}) {
  const { colors, scheme } = useAppTheme();
  const onFill = scheme === 'dark' ? colors.primary : colors.navy;
  // المختارة تُرى دائماً: القادم من بطاقة مجال قد تكون رقاقته خارج الشاشة.
  const scroller = useRef<ScrollView>(null);
  const placeSelected = (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    scroller.current?.scrollTo({ x: Math.max(0, x + width / 2 - 180), animated: false });
  };
  const items = [{ slug: ALL, name: 'الكل', n: total }, ...industries.map((i) => ({ slug: i.slug, name: i.name, n: total == null ? null : i.clientCount }))];
  return (
    <ScrollView ref={scroller} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={{ backgroundColor: colors.page, borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }}>
      {items.map((c) => {
        const on = c.slug === value;
        return (
          <Tap
            key={c.slug}
            label={c.n != null ? `${c.name}، ${partnersCount(c.n)}` : c.name}
            role="tab"
            accessibilityState={{ selected: on }}
            scale={0.96}
            // رقاقة ٤٠ مرسومة، وهدف اللمس ٤٨ بامتداد ٤ فوق وتحت (Material: chip 32–40 + touch 48).
            minTarget={false}
            hitSlop={{ top: 4, bottom: 4 }}
            onPress={() => onChange(c.slug)}
            onLayout={on && c.slug !== ALL ? placeSelected : undefined}
            style={[styles.chip, on ? { backgroundColor: onFill } : { backgroundColor: colors.surface, borderColor: colors.borderStrong, borderWidth: 1 }]}
          >
            <Text style={[styles.chipText, { color: on ? '#FFFFFF' : colors.text }]} maxFontSizeMultiplier={1.2}>
              {c.name}
            </Text>
            {c.n != null ? (
              <Text style={[styles.chipCount, { color: on ? (scheme === 'dark' ? '#FFFFFF' : '#DCDAF2') : colors.muted }]} maxFontSizeMultiplier={1.2}>
                {plainNumber(c.n)}
              </Text>
            ) : null}
          </Tap>
        );
      })}
    </ScrollView>
  );
});

/** «المميّزون» — دوائر ٦٨ بحلقة ذهبية والاسم سطرين، و«الكل» يفتح القائمة المميّزة وحدها. */
function FeaturedRow({ items }: { items: ClientListItem[] }) {
  const { colors } = useAppTheme();
  return (
    <View>
      <View style={styles.sectionHead}>
        <Text style={[styles.sectionTitle, { color: colors.text }]} accessibilityRole="header" maxFontSizeMultiplier={1.2}>
          المميّزون
        </Text>
        <Tap label="كل المميّزين" role="link" onPress={() => router.push({ pathname: '/partners', params: { featured: '1' } })} style={styles.more}>
          <Text style={[styles.moreText, { color: colors.primaryText }]} maxFontSizeMultiplier={1.2}>
            الكل
          </Text>
          <Icon name="chevron" size={18} tone="primaryText" monochrome />
        </Tap>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featured}>
        {items.map((p) => (
          <Tap key={p.id} label={p.name} role="link" scale={0.95} onPress={() => open.partner(p.slug)} style={styles.fItem}>
            <View style={[styles.ring, { backgroundColor: '#FFFFFF' }]}>
              {p.logo ? <Image cachePolicy="memory-disk" source={p.logo} recyclingKey={p.id} style={styles.fLogo} contentFit="cover" /> : <Icon name="company" size={28} tone="muted" />}
            </View>
            <Text style={[styles.fName, { color: colors.text }]} numberOfLines={2} maxFontSizeMultiplier={1.2}>
              {p.name}
            </Text>
          </Tap>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  search: { paddingTop: ds.space.s2 },
  chipsAnchor: { marginTop: ds.space.s3 },
  chips: { gap: ds.space.s2, paddingHorizontal: ds.layout.gutter, paddingVertical: ds.space.s2 },
  chip: { height: 40, paddingHorizontal: ds.space.s4, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipText: { fontFamily: 'Tajawal_700Bold', fontSize: 14, lineHeight: 20 },
  chipCount: { fontFamily: 'Tajawal_500Medium', fontSize: 13, lineHeight: 18 },
  sectionHead: { paddingTop: ds.space.s5, paddingBottom: 10, paddingHorizontal: ds.layout.gutter, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: 'Tajawal_800ExtraBold', fontSize: 20, lineHeight: 28 },
  more: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 2 },
  moreText: { fontFamily: 'Tajawal_700Bold', fontSize: 14, lineHeight: 20 },
  featured: { gap: ds.space.s3, paddingHorizontal: ds.layout.gutter },
  fItem: { width: 84, alignItems: 'center', gap: 6 },
  ring: { width: 68, height: 68, borderRadius: 34, borderWidth: 3, borderColor: GOLD, padding: 2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  fLogo: { width: 58, height: 58, borderRadius: 29 },
  fName: { fontFamily: 'Tajawal_700Bold', fontSize: 12, lineHeight: 17, textAlign: 'center' },
  countRow: { paddingTop: ds.space.s5, paddingBottom: 10, paddingHorizontal: ds.layout.gutter, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  count: { fontFamily: 'Tajawal_700Bold', fontSize: 14, lineHeight: 20 },
  sort: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortText: { fontFamily: 'Tajawal_500Medium', fontSize: 13, lineHeight: 20 },
});
