import { useIsFocused } from '@react-navigation/native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArticleRow } from '@/components/home/ArticleRow';
import { BecomePartner } from '@/components/content/BecomePartner';
import { SectionTitle } from '@/components/home/SectionTitle';
import { useTabHeader } from '@/components/navigation/TabHeader';
import { Icon } from '@/components/ui/Icon';
import { PagedList } from '@/components/ui/PagedList';
import { Screen } from '@/components/ui/Screen';
import { Tap } from '@/components/ui/Tap';
import { useFollow } from '@/hooks/useFollow';
import { usePagedList } from '@/hooks/usePagedList';
import { brandArt } from '@/lib/brand-art';
import { plainNumber } from '@/lib/format';
import { toArticleRow, type ArticleRowModel } from '@/lib/models';
import { open, openExternal } from '@/lib/nav';
import { shareLink } from '@/lib/share';
import { contentApi } from '@/services/api';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds, dsFontScale, dsType, sectorColors } from '@/theme/tokens';

const WEB = process.env.EXPO_PUBLIC_WEB_URL ?? 'https://www.modonty.com';
/** «صِر شريكاً» يدخل القائمة بعد المقال الثالث — آخر القائمة بعيد (٥١ مقالاً). */
const PARTNER_AFTER = 2;

/**
 * أدوات مدونتي — بنتو (Screens A · 02) بصور ثلاثية الأبعاد على هويّة مدونتي (Gemini، ٩ أكتوبر — مرجع الستايل:
 * رسمة الرأس `mobileHero`). الأسطح هادئة (surface) والصورة هي اللون — لا ثلاثة ألوان صارخة فوق ألوان القطاعات.
 * الثلاث صفحات خاصّة لم تُبنَ في التطبيق بعد — تُفتح من الموقع (خطر App Store 4.2 مسجّل في UI-DECISIONS).
 */
const TOOLS = [
  { key: 'wheel', label: 'عجلة الحظ', art: brandArt.toolWheel, go: () => openExternal(`${WEB}/lucky-wheel`) },
  { key: 'link', label: 'مودو لينك', art: brandArt.toolLink, soon: true, go: () => openExternal(`${WEB}/modo-link`) },
  { key: 'quran', label: 'القرآن الكريم', art: brandArt.toolQuran, go: () => openExternal(`${WEB}/quran`) },
] as const;

/**
 * عالم مدونتي — القطاعات الستّ بألوانها (Tokens §٠٥ sectorColors) وشاشاتها `/sectors/[key]`.
 * كل مربّع: لون القطاع + رسم أبيض كبير يخرج من الزاوية العليا (مقصوص بحافّة المربّع) + الاسم أسفله.
 */
const SECTORS: { key: keyof typeof sectorColors; label: string; art: number }[] = [
  { key: 'football', label: 'الكورة', art: brandArt.sectorFootball },
  { key: 'ai', label: 'الذكاء الاصطناعي', art: brandArt.sectorAi },
  { key: 'entrepreneurship', label: 'ريادة الأعمال', art: brandArt.sectorEntrepreneurship },
  { key: 'entertainment', label: 'الترفيه', art: brandArt.sectorEntertainment },
  { key: 'education', label: 'التعليم', art: brandArt.sectorEducation },
  { key: 'health', label: 'الصحة والجمال', art: brandArt.sectorHealth },
];

type Landing = { slug: string; art: string | null; cover: string | null; articles: number | null; reels: number | null };

/**
 * تاب «مدونتي» (الجزيرة) — Screens A · 02: رأس كحلي غامر برسمة مدونتي (`mobileHero`) · «كل اللي يهمك… في مكان واحد»
 * · تابع مدونتي + مشاركة · عدد المقالات والطلّات · أدوات مدونتي · عالم مدونتي · من قلمنا · صِر شريكاً.
 * البيانات: `coreClientSlug` من `/home` ← `/partners/:slug` (الصورة وعدد المقالات) · `/reels/filters` (طلّاته)
 * · «من قلمنا» = `/articles/archive?modonty=1` (فيها مدّة القراءة والتاريخ، بخلاف مقالات الشريك).
 */
