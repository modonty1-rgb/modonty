import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { List } from 'react-native-paper';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ARTICLE_HERO, ArticleChrome } from '@/components/article/ArticleChrome';
import { ReadingSheet, SEPIA_COLORS } from '@/components/article/ReadingSheet';
import { Publisher } from '@/components/home/ArticleRow';

import { ActionBar, type ActionItem } from '@/components/content/ActionBar';
import { ArticleHtml } from '@/components/content/ArticleHtml';
import { FollowButton } from '@/components/content/FollowButton';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Bone } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/StateView';
import { Tap } from '@/components/ui/Tap';
import { useReadingAnalytics } from '@/hooks/useReadingAnalytics';
import { useResource } from '@/hooks/useResource';
import { ago, plainNumber, readMinutesShort } from '@/lib/format';
import { readBucket } from '@/lib/models';
import { BUCKET_COLOR } from '@/components/home/ArticleRow';
import { open, openExternal } from '@/lib/nav';
import { shareLink } from '@/lib/share';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { actionsApi, contentApi } from '@/services/api';
import type { ArticleCountsData } from '@/services/api-types';
import { toApiError } from '@/services/errors';
import { useReadingPrefs } from '@/lib/reading-prefs';
import { ThemeScope, useAppTheme } from '@/theme/ThemeProvider';
import { control, ds, dsFontScale, dsType, media, palettes, radius, space } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';

type Mine = { liked: boolean; disliked: boolean; favorited: boolean };
type Counts = { likes: number; dislikes: number; favorites: number; comments: number; views: number };

