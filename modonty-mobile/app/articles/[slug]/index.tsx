import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { List } from 'react-native-paper';

import { ActionBar, type ActionItem } from '@/components/content/ActionBar';
import { ArticleHtml } from '@/components/content/ArticleHtml';
import { AudioPlayer } from '@/components/content/AudioPlayer';
import { FollowButton } from '@/components/content/FollowButton';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Bone } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/StateView';
import { Tap } from '@/components/ui/Tap';
import { useReadingAnalytics } from '@/hooks/useReadingAnalytics';
import { useResource } from '@/hooks/useResource';
import { compactNumber, fullDate, readingTime } from '@/lib/format';
import { open, openExternal } from '@/lib/nav';
import { shareLink } from '@/lib/share';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { actionsApi, contentApi } from '@/services/api';
import type { ArticleCountsData } from '@/services/api-types';
import { toApiError } from '@/services/errors';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, media, radius, space } from '@/theme/tokens';

type Mine = { liked: boolean; disliked: boolean; favorited: boolean };
type Counts = { likes: number; dislikes: number; favorites: number; comments: number; views: number };

/** S03 — المقال: C4 للمحتوى (نفس getArticlePageData) · C5 للعدّادات الحيّة · E6 مشاهدة · E1/E2/E3 · E8. */
export default function ArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors } = useAppTheme();
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

  const onScroll = useReadingAnalytics(slug);

  const c: Counts | null = counts ?? (article ? { ...article.counts, dislikes: 0 } : null);

  const toggle = useCallback(
    (kind: 'like' | 'dislike' | 'favorite') =>
      requireAuth(async () => {
        if (!article) return;
        setBusy(kind);
        try {
          if (kind === 'like') {
            const r = await actionsApi.likeArticle(article.id, article.slug);
            setCounts((x) => (x ? { ...x, likes: r.likesCount, dislikes: r.dislikesCount } : x));
            setMine((m) => ({ ...(m ?? { favorited: false }), liked: r.liked, disliked: false }));
          } else if (kind === 'dislike') {
            const r = await actionsApi.dislikeArticle(article.id, article.slug);
            setCounts((x) => (x ? { ...x, likes: r.likesCount, dislikes: r.dislikesCount } : x));
            setMine((m) => ({ ...(m ?? { favorited: false }), disliked: r.disliked, liked: false }));
          } else {
            const r = await actionsApi.favoriteArticle(article.id, article.slug);
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
      { key: 'like', icon: 'like', label: 'أعجبني', count: c?.likes, active: mine?.liked, busy: busy === 'like', onPress: () => toggle('like') },
      { key: 'dislike', icon: 'dislike', label: 'لم يعجبني', active: mine?.disliked, busy: busy === 'dislike', onPress: () => toggle('dislike') },
      { key: 'save', icon: 'bookmark', label: 'حفظ في المفضّلة', count: c?.favorites, active: mine?.favorited, busy: busy === 'favorite', onPress: () => toggle('favorite') },
      {
        key: 'comments',
        icon: 'comment',
        label: 'التعليقات',
        count: c?.comments,
        onPress: () => article && router.push({ pathname: '/articles/[slug]/comments', params: { slug: article.slug, id: article.id, title: article.title } }),
      },
      { key: 'share', icon: 'share', label: 'مشاركة', onPress: () => void share() },
    ],
    [c, mine, busy, toggle, share, article],
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

  const published = fullDate(article.datePublished ?? article.createdAt);
  const meta = [published, readingTime(article.readingTimeMinutes), c && c.views > 0 ? `${compactNumber(c.views)} مشاهدة` : null]
    .filter(Boolean)
    .join('، ');

  return (
    <Screen>
      <Header back actions={<IconButton icon="share" label="مشاركة المقال" onPress={() => void share()} />} />
      <ScrollView
        contentContainerStyle={styles.content}
        onScroll={onScroll}
        scrollEventThrottle={250}
        refreshControl={<RefreshControl refreshing={res.refreshing} onRefresh={res.refresh} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        {article.featuredImage ? (
          <Image
            source={article.featuredImage.url}
            placeholder={article.featuredImage.blurDataURL ? { uri: article.featuredImage.blurDataURL } : undefined}
            style={styles.hero}
            contentFit="cover"
            transition={200}
            accessibilityLabel={article.featuredImage.altText ?? article.title}
          />
        ) : null}

        {article.category ? (
          <Tap label={`التصنيف: ${article.category.name}`} role="link" onPress={() => open.category(article.category!.slug)} style={styles.inlineLink}>
            <AppText variant="label" tone="interactive">
              {article.category.name}
            </AppText>
          </Tap>
        ) : null}

        <AppText variant="pageTitle" accessibilityRole="header" style={styles.title}>
          {article.title}
        </AppText>
        {article.excerpt ? (
          <AppText variant="body" tone="muted">
            {article.excerpt}
          </AppText>
        ) : null}

        {article.partner ? (
          <View style={[styles.partner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Tap label={article.partner.name} role="link" onPress={() => open.partner(article.partner!.slug)} style={styles.partnerMain}>
              {article.partner.logo ? <Image source={article.partner.logo} style={styles.logo} contentFit="contain" /> : null}
              <View style={styles.flex}>
                <View style={styles.rowCenter}>
                  <AppText variant="label" numberOfLines={1} style={styles.shrink}>
                    {article.partner.name}
                  </AppText>
                  {article.partner.isVerified ? <Icon name="trust" size={control.iconInline} tone="interactive" /> : null}
                </View>
                {article.partner.credential ? (
                  <AppText variant="secondary" tone="muted" numberOfLines={2}>
                    {article.partner.credential}
                  </AppText>
                ) : null}
              </View>
            </Tap>
            <FollowButton slug={article.partner.slug} compact />
          </View>
        ) : null}

        <View style={styles.meta}>
          {article.author ? (
            <Tap label={`الكاتب: ${article.author.name}`} role="link" onPress={() => open.author(article.author!.slug)} style={styles.rowCenter}>
              {article.author.image ? <Image source={article.author.image} style={styles.avatar} contentFit="cover" /> : <Icon name="profile" tone="muted" />}
              <AppText variant="label">{article.author.name}</AppText>
            </Tap>
          ) : null}
          {meta ? (
            <AppText variant="secondary" tone="muted">
              {meta}
            </AppText>
          ) : null}
        </View>

        {article.audioUrl ? <AudioPlayer url={article.audioUrl} durationSeconds={article.audioDurationSeconds} /> : null}

        {article.keyPoints.length > 0 ? (
          <View style={[styles.box, { backgroundColor: colors.surfaceRaised }]}>
            <View style={styles.rowCenter}>
              <Icon name="keypoints" />
              <AppText variant="sectionTitle">أبرز النقاط</AppText>
            </View>
            {article.keyPoints.map((p, i) => (
              <AppText key={i} variant="body">
                {`• ${p}`}
              </AppText>
            ))}
          </View>
        ) : null}

        <ArticleHtml html={article.html} articleId={article.id} />

        {article.gallery.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="معرض الصور" />
            {article.gallery.map((g, i) => (
              <View key={i} style={styles.galleryItem}>
                <Image
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
          <View style={styles.section}>
            <SectionHeader title="اقرأ أيضاً" />
            {article.readMore.map((r) => (
              <Tap key={r.id} label={r.title} role="link" onPress={() => open.article(r.slug)} style={[styles.readMore, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {r.image ? <Image source={r.image} placeholder={r.imageBlur ? { uri: r.imageBlur } : undefined} style={styles.readMoreImage} contentFit="cover" /> : null}
                <View style={styles.flex}>
                  <AppText variant="label" numberOfLines={2}>
                    {r.title}
                  </AppText>
                  {r.clientName ? (
                    <AppText variant="secondary" tone="muted" numberOfLines={1}>
                      {r.clientName}
                    </AppText>
                  ) : null}
                </View>
                <Icon name="forward" size={control.iconSmall} tone="muted" />
              </Tap>
            ))}
          </View>
        ) : null}
      </ScrollView>
      <ActionBar items={actions} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.screen, gap: space.md, paddingBottom: space.xxl },
  skeleton: { padding: space.screen, gap: space.sm },
  hero: { width: '100%', aspectRatio: media.articleAspect, borderRadius: radius.image },
  title: { marginTop: -space.xxs },
  inlineLink: { alignSelf: 'flex-start', justifyContent: 'center', minWidth: 0 },
  partner: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: space.sm },
  partnerMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm },
  logo: { width: control.logo, height: control.logo, borderRadius: radius.image },
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
