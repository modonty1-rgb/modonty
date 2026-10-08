import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useRef } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { ModontyWordmark } from '@/components/brand/ModontyWordmark';
import type { ModontyIconName } from '@/components/brand/ModontyIcon';
import { ArticleCard } from '@/components/content/ArticleCard';
import { TopBar } from '@/components/navigation/TopBar';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { PagedList } from '@/components/ui/PagedList';
import { Screen } from '@/components/ui/Screen';
import { Tap } from '@/components/ui/Tap';
import { useFollow } from '@/hooks/useFollow';
import { usePagedList } from '@/hooks/usePagedList';
import { articleRow, type ArticleCardModel } from '@/lib/models';
import { open, openExternal } from '@/lib/nav';
import { contentApi } from '@/services/api';
import { moreContentApi } from '@/services/api-content';
import { useAppTheme } from '@/theme/ThemeProvider';
import { radius, space } from '@/theme/tokens';

/** `modonty/constants/partner.ts` — PARTNER_SIGNUP_URL. */
const PARTNER_SIGNUP_URL = 'https://pay.modonty.com';
const WEB = process.env.EXPO_PUBLIC_WEB_URL ?? 'https://www.modonty.com';

type Door = { key: string; label: string; icon: ModontyIconName; go: () => void };

/**
 * الخانات التسع بترتيب الموقع على الجوال (`SectorRow.tsx` + `helpers/sectors.ts` — تصميم خالد ٢٦ سبتمبر):
 * عجلة الحظ · مودو لينك · القرآن، ثم القطاعات الستّ. القطاعات شاشاتها في التطبيق (`/sectors/[key]`)،
 * والثلاث الأولى صفحات خاصّة لم تُبنَ في التطبيق بعد — تُفتح من الموقع.
 */
const DOORS: Door[] = [
  { key: 'luckyWheel', label: 'عجلة الحظ', icon: 'luckyWheel', go: () => openExternal(`${WEB}/lucky-wheel`) },
  { key: 'modoLink', label: 'مودو لينك', icon: 'link', go: () => openExternal(`${WEB}/modo-link`) },
  { key: 'quran', label: 'القرآن الكريم', icon: 'quran', go: () => openExternal(`${WEB}/quran`) },
  ...(
    [
      ['football', 'الكورة', 'football'],
      ['ai', 'الذكاء الاصطناعي', 'ai'],
      ['entrepreneurship', 'ريادة الأعمال', 'markets'],
      ['entertainment', 'الترفيه', 'entertainment'],
      ['education', 'التعليم', 'education'],
      ['health', 'الصحة والجمال', 'health'],
    ] as const
  ).map(([key, label, icon]) => ({ key, label, icon, go: () => router.push({ pathname: '/sectors/[key]', params: { key } }) })),
];

/** «اكتشف · تعلّم · تطوّر» — `messages.modonty.landing` بأيقوناتها (IconCompass · IconIdea · IconGrowth). */
const VALUES: { label: string; icon: ModontyIconName }[] = [
  { label: 'اكتشف', icon: 'directions' },
  { label: 'تعلّم', icon: 'idea' },
  { label: 'تطوّر', icon: 'markets' },
];

type Landing = { slug: string; art: string | null; cover: string | null };

/**
 * تاب «مدونتي» = صفحة `/modonty` في الموقع على الجوال (`ModontyMobileLanding` + `SectorRow` +
 * `ModontyArticlesFeed`): الصورة · الشعار · «كل اللي يهمك… في مكان واحد» · القيم الثلاث · تابع مدونتي
 * وصِر شريكاً · الخانات التسع · «من قلمنا» مقالات مدونتي نفسها.
 * البيانات: `coreClientSlug` من `/home` (الموقع يقرأ `Settings.coreClientId` ولا يكتب الاسم بيده)، ثم صفحة
 * الشريك نفسه ومقالاته.
 */
export default function ModontyScreen() {
  const landing = useRef<Landing | null>(null);

  const list = usePagedList<ArticleCardModel, number>(async (page, signal) => {
    let slug = landing.current?.slug;
    if (!slug) {
      const home = await contentApi.home(signal);
      if (!home.coreClientSlug) throw new Error('مدونتي غير مضبوطة في الإعدادات');
      slug = home.coreClientSlug;
      const profile = await contentApi.partner(slug, signal);
      landing.current = { slug, art: profile.partner.mobileHero ?? null, cover: profile.partner.hero };
    }
    const p = page ?? 1;
    const d = await moreContentApi.partnerArticles(slug, p, signal);
    return {
      items: d.items.map((a) => articleRow({ slug: a.slug, title: a.title, excerpt: a.excerpt, image: a.imageUrl, dateLabel: a.date })),
      next: d.hasMore ? p + 1 : null,
    };
  }, []);

  const renderItem = useCallback(({ item }: { item: ArticleCardModel }) => <ArticleCard item={item} onOpen={open.article} />, []);
  const l = list.status === 'success' ? landing.current : null;

  return (
    <Screen>
      <TopBar />
      <PagedList
        list={list}
        renderItem={renderItem}
        keyOf={(a) => a.key}
        what="مدونتي"
        header={<LandingHeader landing={l} />}
        inTabs
        empty={{ icon: 'articles', title: 'ما نشرنا مقالات بعد', body: 'تابعنا، جايين قريب.' }}
      />
    </Screen>
  );
}

