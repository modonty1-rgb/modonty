import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useSegments } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PartnerCard } from '@/components/content/PartnerCard';
import { SearchField } from '@/components/content/SearchField';
import { SectionTitle } from '@/components/home/SectionTitle';
import { useTabHeader } from '@/components/navigation/TabHeader';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { ErrorState, StateView } from '@/components/ui/StateView';
import { Tap } from '@/components/ui/Tap';
import { useResource } from '@/hooks/useResource';
import { industriesCount, partnersCount } from '@/lib/format';
import { toPartnerCard } from '@/lib/models';
import { open } from '@/lib/nav';
import { contentApi } from '@/services/api';
import type { IndustryListItem } from '@/services/api-types';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds, dsFontScale, dsType } from '@/theme/tokens';

/** `industryArtwork` — صورة المنصّة الافتراضية ليست رسماً للمجال، فتُسقط ويُرسم شعار المجالات. */
function artwork(image: string | undefined): string | null {
  if (!image) return null;
  return image.includes('platform-default-logo') ? null : image;
}

/**
 * تاب «المجالات» — نظام التصميم ١٫٠ (Screens B · 06): الرأس «المجالات» وتحته «٤٦ شريكاً في ٨ مجالات»، ومودو
 * إجراءً · بحث «مجال أو شريك» (الخادم يبحث في المجالات) · بطاقة قائدة لأكبر مجال (رسمه · وصفه · شعارات ٣ من
 * شركائه · «تصفّح») · «كل المجالات» شبكة عمودين · «كل الشركاء» صفّاً في الآخر.
 * البيانات: `/industries` (الأعداد وشعارات المعاينة) و`/partners` (العدد الكلّي فقط).
 */
export default function IndustriesScreen() {
  const inTabs = useSegments()[0] === '(tabs)';
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const data = useResource(
    async (signal) => {
      // البحث «مجال أو شريك»: المجالات بالاسم + الشركاء بالاسم (نقطتان في الخادم) — والعدد الكلّي من نفس طلب الشركاء.
      const [industries, partners] = await Promise.all([
        contentApi.industries({ page: 1, search: search || undefined }, signal),
        contentApi.partners({ page: 1, q: search || undefined }, signal),
      ]);
      return {
        industries: industries.items,
        industriesTotal: industries.total,
        partnersTotal: partners.total,
        partnerHits: search ? partners.items.slice(0, 8).map(toPartnerCard) : [],
      };
    },
    [search],
  );
  const d = data.status === 'success' ? data.data : null;
  const sorted = useMemo(() => (d ? [...d.industries].sort((a, b) => b.clientCount - a.clientCount) : []), [d]);
  const [leader, ...rest] = sorted;
  const eyebrow = d && !search ? `${partnersCount(d.partnersTotal)} في ${industriesCount(d.industriesTotal)}` : undefined;

  const modo = useMemo(
    () => (
      <Tap label="مودو" onPress={() => router.navigate('/modo')} style={styles.modo}>
        <LinearGradient colors={[colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.modoFill}>
          <Icon name="ai" size={22} tone="onPrimary" monochrome />
        </LinearGradient>
      </Tap>
    ),
    [colors.primary, colors.accent],
  );
  const top = useTabHeader({ title: 'المجالات', eyebrow, actions: modo });

  return (
    <Screen>
      {inTabs ? null : <Header back title="المجالات" />}
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + (inTabs ? ds.layout.contentBottomInset : ds.space.s8) }}
        onScroll={inTabs ? top.onScroll : undefined}
        scrollEventThrottle={16}
      >
        {inTabs ? top.large : null}
        <View style={styles.search}>
          <SearchField placeholder="ابحث عن مجال أو شريك" onChange={setSearch} />
        </View>

        {data.status === 'loading' ? (
          <ListSkeleton kind="row" />
        ) : data.status === 'error' ? (
          <ErrorState error={data.error} onRetry={data.reload} what="المجالات" />
        ) : !leader && !d?.partnerHits.length ? (
          <StateView icon="industries" title={search ? `لا مجال ولا شريك باسم «${search}»` : 'لا مجالات بعد'} body={search ? 'جرّب كلمة أخرى، أو ابحث في دليل الشركاء.' : undefined} actionLabel="دليل الشركاء" onAction={() => router.push('/partners')} />
        ) : (
          <>
            {search && d?.partnerHits.length ? (
              <>
                <SectionTitle title="شركاء" />
                <View style={styles.hits}>
                  {d.partnerHits.map((p) => (
                    <PartnerCard key={p.key} item={p} onOpen={open.partner} />
                  ))}
                </View>
              </>
            ) : null}
            {leader ? <LeaderCard item={leader} /> : null}
            {rest.length ? (
              <>
                <SectionTitle title="كل المجالات" />
                <View style={styles.grid}>
                  {rest.map((i) => (
                    <IndustryCard key={i.id} item={i} />
                  ))}
                </View>
              </>
            ) : null}
            {/* في البحث العدد مفلتر فلا يصلح لـ«كل الشركاء» — الصفّ يظهر في التصفّح فقط */}
            {d && !search ? (
              <Tap label={`كل الشركاء، ${partnersCount(d.partnersTotal)}`} role="link" scale={0.97} onPress={() => router.push('/partners')} style={[styles.allRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.allIcon, { backgroundColor: colors.sunken }]}>
                  <Icon name="company" size={20} tone="text" monochrome />
                </View>
                <Text style={[dsType.labelLg, styles.flex, { color: colors.text, fontFamily: 'Tajawal_800ExtraBold' }]} maxFontSizeMultiplier={dsFontScale.max}>
                  كل الشركاء
                </Text>
                <Text style={[dsType.bodySm, { color: colors.muted }]} maxFontSizeMultiplier={1.2}>
                  {partnersCount(d.partnersTotal)}
                </Text>
                <Icon name="chevron" size={20} tone="text" monochrome />
              </Tap>
            ) : null}
          </>
        )}
      </ScrollView>
      {inTabs ? top.bar : null}
    </Screen>
  );
}

