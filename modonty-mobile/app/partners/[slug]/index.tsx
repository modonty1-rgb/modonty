import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedReaction, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArticleChrome } from '@/components/article/ArticleChrome';
import { AboutBlock, BlockTitle, ContactBlock, FaqBlock, GalleryBlock, InfoChip, PostsBlock, ReelsBlock, ServicesBlock, TrustCard } from '@/components/partner/PartnerBlocks';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { Bone } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/StateView';
import { Stars } from '@/components/ui/Stars';
import { Tap } from '@/components/ui/Tap';
import { useFollow } from '@/hooks/useFollow';
import { useResource } from '@/hooks/useResource';
import { plainNumber } from '@/lib/format';
import { openExternal } from '@/lib/nav';
import { shareLink } from '@/lib/share';
import { whatsappHref } from '@/lib/whatsapp';
import { useToast } from '@/providers/ToastProvider';
import { actionsApi, contentApi } from '@/services/api';
import { partnerActionsApi } from '@/services/api-actions';
import { toApiError } from '@/services/errors';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds, dsFontScale, dsMotion } from '@/theme/tokens';

const HERO = 224;
const TABS_H = 48;

/** «home:<key>» أو المفتاح المجرّد — نفس قاعدة الويب (`clients/[slug]/components/page-blocks.tsx:44-46`). */
function hiddenChecker(hidden: string[]) {
  const set = new Set(hidden);
  return (key: string) => set.has(`home:${key}`) || set.has(key);
}

type TabKey = 'overview' | 'services' | 'gallery' | 'posts' | 'faqs';

/**
 * صفحة الشريك — Screens B · 08. الترتيب: مَن أنت ← هل أثق بك ← الدليل ← كيف أتواصل.
 * الغلاف صورة حقيقية من معرض الشريك (لا بانر الكمبيوتر ٢٤٠٠×٤٠٠) وعليها عدد الصور · الشعار يتداخل مع الورقة ·
 * المجال · الاسم والتوثيق · الشعار النصّي · المدينة والتأسيس والدوام · الإجراء الأساسي + واتساب + اتصال ·
 * الاعتمادات وأرقام المؤسسة · تبويبات تثبت تحت الشريط وتتبع التمرير · الكتل · شريط حجز سفلي يظهر حين تختفي أزرار الأعلى.
 * «تابع» جرس في الرأس، وأرقام المتابعين والمشاهدات مخفية (قرار ٩ أكتوبر).
 */