export default function ModontyScreen() {
  const { colors, scheme } = useAppTheme();
  const focused = useIsFocused();
  // أيقونات شريط الحالة فاتحة فوق الكحلي ما دامت الصفحة أمامك والرأس الكبير ظاهراً. مكوّن StatusBar يُركَّب
  // فقط والصفحة مركّزة: حين تغادر يُزال فيعود إعداد التطبيق تلقائياً (مكدّس expo-status-bar) — لا استدعاء
  // يدوي يُنسى إرجاعه (خلل ٩ أكتوبر: الأيقونات بقيت بيضاء على الصفحات الفاتحة).
  const [compact, setCompact] = useState(false);
  const top = useTabHeader({ title: 'مدونتي', statusColor: colors.brandImmersive, onCompactChange: setCompact });
  const landing = useRef<Landing | null>(null);
  const [shown, setShown] = useState<Landing | null>(null);

  const list = usePagedList<ArticleRowModel, number>(async (page, signal) => {
    if (!landing.current) {
      const home = await contentApi.home(signal);
      if (!home.coreClientSlug) throw new Error('مدونتي غير مضبوطة في الإعدادات');
      const slug = home.coreClientSlug;
      const [profile, filters] = await Promise.all([contentApi.partner(slug, signal), contentApi.reelFilters(signal).catch(() => null)]);
      landing.current = {
        slug,
        art: profile.partner.mobileHero ?? null,
        cover: profile.partner.hero ?? null,
        articles: profile.partner.counts?.articles ?? null,
        reels: filters?.items.find((f) => f.slug === slug)?.reelCount ?? null,
      };
      setShown(landing.current);
    }
    const p = page ?? 1;
    const d = await contentApi.archive({ page: p, modonty: true }, signal);
    return { items: d.items.map(toArticleRow), next: d.hasMore ? p + 1 : null };
  }, []);

  // الرأس ثابت المرجع: لا يُعاد رسمه إلا حين تصل بيانات مدونتي.
  const header = useMemo(
    () => (
      <>
        <Hero landing={shown} />
        <Tools />
        <World />
        <SectionTitle title="من قلمنا" />
      </>
    ),
    [shown],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: ArticleRowModel; index: number }) => (
      <>
        <ArticleRow item={item} onOpen={open.article} publisher={false} thumb={80} divider={index !== PARTNER_AFTER} />
        {index === PARTNER_AFTER ? <BecomePartner /> : null}
      </>
    ),
    [],
  );

  return (
    <Screen>
      {focused ? <StatusBar style={compact ? (scheme === 'dark' ? 'light' : 'dark') : 'light'} /> : null}
      <PagedList
        list={list}
        renderItem={renderItem}
        keyOf={(a) => a.key}
        what="مدونتي"
        header={header}
        skeleton="row"
        inTabs
        flush
        onScroll={top.onScroll}
        empty={{ icon: 'articles', title: 'ما نشرنا مقالات بعد', body: 'تابعنا، جايين قريب.' }}
      />
      {top.bar}
    </Screen>
  );
}