/** البطاقة القائدة — أكبر مجال بعدد الشركاء (Screens B · 06). */
function LeaderCard({ item }: { item: IndustryListItem }) {
  const { colors, scheme } = useAppTheme();
  const art = artwork(item.socialImage);
  return (
    <View style={[styles.leader, { backgroundColor: colors.primaryContainer }]}>
      <View style={styles.leaderTop}>
        <View style={[styles.leaderArt, { backgroundColor: colors.surface }]}>
          {art ? <Image cachePolicy="memory-disk" source={art} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} /> : <Icon name="industries" size={36} />}
        </View>
        <View style={styles.flex}>
          <Text style={[dsType.label, { color: colors.primaryText, fontSize: 13 }]} maxFontSizeMultiplier={1.2}>
            الأكثر شركاء
          </Text>
          <Text style={[styles.leaderName, { color: colors.onPrimaryContainer }]} numberOfLines={2} maxFontSizeMultiplier={1.2} accessibilityRole="header">
            {item.name}
          </Text>
          <Text style={[dsType.label, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
            {partnersCount(item.clientCount)}
          </Text>
        </View>
      </View>
      {item.description ? (
        <Text style={[dsType.bodySm, { color: colors.textSecondary, lineHeight: 23 }]} numberOfLines={2} maxFontSizeMultiplier={dsFontScale.max}>
          {item.description}
        </Text>
      ) : null}
      <View style={styles.leaderFoot}>
        <View style={styles.stack} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {/* الشريك بلا شعار لا يظهر دائرةً فارغة */}
          {item.clientPreviews.filter((c) => c.logoUrl).slice(0, 3).map((c, i) => (
            <View key={c.id} style={[styles.stackItem, { borderColor: colors.primaryContainer, marginStart: i === 0 ? 0 : -10 }]}>
              {c.logoUrl ? <Image cachePolicy="memory-disk" source={c.logoUrl} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
            </View>
          ))}
        </View>
        <Tap label={`تصفّح ${item.name}`} role="link" scale={0.96} onPress={() => open.industry(item.slug)} style={[styles.browse, { backgroundColor: scheme === 'dark' ? colors.primary : colors.navy }]}>
          <Text style={styles.browseText} maxFontSizeMultiplier={1.2}>
            تصفّح
          </Text>
          <Icon name="chevron" size={18} tone="onReels" monochrome />
        </Tap>
      </View>
    </View>
  );
}

/** بطاقة مجال في الشبكة: رسم دائري ٧٦ · الاسم سطرين (ارتفاع ثابت) · عدد الشركاء. */
function IndustryCard({ item }: { item: IndustryListItem }) {
  const { colors } = useAppTheme();
  const art = artwork(item.socialImage);
  return (
    <Tap
      label={`${item.name}، ${partnersCount(item.clientCount)}`}
      role="link"
      scale={0.97}
      onPress={() => open.industry(item.slug)}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={[styles.cardArt, { backgroundColor: colors.surfaceHigh }]}>
        {art ? <Image cachePolicy="memory-disk" source={art} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} /> : <Icon name="industries" size={30} />}
      </View>
      <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={2} maxFontSizeMultiplier={dsFontScale.max}>
        {item.name}
      </Text>
      <Text style={[dsType.bodySm, { color: colors.muted, fontSize: 13, lineHeight: 20 }]} maxFontSizeMultiplier={1.2}>
        {partnersCount(item.clientCount)}
      </Text>
    </Tap>
  );
}

const XB = 'Tajawal_800ExtraBold';
const styles = StyleSheet.create({
  flex: { flex: 1 },
  search: { paddingTop: ds.space.s3 },
  modo: { width: 48, height: 48 },
  modoFill: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  leader: { marginHorizontal: ds.layout.gutter, marginTop: ds.space.s4, borderRadius: 24, padding: 18, gap: ds.space.s3 },
  leaderTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  leaderArt: { width: 96, height: 96, borderRadius: 48, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  leaderName: { fontFamily: 'Tajawal_900Black', fontSize: 22, lineHeight: 30 },
  leaderFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stack: { flexDirection: 'row' },
  stackItem: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, overflow: 'hidden', backgroundColor: '#FFFFFF' },
  browse: { height: 48, paddingHorizontal: 22, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 4 },
  browseText: { color: '#FFFFFF', fontFamily: 'Tajawal_700Bold', fontSize: 15, lineHeight: 20 },
  hits: { paddingHorizontal: ds.layout.gutter, gap: ds.space.s2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: ds.layout.gridGap, paddingHorizontal: ds.layout.gutter },
  card: { width: '47.5%', flexGrow: 1, borderRadius: ds.radius.lg, borderWidth: StyleSheet.hairlineWidth, paddingTop: ds.space.s4, paddingHorizontal: 10, paddingBottom: 14, alignItems: 'center', gap: ds.space.s2 },
  cardArt: { width: 76, height: 76, borderRadius: 38, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  cardName: { fontFamily: XB, fontSize: 15, lineHeight: 22, minHeight: 44, textAlign: 'center', textAlignVertical: 'center' },
  allRow: { marginHorizontal: ds.layout.gutter, marginTop: ds.space.s4, minHeight: 64, borderRadius: ds.radius.lg, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: ds.space.s4, flexDirection: 'row', alignItems: 'center', gap: ds.space.s3 },
  allIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