export default function PartnerScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors, scheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const toast = useToast();
  const res = useResource((signal) => contentApi.partner(slug, signal), [slug]);
  const follow = useFollow(slug);

  useEffect(() => {
    actionsApi.viewPartner(slug).catch((error: unknown) => console.warn('[partner] view', toApiError(error).message));
  }, [slug]);

  const d = res.data;
  const p = d?.partner;
  const home = d?.home ?? null;
  const isHidden = useMemo(() => hiddenChecker(d?.hiddenSections ?? []), [d?.hiddenSections]);

  // التمرير يكتب قيماً مشتركة فقط؛ الحالة تتغيّر لحظة عبور العتبات (تثبيت التبويبات · شريط الحجز · التبويب النشط).
  const scrollY = useSharedValue(0);
  const scrollRef = useRef<ScrollView>(null);
  const tabsY = useSharedValue(Number.MAX_SAFE_INTEGER);
  const ctaBottom = useSharedValue(Number.MAX_SAFE_INTEGER);
  const sections = useRef<Partial<Record<TabKey, number>>>({});
  const [stuck, setStuck] = useState(false);
  const [active, setActive] = useState<TabKey>('overview');
  const barShown = useSharedValue(0);
  const top = insets.top + ds.layout.appbarCollapsed;

  useAnimatedReaction(
    () => scrollY.value > tabsY.value - top,
    (now, prev) => {
      if (now !== prev) runOnJS(setStuck)(now);
    },
    [top],
  );
  useAnimatedReaction(
    () => scrollY.value > ctaBottom.value - top,
    (now, prev) => {
      if (now === prev) return;
      barShown.value = withTiming(now ? 1 : 0, { duration: reduced ? dsMotion.reducedFade : 220, easing: Easing.bezier(0.2, 0, 0, 1) });
    },
    [top, reduced],
  );
  const barStyle = useAnimatedStyle(() => ({
    opacity: reduced ? barShown.value : 1,
    transform: [{ translateY: reduced ? 0 : (1 - barShown.value) * 140 }],
  }));

  // تبديل فاتح/داكن يعيد رسم الصفحة فيرجع أندرويد التمرير للأعلى بلا حدث — نعيد الموضع بعد القياس الجديد
  // (نفس علاج صفحة المقال، مقيس ١٠ أكتوبر).
  const lastY = useRef(0);
  const restoreY = useRef<number | null>(null);
  const prevScheme = useRef(scheme);
  useEffect(() => {
    if (prevScheme.current === scheme) return;
    prevScheme.current = scheme;
    restoreY.current = lastY.current;
    const t = setTimeout(() => (restoreY.current = null), 1500);
    return () => clearTimeout(t);
  }, [scheme]);
  const onContentSize = useCallback(() => {
    if (restoreY.current != null) scrollRef.current?.scrollTo({ y: restoreY.current, animated: false });
  }, []);

  const activeRef = useRef<TabKey>('overview');
  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      scrollY.value = y;
      lastY.current = y;
      // التبويب النشط: آخر كتلة بلغ رأسها ثلث الشاشة تحت التبويبات المثبّتة (لا أعلاها — يتأخّر الإحساس).
      const line = y + top + TABS_H + 140;
      let now: TabKey = 'overview';
      for (const [k, v] of Object.entries(sections.current) as [TabKey, number][]) if (v <= line && v >= (sections.current[now] ?? 0)) now = k;
      if (now !== activeRef.current) {
        activeRef.current = now;
        setActive(now);
      }
    },
    [scrollY, top],
  );
  const mark = (key: TabKey) => (e: LayoutChangeEvent) => {
    sections.current[key] = e.nativeEvent.layout.y;
  };
  const goTo = (key: TabKey) => {
    const y = key === 'overview' ? tabsY.value - top + 1 : (sections.current[key] ?? 0) - top - TABS_H + 8;
    scrollRef.current?.scrollTo({ y: Math.max(0, y), animated: !reduced });
  };

  const share = useCallback(async () => {
    if (!p) return;
    try {
      const shared = await shareLink(p.name, `/clients/${p.slug}`);
      if (shared) await partnerActionsApi.share(p.slug, 'OTHER');
    } catch (error) {
      toast.show(toApiError(error).message, 'error');
    }
  }, [p, toast]);

  if (res.status === 'loading') {
    return (
      <Screen>
        <View style={[styles.hero, { backgroundColor: colors.skeleton }]} />
        <View style={styles.skeleton}>
          <Bone height={84} width={84} />
          <Bone height={26} width="70%" />
          <Bone height={16} width="50%" />
          <Bone height={52} />
        </View>
      </Screen>
    );
  }
  if (res.status === 'error' || !d || !p) {
    return (
      <Screen>
        <Header back />
        <ErrorState error={res.error} onRetry={res.reload} what="صفحة الشريك" />
      </Screen>
    );
  }

  const gallery = home && !isHidden('gallery') ? home.gallery : [];
  // الغلاف: صورة حقيقية من المعرض، وإلا صورة الجوال — لا بانر الكمبيوتر (٢٤٠٠×٤٠٠ بنصّ يُقصّ على الجوال،
  // مقيس ١٠ أكتوبر). من لا يملك صورة يأخذ تدرّج العلامة (٢٩ من ٤٦ بلا معرض).
  const cover = gallery[0]?.url ?? p.mobileHero ?? null;
  const industry = home?.hero.industry ?? p.industry;
  const slogan = home?.hero.slogan ?? p.slogan;
  const city = home?.hero.city ?? p.address.city;
  const founded = home?.hero.foundingYear;
  const hours = home?.contact.hours ?? [];
  const wa = p.phone ? whatsappHref(p.phone) : null;
  const credentials = home && !isHidden('trust') ? home.trust.credentials.map((c) => c.name).filter(Boolean) : [];
  const figures = home && !isHidden('stats') ? home.stats : [];
  const about = home && !isHidden('about') ? (home.about.description ?? p.description) : p.description;
  const services = home && !isHidden('services') ? home.services : [];
  const reels = home && !isHidden('reels') ? home.reels : [];
  const posts = home && !isHidden('blog') ? home.posts : [];
  const faqs = home && !isHidden('faq') ? home.faqs : [];
  const testimonials = home && !isHidden('testimonials') ? home.testimonials : [];
  const team = home && !isHidden('team') ? home.team : [];

  const openWhatsapp = () => {
    if (!wa) return;
    partnerActionsApi.whatsappLead(p.id).catch((error: unknown) => console.warn('[partner] whatsapp lead', toApiError(error).message));
    void openExternal(wa);
  };
  const call = p.phone ? () => void openExternal(`tel:${p.phone}`) : null;
  const book = () => router.push({ pathname: '/partners/[slug]/book', params: { slug, partnerId: p.id, name: p.name, source: 'client_page' } });
  // الإجراء الأساسي: حجز (FORM) · رابط الشريك (LINK) · وإلا واتساب ثم اتصال.
  const primary =
    p.cta.mode === 'FORM'
      ? { label: p.cta.label ?? 'احجز الآن', icon: 'booking' as const, onPress: book, kind: 'book' as const }
      : p.cta.mode === 'LINK' && p.cta.url
        ? { label: p.cta.label ?? 'زيارة', icon: 'external' as const, onPress: () => void openExternal(p.cta.url!), kind: 'link' as const }
        : wa
          ? { label: 'راسلنا واتساب', icon: 'whatsapp' as const, onPress: openWhatsapp, kind: 'wa' as const }
          : null;
  const SUB = { gallery: '/partners/[slug]/gallery', articles: '/partners/[slug]/articles', faqs: '/partners/[slug]/faqs', reviews: '/partners/[slug]/reviews' } as const;
  const pushSub = (route: keyof typeof SUB) => router.push({ pathname: SUB[route], params: { slug, name: p.name, id: p.id } });

  const tabs: { key: TabKey; label: string; n?: number }[] = [
    { key: 'overview', label: 'نظرة عامة' },
    ...(services.length ? [{ key: 'services' as const, label: 'الخدمات' }] : []),
    ...(gallery.length ? [{ key: 'gallery' as const, label: 'الصور', n: gallery.length }] : []),
    ...(posts.length ? [{ key: 'posts' as const, label: 'المقالات', n: p.counts.articles }] : []),
    ...(faqs.length ? [{ key: 'faqs' as const, label: 'الأسئلة', n: faqs.length }] : []),
  ];
  const tabBar = tabs.length > 2 ? <Tabs tabs={tabs} active={active} onPick={goTo} /> : null;

  const chrome = [
    {
      icon: follow.following ? ('notificationsFilled' as const) : ('notifications' as const),
      label: follow.following ? `إلغاء متابعة ${p.name}` : `تابع ${p.name}`,
      onPress: follow.toggle,
    },
    { icon: 'share' as const, label: 'مشاركة صفحة الشريك', onPress: () => void share() },
  ];

  return (
    <Screen>
      <ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        onContentSizeChange={onContentSize}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: insets.bottom + 112 }}
        refreshControl={<RefreshControl refreshing={res.refreshing} onRefresh={res.refresh} tintColor={colors.primary} colors={[colors.primary]} progressViewOffset={insets.top + 48} />}
      >
        {/* شارة شفّافة فوق صورة، وشعار مقصوص بظلّ: طبقات جاهزة على أندرويد (توثيق React Native › Performance). */}
        <View renderToHardwareTextureAndroid style={[styles.hero, { backgroundColor: colors.navy }]}>
          {cover ? (
            <Image cachePolicy="memory-disk" source={cover} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} accessibilityLabel={gallery[0]?.alt ?? p.name} />
          ) : (
            <LinearGradient colors={[colors.navy, colors.primary]} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
          )}
          {gallery.length ? (
            <Tap label={`معرض الصور، ${plainNumber(gallery.length)} صورة`} role="link" minTarget={false} onPress={() => pushSub('gallery')} style={[styles.photos, { backgroundColor: 'rgba(14,6,90,0.82)' }]}>
              <Icon name="gallery" size={16} tone="onReels" monochrome />
              <Text style={styles.photosText} maxFontSizeMultiplier={1.2}>{`${plainNumber(gallery.length)} صورة`}</Text>
            </Tap>
          ) : null}
        </View>

        <View style={[styles.sheet, { backgroundColor: colors.page }]}>
          <View renderToHardwareTextureAndroid style={[styles.logo, { backgroundColor: '#FFFFFF', borderColor: colors.page }]}>
            {p.logo ? <Image cachePolicy="memory-disk" source={p.logo} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityIgnoresInvertColors /> : <Icon name="company" size={36} tone="muted" />}
          </View>
          <View style={styles.identity}>
            {industry ? (
              <Text style={[styles.industry, { color: colors.interactive }]} maxFontSizeMultiplier={1.2}>
                {industry}
              </Text>
            ) : null}
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: colors.text }]} accessibilityRole="header" maxFontSizeMultiplier={1.2}>
                {p.name}
              </Text>
              {p.isVerified ? <Icon name="trust" size={22} tone="interactive" /> : null}
            </View>
            {slogan ? (
              <Text style={[styles.slogan, { color: colors.textSecondary }]} maxFontSizeMultiplier={dsFontScale.max}>
                {slogan}
              </Text>
            ) : null}
            {city || founded || hours.length ? (
              <View style={styles.chips}>
                {city ? <InfoChip icon="location" label={city} /> : null}
                {founded ? <InfoChip icon="professionals" label={`منذ ${founded}`} /> : null}
                {hours[0] ? <InfoChip icon="clock" label={`${hours[0].day} ${hours[0].time}`} /> : null}
              </View>
            ) : null}
            <View style={styles.cta} onLayout={(e) => (ctaBottom.value = e.nativeEvent.layout.y + e.nativeEvent.layout.height + HERO - 28)}>
              {primary ? (
                <Tap label={primary.label} scale={0.97} onPress={primary.onPress} style={[styles.primary, { backgroundColor: primary.kind === 'wa' ? colors.whatsapp : colors.primary }]}>
                  <Icon name={primary.icon} size={20} tone={primary.kind === 'wa' ? 'onWhatsapp' : 'onPrimary'} monochrome />
                  <Text style={[styles.primaryText, { color: primary.kind === 'wa' ? colors.onWhatsapp : colors.onPrimary }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                    {primary.label}
                  </Text>
                </Tap>
              ) : null}
              {wa && primary?.kind !== 'wa' ? (
                <Tap label="واتساب" scale={0.94} onPress={openWhatsapp} style={[styles.round, { backgroundColor: colors.whatsapp }]}>
                  <Icon name="whatsapp" size={22} tone="onWhatsapp" monochrome />
                </Tap>
              ) : null}
              {call ? (
                <Tap label={`اتصال ${p.phone}`} scale={0.94} onPress={call} style={[styles.round, { backgroundColor: colors.sunken }]}>
                  <Icon name="phone" size={22} tone="text" monochrome />
                </Tap>
              ) : null}
            </View>
          </View>
        </View>

        {credentials.length || figures.length ? <TrustCard credentials={credentials} stats={figures} /> : null}

        {tabBar ? (
          <View style={styles.tabsWrap} onLayout={(e) => (tabsY.value = e.nativeEvent.layout.y)}>
            {tabBar}
          </View>
        ) : null}

        {about ? <AboutBlock text={about} /> : null}
        {services.length ? (
          <View onLayout={mark('services')}>
            <ServicesBlock services={services} />
          </View>
        ) : null}
        {reels.length ? <ReelsBlock reels={reels} /> : null}
        {gallery.length ? (
          <View onLayout={mark('gallery')}>
            <GalleryBlock images={gallery.map((g) => ({ url: g.url, alt: g.alt }))} onOpen={() => pushSub('gallery')} />
          </View>
        ) : null}
        {posts.length ? (
          <View onLayout={mark('posts')}>
            <PostsBlock posts={posts} total={p.counts.articles} onAll={() => pushSub('articles')} />
          </View>
        ) : null}
        {faqs.length ? (
          <View onLayout={mark('faqs')}>
            <FaqBlock faqs={faqs} onAll={() => pushSub('faqs')} />
          </View>
        ) : null}

        {testimonials.length ? (
          <View style={styles.block}>
            <BlockTitle title="آراء العملاء" more={{ label: 'الكل', a11y: 'كل التقييمات', onPress: () => pushSub('reviews') }} />
            {testimonials.slice(0, 3).map((t, i) => (
              <View key={i} style={[styles.quote, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Stars value={t.rating} />
                <Text style={[styles.quoteText, { color: colors.text }]} numberOfLines={5} maxFontSizeMultiplier={dsFontScale.max}>
                  {t.comment}
                </Text>
                <Text style={[styles.quoteBy, { color: colors.muted }]} maxFontSizeMultiplier={1.2}>
                  {t.author}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {team.length ? (
          <View style={styles.block}>
            <BlockTitle title="الفريق" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.team} style={styles.bleed}>
              {team.map((m, i) => (
                <View key={i} style={styles.member} accessible accessibilityLabel={[m.name, m.role].filter(Boolean).join('، ')}>
                  {m.photoUrl ? <Image cachePolicy="memory-disk" source={m.photoUrl} style={styles.memberPhoto} contentFit="cover" /> : <View style={[styles.memberPhoto, { backgroundColor: colors.sunken }]} />}
                  <Text style={[styles.memberName, { color: colors.text }]} numberOfLines={2} maxFontSizeMultiplier={1.2}>
                    {m.name}
                  </Text>
                  {m.role ? (
                    <Text style={[styles.memberRole, { color: colors.muted }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                      {m.role}
                    </Text>
                  ) : null}
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {home && !isHidden('contact') ? (
          <ContactBlock address={home.contact.address} mapHref={home.contact.mapHref} hours={hours} phone={p.phone} email={p.email ?? home.contact.email} sameAs={p.sameAs} />
        ) : null}

        <View style={styles.block}>
          <Tap label={p.counts.reviews > 0 ? `التقييمات، ${plainNumber(p.counts.reviews)}` : 'التقييمات — كن أوّل من يقيّم'} role="link" onPress={() => pushSub('reviews')} style={[styles.row, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Icon name="rating" size={20} tone="text" monochrome />
            <Text style={[styles.rowText, { color: colors.text }]} maxFontSizeMultiplier={dsFontScale.max}>
              {p.counts.reviews > 0 ? `التقييمات · ${plainNumber(p.counts.reviews)}` : 'التقييمات — كن أوّل من يقيّم'}
            </Text>
            <Icon name="chevron" size={18} tone="muted" monochrome />
          </Tap>
          {!isHidden('newsletter') ? (
            <Tap label={`اشترك في نشرة ${p.name}`} role="link" onPress={() => router.push({ pathname: '/newsletter', params: { partnerId: p.id, name: p.name } })} style={[styles.row, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Icon name="email" size={20} tone="text" monochrome />
              <Text style={[styles.rowText, { color: colors.text }]} maxFontSizeMultiplier={dsFontScale.max}>
                اشترك في نشرته
              </Text>
              <Icon name="chevron" size={18} tone="muted" monochrome />
            </Tap>
          ) : null}
        </View>
      </ScrollView>

      {tabBar && stuck ? <View style={[styles.stuck, { top, backgroundColor: colors.page }]}>{tabBar}</View> : null}

      {primary ? (
        <Animated.View style={[styles.bar, { paddingBottom: insets.bottom + 16, backgroundColor: colors.surface, borderTopColor: colors.border }, barStyle]}>
          <View style={styles.barId}>
            {p.logo ? <Image cachePolicy="memory-disk" source={p.logo} style={[styles.barLogo, { borderColor: colors.border }]} contentFit="cover" /> : null}
            <Text style={[styles.barName, { color: colors.text }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
              {p.name}
            </Text>
          </View>
          {wa && primary.kind !== 'wa' ? (
            <Tap label="واتساب" scale={0.94} onPress={openWhatsapp} style={[styles.barRound, { backgroundColor: colors.whatsapp }]}>
              <Icon name="whatsapp" size={22} tone="onWhatsapp" monochrome />
            </Tap>
          ) : null}
          <Tap label={primary.label} scale={0.97} onPress={primary.onPress} style={[styles.barPrimary, { backgroundColor: primary.kind === 'wa' ? colors.whatsapp : colors.primary }]}>
            <Icon name={primary.icon} size={18} tone={primary.kind === 'wa' ? 'onWhatsapp' : 'onPrimary'} monochrome />
            <Text style={[styles.barPrimaryText, { color: primary.kind === 'wa' ? colors.onWhatsapp : colors.onPrimary }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
              {primary.label}
            </Text>
          </Tap>
        </Animated.View>
      ) : null}

      <ArticleChrome scrollY={scrollY} title={p.name} remaining={null} onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))} actions={chrome} heroHeight={HERO} />
    </Screen>
  );
}

/** تبويبات ٤٨ — النشط بخطّ ٣ أسفله ووزن أثقل؛ الضغط يمرّر لكتلته. */
function Tabs({ tabs, active, onPick }: { tabs: { key: TabKey; label: string; n?: number }[]; active: TabKey; onPick: (k: TabKey) => void }) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  // التبويب النشط يُرى دائماً — يُمرَّر الصفّ إليه حين يتغيّر مع التمرير.
  const row = useRef<ScrollView>(null);
  const place = (e: LayoutChangeEvent) => {
    const { x, width: w } = e.nativeEvent.layout;
    row.current?.scrollTo({ x: Math.max(0, x + w / 2 - width / 2), animated: true });
  };
  return (
    <ScrollView ref={row} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs} style={{ borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }}>
      {tabs.map((t) => {
        const on = t.key === active;
        return (
          <Tap key={t.key} label={t.n != null ? `${t.label}، ${plainNumber(t.n)}` : t.label} role="tab" accessibilityState={{ selected: on }} onPress={() => onPick(t.key)} onLayout={on ? place : undefined} style={[styles.tab, on && { borderBottomColor: colors.primary, borderBottomWidth: 3 }]}>
            <Text style={[styles.tabText, { color: on ? colors.text : colors.muted, fontFamily: on ? 'Tajawal_700Bold' : 'Tajawal_500Medium' }]} maxFontSizeMultiplier={1.2}>
              {t.label}
            </Text>
            {t.n != null ? (
              <Text style={[styles.tabCount, { color: colors.muted }]} maxFontSizeMultiplier={1.2}>
                {plainNumber(t.n)}
              </Text>
            ) : null}
          </Tap>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { height: HERO, overflow: 'hidden' },
  skeleton: { padding: ds.layout.gutter, gap: ds.space.s3 },
  photos: { position: 'absolute', bottom: 40, end: 16, height: 32, paddingHorizontal: 12, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 6 },
  photosText: { color: '#FFFFFF', fontFamily: 'Tajawal_700Bold', fontSize: 13, lineHeight: 18 },
  sheet: { marginTop: -28, borderTopStartRadius: 28, borderTopEndRadius: 28, paddingHorizontal: ds.layout.gutter },
  logo: {
    position: 'absolute',
    top: -36,
    start: ds.layout.gutter,
    width: 84,
    height: 84,
    borderRadius: 22,
    borderWidth: 3,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0E065A',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  identity: { paddingTop: 56, gap: ds.space.s2 },
  industry: { fontFamily: 'Tajawal_700Bold', fontSize: 13, lineHeight: 20 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { flexShrink: 1, fontFamily: 'Tajawal_900Black', fontSize: 24, lineHeight: 34 },
  slogan: { fontFamily: 'Tajawal_400Regular', fontSize: 15, lineHeight: 24 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingTop: 4 },
  cta: { flexDirection: 'row', gap: ds.space.s2, paddingTop: ds.space.s2 },
  primary: { flex: 1, height: 52, borderRadius: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 12 },
  primaryText: { fontFamily: 'Tajawal_800ExtraBold', fontSize: 16, lineHeight: 24 },
  round: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  tabsWrap: { marginTop: ds.space.s4 },
  tabs: { paddingHorizontal: 6 },
  tab: { height: TABS_H, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 4, borderBottomColor: 'transparent', borderBottomWidth: 3 },
  tabText: { fontSize: 15, lineHeight: 24 },
  tabCount: { fontFamily: 'Tajawal_500Medium', fontSize: 12, lineHeight: 16 },
  stuck: { position: 'absolute', start: 0, end: 0, zIndex: 4 },
  block: { paddingHorizontal: ds.layout.gutter, paddingTop: ds.space.s6, gap: 10 },
  bleed: { marginHorizontal: -ds.layout.gutter },
  quote: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 6 },
  quoteText: { fontFamily: 'Tajawal_400Regular', fontSize: 15, lineHeight: 24 },
  quoteBy: { fontFamily: 'Tajawal_500Medium', fontSize: 13, lineHeight: 20 },
  team: { gap: 12, paddingHorizontal: ds.layout.gutter },
  member: { width: 96, alignItems: 'center', gap: 4 },
  memberPhoto: { width: 72, height: 72, borderRadius: 36 },
  memberName: { fontFamily: 'Tajawal_700Bold', fontSize: 13, lineHeight: 18, textAlign: 'center' },
  memberRole: { fontFamily: 'Tajawal_500Medium', fontSize: 12, lineHeight: 16 },
  row: { minHeight: 56, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { flex: 1, fontFamily: 'Tajawal_700Bold', fontSize: 15, lineHeight: 22 },
  bar: {
    position: 'absolute',
    start: 0,
    end: 0,
    bottom: 0,
    paddingTop: 12,
    paddingHorizontal: ds.layout.gutter,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 3,
    shadowColor: '#0E065A',
    shadowOpacity: 0.1,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: -12 },
    elevation: 12,
  },
  barId: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLogo: { width: 36, height: 36, borderRadius: 10, borderWidth: 1 },
  barName: { flexShrink: 1, fontFamily: 'Tajawal_700Bold', fontSize: 13, lineHeight: 18 },
  barRound: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  barPrimary: { height: 48, paddingHorizontal: 20, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 6 },
  barPrimaryText: { fontFamily: 'Tajawal_800ExtraBold', fontSize: 15, lineHeight: 20 },
});
