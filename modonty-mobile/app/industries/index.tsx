import { Image } from 'expo-image';
import { router, useSegments } from 'expo-router';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { PartnerCard } from '@/components/content/PartnerCard';
import { TopBar } from '@/components/navigation/TopBar';
import { AppText } from '@/components/ui/AppText';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/StateView';
import { Tap } from '@/components/ui/Tap';
import { useResource } from '@/hooks/useResource';
import { plainNumber } from '@/lib/format';
import { toPartnerCard } from '@/lib/models';
import { open, openExternal } from '@/lib/nav';
import { contentApi } from '@/services/api';
import type { IndustryListItem } from '@/services/api-types';
import { useAppTheme } from '@/theme/ThemeProvider';
import { radius, space } from '@/theme/tokens';

const WEB = process.env.EXPO_PUBLIC_WEB_URL ?? 'https://www.modonty.com';
/** `PartnersGridMobile.tsx` — MAX_VISIBLE. */
const MAX_PARTNERS = 8;
const GAP = 8;

/** `industryArtwork` — صورة المنصّة الافتراضية ليست رسماً للمجال، فتُسقط ويُرسم شعار المجالات. */
function artwork(image: string | undefined): string | null {
  if (!image) return null;
  return image.includes('platform-default-logo') ? null : image;
}

/**
 * S05 — صفحة `/industries` في الموقع على الجوال (`IndustryPageLayout` بلا مجال مختار): «احجز الآن» ·
 * «المجالات» ووعدها · شبكة ٣ أعمدة برسوم مودو لكل مجال (`IndustryTile`) · «وش تحب تقرأ؟» · «N شريك في كل
 * المجالات» بأوّل ثمانية (المميّزون أولاً) و«كل الشركاء ←».
 * الحجز لم يُبنَ في التطبيق بعد — يُفتح من الموقع.
 */
export default function IndustriesScreen() {
  const inTabs = useSegments()[0] === '(tabs)';
  const { colors } = useAppTheme();
  // floor: الكسور تجمع أكثر من العرض على بعض الشاشات فيلتفّ الصفّ إلى عمودين (مقيس على جوال خالد).
  const tile = Math.floor((useWindowDimensions().width - space.screen * 2 - GAP * 2) / 3);

  const data = useResource(async (signal) => {
    const [industries, partners] = await Promise.all([contentApi.industries({ page: 1 }, signal), contentApi.partners({ page: 1 }, signal)]);
    return { industries: industries.items, partners: partners.items, partnersTotal: partners.total };
  }, []);

  const d = data.status === 'success' ? data.data : null;
  const hasBooking = d?.partners.some((p) => p.listedOn.includes('BOOKING')) ?? false;
  const visiblePartners = d ? [...d.partners].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured)).slice(0, MAX_PARTNERS) : [];

  return (
    <Screen>
      {inTabs ? <TopBar /> : <Header back title="المجالات" />}
      <ScrollView contentContainerStyle={styles.body}>
        {hasBooking ? (
          <Tap label="احجز الآن" role="link" onPress={() => openExternal(`${WEB}/booking`)} style={[styles.book, { backgroundColor: colors.brandFill }]}>
            <Icon name="booking" size={20} monochrome />
            <AppText variant="label" style={styles.bold}>
              احجز الآن
            </AppText>
          </Tap>
        ) : null}

        <View style={styles.head}>
          <Icon name="industries" size={44} />
          <View style={styles.flex}>
            <AppText variant="sectionTitle" accessibilityRole="header" style={styles.black}>
              المجالات
            </AppText>
            <AppText variant="secondary" tone="muted">
              اختر مجالك — مقالات وشركاء موثوقون فيه
            </AppText>
          </View>
        </View>

        {data.status === 'loading' ? <ListSkeleton kind="row" /> : null}
        {data.status === 'error' ? <ErrorState error={data.error} onRetry={data.reload} what="المجالات" /> : null}

        {d ? (
          <View accessibilityLabel="تصفّح المجالات" style={styles.grid}>
            {d.industries.map((i) => (
              <IndustryTile key={i.slug} item={i} size={tile} />
            ))}
          </View>
        ) : null}

        {d ? (
          <View style={[styles.prompt, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Icon name="search" size={48} tone="muted" />
            <AppText variant="label" style={styles.bold}>
              وش تحب تقرأ؟
            </AppText>
            <AppText variant="secondary" tone="muted" align="center">
              اختر من فوق، وتطلع لك المقالات هنا.
            </AppText>
          </View>
        ) : null}

        {d && visiblePartners.length > 0 ? (
          <View style={styles.partners}>
            <View style={styles.titleRow}>
              <View style={[styles.accentBar, { backgroundColor: colors.accent }]} />
              <AppText variant="sectionTitle" accessibilityRole="header">
                {`${plainNumber(d.partnersTotal)} شريك في كل المجالات`}
              </AppText>
            </View>
            {visiblePartners.map((p) => (
              <PartnerCard key={p.id} item={toPartnerCard(p)} onOpen={open.partner} />
            ))}
            {d.partnersTotal > MAX_PARTNERS ? (
              <Tap label="كل الشركاء" role="link" onPress={() => router.navigate('/partners-tab')} style={styles.all}>
                <AppText variant="label" tone="interactive">
                  كل الشركاء ←
                </AppText>
              </Tap>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

/** `IndustryTile.tsx` — مربّع الرسم فوق اسم المجال، وشعار المجالات حين لا رسم. */
function IndustryTile({ item, size }: { item: IndustryListItem; size: number }) {
  const { colors } = useAppTheme();
  const art = artwork(item.socialImage);
  return (
    <Tap
      label={`${item.name}، ${plainNumber(item.clientCount)} شريك`}
      role="link"
      onPress={() => open.industry(item.slug)}
      style={[styles.tile, { width: size, backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={[styles.art, { backgroundColor: colors.surfaceHigh }]}>
        {art ? <Image source={art} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} /> : <Icon name="industries" size={28} />}
      </View>
      <AppText variant="secondary" numberOfLines={1} align="center" style={styles.bold}>
        {item.name}
      </AppText>
    </Tap>
  );
}

const styles = StyleSheet.create({
  body: { gap: space.md, paddingHorizontal: space.screen, paddingTop: space.sm, paddingBottom: space.xl },
  flex: { flex: 1 },
  bold: { fontWeight: '700' },
  black: { fontWeight: '900' },
  book: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xxs, borderRadius: radius.card },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  tile: { gap: 6, padding: 6, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  art: { width: '100%', aspectRatio: 1, borderRadius: 8, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  prompt: {
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.lg,
    paddingVertical: space.xl,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  partners: { gap: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  accentBar: { width: 4, height: 22, borderRadius: 2 },
  all: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