function Hero({ landing }: { landing: Landing | null }) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const counts = landing
    ? [landing.articles ? `${plainNumber(landing.articles)} مقالاً` : null, landing.reels ? `${plainNumber(landing.reels)} طلّات` : null].filter(Boolean).join(' · ')
    : '';
  const art = landing?.art ?? landing?.cover ?? null;
  return (
    <View style={[styles.hero, { backgroundColor: colors.brandImmersive, paddingTop: insets.top }]}>
      <View style={styles.heroArt}>
        {art ? <Image cachePolicy="memory-disk" source={art} style={StyleSheet.absoluteFill} contentFit={landing?.art ? 'contain' : 'cover'} transition={200} accessibilityIgnoresInvertColors /> : null}
      </View>
      <View accessible accessibilityRole="header" accessibilityLabel="كل اللي يهمك في مكان واحد" style={styles.headline}>
        <Text style={[styles.h1, { color: colors.onReels }]} maxFontSizeMultiplier={1.2}>
          كل اللي يهمك…
        </Text>
        <Text style={[styles.h1, { color: colors.accent }]} maxFontSizeMultiplier={1.2}>
          في مكان واحد
        </Text>
      </View>
      {/* مكان الأزرار محجوز من أوّل رسم — لا تقفز الصفحة حين تصل البيانات. */}
      {landing ? <HeroActions slug={landing.slug} /> : <View style={[styles.followGhost, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />}
      {counts ? (
        <Text style={[dsType.bodySm, styles.counts]} maxFontSizeMultiplier={dsFontScale.max}>
          {counts}
        </Text>
      ) : null}
    </View>
  );
}

/** «تابع مدونتي» (useFollow — نفس منطق زرّ «تابِع» العامّ) + مشاركة بورقة النظام. */
function HeroActions({ slug }: { slug: string }) {
  const { colors } = useAppTheme();
  const { following, busy, toggle } = useFollow(slug);
  const label = following ? 'تتابع مدونتي' : 'تابع مدونتي';
  return (
    <View style={styles.actions}>
      <Tap
        label={label}
        scale={0.96}
        onPress={toggle}
        disabled={busy || following === null}
        accessibilityState={{ selected: !!following, busy }}
        style={[styles.follow, following ? { backgroundColor: 'transparent', borderColor: colors.accent, borderWidth: 1.5 } : { backgroundColor: colors.accent }]}
      >
        {busy ? (
          <ActivityIndicator color={following ? colors.accent : colors.navy} />
        ) : (
          <>
            <Icon name={following ? 'check' : 'notifications'} size={20} tone={following ? 'accent' : 'navy'} monochrome />
            <Text style={[styles.followText, { color: following ? colors.accent : colors.navy }]} maxFontSizeMultiplier={1.2}>
              {label}
            </Text>
          </>
        )}
      </Tap>
      <Tap label="مشاركة صفحة مدونتي" onPress={() => shareLink('مدونتي — كل اللي يهمك في مكان واحد', '/modonty').catch(() => undefined)} style={styles.share}>
        <Icon name="share" size={22} tone="onReels" monochrome />
      </Tap>
    </View>
  );
}

function Tools() {
  const { colors, scheme } = useAppTheme();
  const [wheel, link, quran] = TOOLS;
  const surface = { backgroundColor: scheme === 'dark' ? colors.surfaceRaised : colors.surface, borderColor: colors.border };
  return (
    <View>
      <SectionTitle title="أدوات مدونتي" />
      <View style={styles.bento}>
        <Tap label={wheel.label} role="link" scale={0.97} onPress={wheel.go} renderToHardwareTextureAndroid style={[styles.toolBig, surface]}>
          <Image cachePolicy="memory-disk" source={wheel.art} style={styles.artBig} contentFit="contain" accessibilityIgnoresInvertColors />
          <Text style={[styles.toolBigLabel, { color: colors.text }]} maxFontSizeMultiplier={1.2}>
            {wheel.label}
          </Text>
        </Tap>
        <View style={styles.toolCol}>
          {[link, quran].map((x) => (
            <Tap
              key={x.key}
              label={'soon' in x ? `${x.label}، قريباً` : x.label}
              role="link"
              scale={0.97}
              onPress={x.go}
              // صورة داخل بطاقة مقصوصة الزوايا: طبقة جاهزة على أندرويد بدل قصّ المنحنى كل إطار (توثيق React Native › Performance).
              renderToHardwareTextureAndroid
              style={[styles.tool, surface]}
            >
              <Image cachePolicy="memory-disk" source={x.art} style={styles.art} contentFit="contain" accessibilityIgnoresInvertColors />
              <View style={styles.toolText}>
                <Text style={[styles.toolLabel, { color: colors.text }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                  {x.label}
                </Text>
                {'soon' in x ? (
                  <View style={[styles.soon, { backgroundColor: colors.primaryContainer }]}>
                    <Text style={[styles.soonText, { color: colors.onPrimaryContainer }]} maxFontSizeMultiplier={1.2}>
                      قريباً
                    </Text>
                  </View>
                ) : null}
              </View>
            </Tap>
          ))}
        </View>
      </View>
    </View>
  );
}

function World() {
  const { scheme, colors } = useAppTheme();
  return (
    <View>
      <SectionTitle title="عالم مدونتي" />
      <View style={styles.world}>
        {SECTORS.map((s) => (
          <Tap
            key={s.key}
            label={s.label}
            role="link"
            scale={0.97}
            onPress={() => router.push({ pathname: '/sectors/[key]', params: { key: s.key } })}
            renderToHardwareTextureAndroid
            style={[styles.sector, { backgroundColor: sectorColors[s.key][scheme] }]}
          >
            <Image cachePolicy="memory-disk" source={s.art} style={styles.sectorArt} contentFit="contain" accessibilityIgnoresInvertColors />
            <Text style={[styles.sectorLabel, { color: colors.onReels }]} numberOfLines={2} maxFontSizeMultiplier={1.2}>
              {s.label}
            </Text>
          </Tap>
        ))}
      </View>
    </View>
  );
}

const XB = 'Tajawal_800ExtraBold';
const styles = StyleSheet.create({
  hero: { borderBottomStartRadius: ds.radius.xl, borderBottomEndRadius: ds.radius.xl, paddingBottom: 28, alignItems: 'center', gap: ds.space.s4 },
  heroArt: { width: '100%', height: 240, backgroundColor: '#1F1BD8', overflow: 'hidden' },
  headline: { alignItems: 'center', paddingHorizontal: ds.layout.gutter },
  h1: { fontFamily: 'Tajawal_900Black', fontSize: 28, lineHeight: 38, textAlign: 'center' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  followGhost: { width: 220, height: 52, borderRadius: ds.radius.full },
  follow: { minHeight: 52, paddingHorizontal: 28, borderRadius: ds.radius.full, flexDirection: 'row', alignItems: 'center', gap: ds.space.s2 },
  followText: { fontFamily: XB, fontSize: 16, lineHeight: 24 },
  share: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#241A86', alignItems: 'center', justifyContent: 'center' },
  counts: { color: '#DCDAF2', fontFamily: 'Tajawal_500Medium' },
  bento: { flexDirection: 'row', gap: ds.space.s3, paddingHorizontal: ds.layout.gutter },
  toolBig: { flex: 1, minHeight: 124 * 2 + ds.space.s3, borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, padding: ds.space.s3, justifyContent: 'space-between', overflow: 'hidden' },
  artBig: { width: '100%', flex: 1, minHeight: 150 },
  toolBigLabel: { fontFamily: XB, fontSize: 18, lineHeight: 26, textAlign: 'center' },
  toolCol: { flex: 1, gap: ds.space.s3 },
  tool: { minHeight: 124, borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, padding: ds.space.s2, alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden' },
  art: { width: '100%', height: 76 },
  toolText: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  toolLabel: { fontFamily: XB, fontSize: 15, lineHeight: 22 },
  soon: { height: 22, paddingHorizontal: 8, borderRadius: 6, justifyContent: 'center' },
  soonText: { fontFamily: 'Tajawal_700Bold', fontSize: 12, lineHeight: 16 },
  world: { flexDirection: 'row', flexWrap: 'wrap', gap: ds.space.s2, paddingHorizontal: ds.layout.gutter },
  // ٣ أعمدة × ١٠٤dp: الأسماء الطويلة («الذكاء الاصطناعي») تأخذ سطرين متّسقين بدل أن تنكسر عشوائياً.
  sector: { width: '31.5%', flexGrow: 1, minHeight: 112, borderRadius: ds.radius.lg, padding: 10, justifyContent: 'flex-end', overflow: 'hidden' },
  // الرسم يخرج من الزاوية العليا البادئة ويُقصّ بحافّة المربّع — حسّ مجلّة، والاسم يبقى مقروءاً أسفله.
  sectorArt: { position: 'absolute', top: -12, end: -16, width: 78, height: 78, opacity: 0.95 },
  sectorLabel: { fontFamily: XB, fontSize: 14, lineHeight: 19 },
});