/** S03 — المقال: C4 للمحتوى (نفس getArticlePageData) · C5 للعدّادات الحيّة · E6 مشاهدة · E1/E2/E3 · E8. */
export default function ArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { scheme: appScheme } = useAppTheme();
  const prefs = useReadingPrefs();
  // خلفية القراءة: اختيار القارئ، وإلا ثيم التطبيق. «ورقي» = الفاتح بصفحة ونصّ ورقيين.
  const appTone = appScheme === 'dark' ? 'dark' : 'light';
  const tone = prefs.tone ?? appTone;
  const readScheme = tone === 'dark' ? 'dark' : 'light';
  const readOverride = tone === 'sepia' ? SEPIA_OVERRIDE : undefined;
  const [prefsOpen, setPrefsOpen] = useState(false);
  // ألوان المتن من خلفية القراءة (المكوّنات الفرعية تقرؤها من ThemeScope بالقيم نفسها).
  const colors = useMemo(() => ({ ...palettes[readScheme], ...readOverride }), [readScheme, readOverride]);
  const { status, requireAuth } = useAuth();
  const toast = useToast();
  const res = useResource((signal) => contentApi.article(slug, signal), [slug]);
  const article = res.data?.article ?? null;

  const [counts, setCounts] = useState<Counts | null>(null);
  const [mine, setMine] = useState<Mine | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const applyCounts = useCallback((d: ArticleCountsData) => {
    setCounts((c) => ({ ...d.counts, dislikes: c?.dislikes ?? 0 }));
    setMine(d.me);
  }, []);

  useEffect(() => {
    let alive = true;
    contentApi
      .articleCounts(slug)
      .then((d) => alive && applyCounts(d))
      .catch((error: unknown) => console.warn('[article] counts', toApiError(error).message));
    return () => {
      alive = false;
    };
  }, [slug, status, applyCounts]);

  const onAnalyticsScroll = useReadingAnalytics(slug);
  // التمرير يكتب قيماً مشتركة فقط (الإطار يقرؤها على مسار الرسم) + تحليلات القراءة كما في الويب.
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const progress = useSharedValue(0);
  const [remainingMin, setRemainingMin] = useState<number | null>(null);
  // موضع القراءة يثبت عند تغيير الخط أو الخلفية أو ثيم الجوال: المتن يُعاد رسمه فينكمش لحظةً،
  // وأندرويد يرجع التمرير للأعلى بلا حدث تمرير (مقيس ١٠ أكتوبر). نحفظ النسبة ونعيدها بعد القياس الجديد.
  const scrollRef = useRef<ScrollView>(null);
  const lastP = useRef(0);
  const viewportH = useRef(0);
  const restoreTo = useRef<number | null>(null);
  const prevLook = useRef({ size: prefs.size, tone });
  useEffect(() => {
    if (prevLook.current.size === prefs.size && prevLook.current.tone === tone) return;
    prevLook.current = { size: prefs.size, tone };
    restoreTo.current = lastP.current;
    const t = setTimeout(() => (restoreTo.current = null), 1500);
    return () => clearTimeout(t);
  }, [prefs.size, tone]);
  const onContentSize = useCallback((_w: number, h: number) => {
    if (restoreTo.current == null || viewportH.current <= 0) return;
    scrollRef.current?.scrollTo({ y: restoreTo.current * Math.max(0, h - viewportH.current), animated: false });
  }, []);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
      scrollY.value = contentOffset.y;
      const scrollable = contentSize.height - layoutMeasurement.height;
      const p = scrollable > 0 ? Math.min(1, Math.max(0, contentOffset.y / scrollable)) : 0;
      progress.value = p;
      lastP.current = p;
      const total = article?.readingTimeMinutes ?? 0;
      // «باقي N د» يتغيّر بالدقيقة فقط — لا إعادة رسم مع كل إطار.
      const left = total > 0 ? Math.max(0, Math.ceil(total * (1 - p))) : null;
      setRemainingMin((m) => (m === left ? m : left));
      onAnalyticsScroll(e);
    },
    [scrollY, progress, article?.readingTimeMinutes, onAnalyticsScroll],
  );

  const c: Counts | null = counts ?? (article ? { ...article.counts, dislikes: 0 } : null);

  const toggle = useCallback(
    (kind: 'like' | 'dislike' | 'favorite') =>
      requireAuth(async () => {
        if (!article) return;
        setBusy(kind);
        try {
          if (kind === 'like') {
            const r = await actionsApi.likeArticle(article.id, article.slug);
            haptic.success();
            setCounts((x) => (x ? { ...x, likes: r.likesCount, dislikes: r.dislikesCount } : x));
            setMine((m) => ({ ...(m ?? { favorited: false }), liked: r.liked, disliked: false }));
          } else if (kind === 'dislike') {
            const r = await actionsApi.dislikeArticle(article.id, article.slug);
            setCounts((x) => (x ? { ...x, likes: r.likesCount, dislikes: r.dislikesCount } : x));
            setMine((m) => ({ ...(m ?? { favorited: false }), disliked: r.disliked, liked: false }));
          } else {
            const r = await actionsApi.favoriteArticle(article.id, article.slug);
            haptic.success();
            setCounts((x) => (x ? { ...x, favorites: r.favoritesCount } : x));
            setMine((m) => ({ ...(m ?? { liked: false, disliked: false }), favorited: r.favorited }));
            toast.show(r.favorited ? 'حُفظ في مفضّلتك' : 'أُزيل من مفضّلتك', 'success');
          }
        } catch (error) {
          toast.show(toApiError(error).message, 'error');
        } finally {
          setBusy(null);
        }
      }),
    [article, requireAuth, toast],
  );

  const share = useCallback(async () => {
    if (!article) return;
    try {
      const shared = await shareLink(article.title, `/articles/${article.slug}`);
      if (shared) await actionsApi.shareArticle(article.slug, 'OTHER');
    } catch (error) {
      toast.show(toApiError(error).message, 'error');
    }
  }, [article, toast]);

  const actions = useMemo<ActionItem[]>(
    () => [
      { key: 'like', icon: mine?.liked ? 'likeFilled' : 'like', label: 'أعجبني', count: c?.likes, active: mine?.liked, busy: busy === 'like', onPress: () => toggle('like') },
      { key: 'dislike', icon: 'dislike', label: 'لم يعجبني', active: mine?.disliked, busy: busy === 'dislike', onPress: () => toggle('dislike') },
      { key: 'save', icon: mine?.favorited ? 'bookmarkFilled' : 'bookmark', label: 'حفظ في المفضّلة', count: c?.favorites, active: mine?.favorited, busy: busy === 'favorite', onPress: () => toggle('favorite') },
      {
        key: 'comments',
        icon: 'comment',
        label: 'التعليقات',
        count: c?.comments,
        onPress: () => article && router.push({ pathname: '/articles/[slug]/comments', params: { slug: article.slug, id: article.id, title: article.title } }),
      },
    ],
    [c, mine, busy, toggle, article],
  );

  if (res.status === 'loading') {
    return (
      <Screen>
        <Header back />
        <View style={styles.skeleton} accessibilityLabel="جارٍ تحميل المقال">
          <View style={[styles.hero, { backgroundColor: colors.skeleton }]} />
          <Bone height={22} width="90%" />
          <Bone height={22} width="65%" />
          <Bone height={14} width="40%" />
          {Array.from({ length: 6 }, (_, i) => (
            <Bone key={i} height={14} width={i % 3 === 2 ? '70%' : '100%'} />
          ))}
        </View>
      </Screen>
    );
  }
  if (res.status === 'error' || !article) {
    return (
      <Screen>
        <Header back />
        <ErrorState error={res.error} onRetry={res.reload} what="المقال" />
      </Screen>
    );
  }

  const minutes = readMinutesShort(article.readingTimeMinutes);
  const bucket = readBucket(article.readingTimeMinutes);
  const when = ago(article.datePublished ?? article.createdAt);
  const remaining = remainingMin != null ? (remainingMin === 0 ? 'وصلت النهاية' : `باقي ${plainNumber(remainingMin)} د`) : null;
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const chromeActions = [
    { icon: 'categories' as const, text: 'Aa', label: 'إعدادات القراءة', onPress: () => setPrefsOpen((o) => !o) },
    { icon: 'share' as const, label: 'مشاركة المقال', onPress: () => void share() },
  ];

  return (
    <Screen>
      <ThemeScope scheme={readScheme} override={readOverride}>
      <ScrollView
        ref={scrollRef}
        onLayout={(e) => (viewportH.current = e.nativeEvent.layout.height)}
        onContentSizeChange={onContentSize}
        style={{ backgroundColor: colors.page }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 112 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={res.refreshing} onRefresh={res.refresh} tintColor={colors.primary} colors={[colors.primary]} progressViewOffset={insets.top + 48} />}
      >
        <View style={[styles.heroBox, { backgroundColor: colors.navy }]}>
          {article.featuredImage ? (
            <Image cachePolicy="memory-disk"
              source={article.featuredImage.url}
              placeholder={article.featuredImage.blurDataURL ? { uri: article.featuredImage.blurDataURL } : undefined}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={200}
              accessibilityLabel={article.featuredImage.altText ?? article.title}
            />
          ) : null}
        </View>

        <View style={[styles.sheet, { backgroundColor: colors.page }]}>
          {article.partner ? <Publisher name={article.partner.name} logo={article.partner.logo} /> : null}
          <Text style={[styles.h1, { color: colors.text }]} accessibilityRole="header" maxFontSizeMultiplier={1.2}>
            {article.title}
          </Text>
          {minutes || when ? (
            <View style={styles.metaRow}>
              {bucket ? <View style={[styles.dot, { backgroundColor: colors[BUCKET_COLOR[bucket]] }]} /> : null}
              <Text style={[dsType.bodySm, { color: colors.muted, fontFamily: 'Tajawal_500Medium', fontSize: 13 }]} maxFontSizeMultiplier={dsFontScale.max}>
                {[minutes, when].filter(Boolean).join(' · ')}
              </Text>
            </View>
          ) : null}
          {article.category ? (
            <Tap label={`التصنيف: ${article.category.name}`} role="link" minTarget={false} onPress={() => open.category(article.category!.slug)} style={styles.inlineLink}>
              <Text style={[dsType.label, { color: colors.interactive }]} maxFontSizeMultiplier={1.2}>
                {article.category.name}
              </Text>
            </Tap>
          ) : null}

          {article.partner ? (
            <View style={[styles.partner, { borderColor: colors.border }]}>
              <Tap label={article.partner.name} role="link" onPress={() => open.partner(article.partner!.slug)} style={styles.partnerMain}>
                {article.partner.logo ? (
                  <Image cachePolicy="memory-disk" source={article.partner.logo} style={[styles.logo, { borderColor: colors.border }]} contentFit="contain" />
                ) : null}
                <View style={styles.flex}>
                  <View style={styles.rowCenter}>
                    <Text style={[dsType.titleSm, styles.partnerName, { color: colors.text }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                      {article.partner.name}
                    </Text>
                    {article.partner.isVerified ? <Icon name="trust" size={18} tone="interactive" /> : null}
                  </View>
                  <Text style={[dsType.caption, { color: colors.muted, fontSize: 13, lineHeight: 20 }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                    {article.partner.isVerified ? 'شريك موثّق' : article.partner.city ?? 'شريك مدونتي'}
                  </Text>
                </View>
              </Tap>
              <FollowButton slug={article.partner.slug} compact />
            </View>
          ) : null}

          {article.author ? (
            <Tap label={`الكاتب: ${article.author.name}`} role="link" minTarget={false} onPress={() => open.author(article.author!.slug)} style={styles.rowCenter}>
              {article.author.image ? <Image cachePolicy="memory-disk" source={article.author.image} style={styles.avatar} contentFit="cover" /> : <Icon name="profile" tone="muted" />}
              <Text style={[dsType.label, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
                {article.author.name}
              </Text>
            </Tap>
          ) : null}

        {article.keyPoints.length > 0 ? (
          <View style={[styles.box, { backgroundColor: colors.surfaceRaised }]}>
            <View style={styles.rowCenter}>
              <Icon name="keypoints" />
              <AppText variant="sectionTitle">أبرز النقاط</AppText>
            </View>
            {article.keyPoints.map((p, i) => (
              // علامة البند ● بلون العلامة — نفس قوائم المتن (ArticleHtml).
              <View key={i} style={styles.point}>
                <Text style={[styles.pointMark, { color: colors.primary }]} maxFontSizeMultiplier={1.2} importantForAccessibility="no">
                  ●
                </Text>
                <Text style={[styles.pointText, { color: colors.text }]} maxFontSizeMultiplier={dsFontScale.max}>
                  {p}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <ArticleHtml html={article.html} articleId={article.id} size={prefs.size} />

        {article.gallery.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="معرض الصور" />
            {article.gallery.map((g, i) => (
              <View key={i} style={styles.galleryItem}>
                <Image cachePolicy="memory-disk"
                  source={g.url}
                  placeholder={g.blurDataURL ? { uri: g.blurDataURL } : undefined}
                  style={[styles.galleryImage, { aspectRatio: g.width && g.height ? g.width / g.height : media.articleAspect }]}
                  contentFit="contain"
                  accessibilityLabel={g.alt}
                />
                {g.caption ? (
                  <AppText variant="secondary" tone="muted">
                    {g.caption}
                  </AppText>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {article.tags.length > 0 ? (
          <View style={styles.tags}>
            {article.tags.map((t) => (
              <Tap key={t.id} label={`وسم ${t.name}`} role="link" onPress={() => open.tag(t.slug)} style={[styles.tag, { borderColor: colors.border }]}>
                <AppText variant="label">{`#${t.name}`}</AppText>
              </Tap>
            ))}
          </View>
        ) : null}

        {article.cta && article.cta.mode !== 'NONE' && article.partner ? (
          <View style={[styles.box, { backgroundColor: colors.primaryContainer }]}>
            <AppText variant="sectionTitle" tone="onPrimaryContainer">
              {article.partner.name}
            </AppText>
            {article.cta.mode === 'FORM' ? (
              <Button
                label={article.cta.label ?? 'احجز موعداً'}
                icon="booking"
                onPress={() =>
                  router.push({
                    pathname: '/partners/[slug]/book',
                    params: { slug: article.partner!.slug, partnerId: article.partner!.id, name: article.partner!.name, articleId: article.id, source: 'article_card' },
                  })
                }
              />
            ) : article.cta.url ? (
              <Button label={article.cta.label ?? 'زيارة'} icon="directions" onPress={() => void openExternal(article.cta!.url!)} />
            ) : null}
          </View>
        ) : null}

        {article.faqs.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="أسئلة شائعة" />
            <View style={[styles.faqs, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {article.faqs.map((f) => (
                <List.Accordion
                  key={f.id}
                  title={f.question}
                  titleNumberOfLines={3}
                  titleStyle={styles.faqTitle}
                  style={{ backgroundColor: colors.surface }}
                  right={({ isExpanded }) => <Icon name={isExpanded ? 'close' : 'question'} size={control.iconSmall} tone="muted" />}
                >
                  <AppText variant="body" tone="muted" style={styles.faqAnswer}>
                    {f.answer}
                  </AppText>
                </List.Accordion>
              ))}
            </View>
          </View>
        ) : null}

        <Button
          label="اسأل الشريك عن هذا المقال"
          kind="outlined"
          icon="question"
          onPress={() => requireAuth(() => router.push({ pathname: '/articles/[slug]/ask', params: { slug: article.slug, id: article.id } }))}
        />

        {article.readMore.length > 0 ? (
          <View style={styles.readMoreList}>
            {/* «المقال التالي» ثم «اقرأ أيضاً» ٤ — Screens A · 04 يعرض بطاقة واحدة، والخادم يعطي ١٥ (مقيس ١٠ أكتوبر). */}
            {article.readMore.slice(0, 5).map((r, i) => (
              <Fragment key={r.id}>
              {i === 1 ? (
                <Text style={[styles.moreTitle, { color: colors.text }]} accessibilityRole="header" maxFontSizeMultiplier={1.2}>
                  اقرأ أيضاً
                </Text>
              ) : null}
              <Tap
                label={`${i === 0 ? 'المقال التالي' : 'اقرأ أيضاً'}: ${r.title}`}
                role="link"
                scale={0.97}
                onPress={() => open.article(r.slug)}
                style={[styles.next, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.flex}>
                  {i === 0 ? (
                    <Text style={[dsType.caption, { color: colors.interactive, fontFamily: 'Tajawal_700Bold' }]} maxFontSizeMultiplier={1.2}>
                      المقال التالي
                    </Text>
                  ) : null}
                  <Text style={[styles.nextTitle, { color: colors.text }]} numberOfLines={3} maxFontSizeMultiplier={dsFontScale.max}>
                    {r.title}
                  </Text>
                  {r.clientName ? (
                    <Text style={[dsType.caption, { color: colors.muted }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                      {r.clientName}
                    </Text>
                  ) : null}
                </View>
                {r.image ? <Image cachePolicy="memory-disk" source={r.image} placeholder={r.imageBlur ? { uri: r.imageBlur } : undefined} style={styles.nextImage} contentFit="cover" recyclingKey={r.id} /> : null}
              </Tap>
              </Fragment>
            ))}
          </View>
        ) : null}
        </View>
      </ScrollView>
      <ActionBar items={actions} audio={article.audioUrl ? { url: article.audioUrl, durationSeconds: article.audioDurationSeconds } : null} />
      </ThemeScope>
      {/* الإطار بثيم التطبيق (أبيض فوق «ورقي» — 04ب)، ويُظلم مع «داكن». */}
      <ThemeScope scheme={readScheme}>
        <ArticleChrome scrollY={scrollY} progress={progress} title={article.title} remaining={remaining} onBack={back} actions={chromeActions} />
        {prefsOpen ? <ReadingSheet size={prefs.size} tone={tone} appTone={appTone} onClose={() => setPrefsOpen(false)} /> : null}
      </ThemeScope>
    </Screen>
  );
}

const SEPIA_OVERRIDE = SEPIA_COLORS;

const styles = StyleSheet.create({
  heroBox: { height: ARTICLE_HERO, overflow: 'hidden' },
  // البطاقة تصعد ٢٨ فوق الصورة بزاوية ٢٨ — Screens A · 04.
  sheet: { marginTop: -28, borderTopStartRadius: 28, borderTopEndRadius: 28, paddingTop: ds.space.s6, paddingHorizontal: ds.layout.gutter, gap: ds.space.s3 },
  h1: { fontFamily: 'Tajawal_900Black', fontSize: 26, lineHeight: 38 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: ds.space.s2 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  partnerName: { flexShrink: 1, fontFamily: 'Tajawal_800ExtraBold' },
  skeleton: { padding: space.screen, gap: space.sm },
  hero: { width: '100%', aspectRatio: media.articleAspect, borderRadius: radius.image },
  title: { marginTop: -space.xxs },
  inlineLink: { alignSelf: 'flex-start', justifyContent: 'center', minWidth: 0 },
  partner: { flexDirection: 'row', alignItems: 'center', gap: ds.space.s3, paddingVertical: ds.space.s3, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth },
  partnerMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm },
  logo: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', borderWidth: StyleSheet.hairlineWidth },
  flex: { flex: 1 },
  shrink: { flexShrink: 1 },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  meta: { gap: space.xs },
  avatar: { width: control.icon, height: control.icon, borderRadius: radius.pill },
  box: { borderRadius: radius.card, padding: space.card, gap: space.xs },
  section: { gap: space.sm, marginHorizontal: -space.screen },
  galleryItem: { paddingHorizontal: space.screen, gap: space.xxs },
  galleryImage: { width: '100%', borderRadius: radius.image },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  tag: { minHeight: control.touch, paddingHorizontal: space.sm, borderRadius: radius.pill, borderWidth: control.border, justifyContent: 'center' },
  faqs: { marginHorizontal: space.screen, borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  faqTitle: { textAlign: 'auto', writingDirection: 'auto' },
  faqAnswer: { paddingHorizontal: space.card, paddingBottom: space.card },
  readMoreList: { gap: ds.space.s3, marginTop: ds.space.s4 },
  moreTitle: { fontFamily: 'Tajawal_800ExtraBold', fontSize: 18, lineHeight: 28, marginTop: ds.space.s3 },
  point: { flexDirection: 'row', gap: ds.space.s2 },
  pointMark: { fontSize: 12, lineHeight: 28 },
  pointText: { flex: 1, fontFamily: 'Tajawal_500Medium', fontSize: 16, lineHeight: 28 },
  // «المقال التالي» — Screens A · 04: بطاقة ٢٠ بحدّ، العنوان ١٥/٢٢ w700، صورة ٧٢ زاوية ١٢.
  next: { borderRadius: ds.radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: 14, flexDirection: 'row', alignItems: 'center', gap: ds.space.s3 },
  nextTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 15, lineHeight: 22 },
  nextImage: { width: 72, height: 72, borderRadius: 12 },
  readMore: {
    marginHorizontal: space.screen,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.sm,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
  },
  readMoreImage: { width: media.thumbWidth, aspectRatio: media.articleAspect, borderRadius: radius.image },
});