const GRID_GAP = 10;

function LandingHeader({ landing }: { landing: Landing | null }) {
  const { colors } = useAppTheme();
  // ٣×٣ متساوية كالموقع: العرض محسوب لا نسبة — النسبة مع `gap` كانت تلفّ الصفّ إلى عمودين (مقيس على المحاكي).
  const doorWidth = (useWindowDimensions().width - space.screen * 2 - GRID_GAP * 2) / 3;
  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        {landing?.art ? (
          <Image source={landing.art} style={styles.art} contentFit="contain" transition={200} accessibilityIgnoresInvertColors />
        ) : landing?.cover ? (
          <Image source={landing.cover} style={styles.cover} contentFit="cover" transition={200} accessibilityIgnoresInvertColors />
        ) : null}
        <ModontyWordmark width={144} height={28} />
        <AppText variant="pageTitle" align="center" accessibilityRole="header" style={styles.headline}>
          كل اللي يهمك…{' '}
          <AppText variant="pageTitle" tone="interactive">
            في مكان واحد
          </AppText>
        </AppText>
        <AppText variant="secondary" tone="muted" align="center" style={styles.sub}>
          مدونتي تجمع لك المعرفة، الأدوات، الفرص والمحتوى الملهم في تجربة واحدة.
        </AppText>
        <View accessibilityLabel="مدونتي في ثلاث" style={[styles.values, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {VALUES.map((v, i) => (
            <View key={v.label} style={[styles.value, i > 0 && { borderStartWidth: StyleSheet.hairlineWidth, borderStartColor: colors.border }]}>
              <Icon name={v.icon} size={20} />
              <AppText variant="label" style={styles.bold}>
                {v.label}
              </AppText>
            </View>
          ))}
        </View>
        {landing ? <CtaPair slug={landing.slug} /> : null}
      </View>

      <View style={styles.grid}>
        {DOORS.map((d) => (
          <Tap key={d.key} label={d.label} role="link" onPress={d.go} style={[styles.door, { width: doorWidth, backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.doorIcon, { backgroundColor: colors.surfaceHigh }]}>
              <Icon name={d.icon} size={24} />
            </View>
            <AppText variant="secondary" numberOfLines={1} style={styles.doorLabel}>
              {d.label}
            </AppText>
          </Tap>
        ))}
      </View>

      <View style={styles.feedHead}>
        <View style={[styles.accentBar, { backgroundColor: colors.accent }]} />
        <AppText variant="sectionTitle" accessibilityRole="header">
          من قلمنا
        </AppText>
      </View>
    </View>
  );
}

/** «تابع مدونتي» (متابعة حقيقية — FollowCtaButton) و«صِر شريكاً» (pay.modonty.com) جنباً إلى جنب كما في الموقع. */
function CtaPair({ slug }: { slug: string }) {
  const { colors } = useAppTheme();
  const { following, busy, toggle } = useFollow(slug);
  const label = following === null ? 'جارٍ التحقّق…' : busy ? (following ? 'يُلغى…' : 'يُتابَع…') : following ? 'تتابع مدونتي' : 'تابع مدونتي';
  return (
    <View style={styles.ctas}>
      <Tap
        label={label}
        onPress={toggle}
        disabled={busy || following === null}
        style={[styles.cta, { backgroundColor: following ? colors.surface : colors.brandFill, borderColor: colors.brandFill }]}
      >
        <Icon name={following ? 'check' : 'notifications'} size={20} tone="text" monochrome={!following} />
        <AppText variant="label" style={styles.bold}>
          {label}
        </AppText>
      </Tap>
      <Tap label="صِر شريكاً" role="link" onPress={() => openExternal(PARTNER_SIGNUP_URL)} style={[styles.cta, { backgroundColor: colors.surface, borderColor: colors.brandFill }]}>
        <Icon name="partner" size={20} />
        <AppText variant="label" style={styles.bold}>
          صِر شريكاً
        </AppText>
      </Tap>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.lg, paddingTop: space.sm, paddingBottom: space.sm },
  hero: { alignItems: 'center', paddingHorizontal: space.screen, gap: space.xs },
  art: { width: '100%', maxWidth: 384, aspectRatio: 2 },
  cover: { width: '100%', aspectRatio: 6, borderRadius: radius.card, marginBottom: space.xs },
  headline: { marginTop: space.xs },
  sub: { maxWidth: 300 },
  values: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 6,
    paddingHorizontal: space.xxs,
    marginTop: space.xs,
  },
  value: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: space.sm },
  bold: { fontWeight: '700' },
  ctas: { flexDirection: 'row', gap: space.xs, alignSelf: 'stretch', marginTop: space.sm },
  cta: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xxs,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP, paddingHorizontal: space.screen },
  door: {
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  doorIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  doorLabel: { fontWeight: '500' },
  feedHead: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.screen },
  accentBar: { width: 4, height: 22, borderRadius: 2 },
});
