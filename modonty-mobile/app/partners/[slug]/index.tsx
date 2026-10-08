import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { List } from 'react-native-paper';

import { ArticleCard } from '@/components/content/ArticleCard';
import { FollowButton } from '@/components/content/FollowButton';
import { ReelTile } from '@/components/content/ReelTile';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { NavGroup, type NavRowItem } from '@/components/ui/NavGroup';
import { Screen } from '@/components/ui/Screen';
import { Stars } from '@/components/ui/Stars';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Bone } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/StateView';
import { useResource } from '@/hooks/useResource';
import { compactNumber, plainNumber } from '@/lib/format';
import { articleRow } from '@/lib/models';
import { open, openExternal, openHref } from '@/lib/nav';
import { shareLink } from '@/lib/share';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { actionsApi, contentApi } from '@/services/api';
import { partnerActionsApi } from '@/services/api-actions';
import { toApiError } from '@/services/errors';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, media, radius, space } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';

/** «home:<key>» أو المفتاح المجرّد — نفس قاعدة الويب (`clients/[slug]/components/page-blocks.tsx:44-46`). */
function hiddenChecker(hidden: string[]) {
  const set = new Set(hidden);
  return (key: string) => set.has(`home:${key}`) || set.has(key);
}

function whatsappLink(phone: string): string | null {
  const digits = phone.replace(/[^\d]/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}

/** S09 — صفحة الشريك (C12): كتل الصفحة الرئيسية للشريك بترتيب الويب، مع متابعة (E9) وحجز (E14). */
export default function PartnerScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const { requireAuth, status } = useAuth();
  const toast = useToast();
  const res = useResource((signal) => contentApi.partner(slug, signal), [slug]);
  const [followers, setFollowers] = useState<number | null>(null);
  const [favorited, setFavorited] = useState<boolean | null>(null);

  useEffect(() => {
    actionsApi.viewPartner(slug).catch((error: unknown) => console.warn('[partner] view', toApiError(error).message));
  }, [slug]);

  useEffect(() => {
    if (status !== 'signedIn') return setFavorited(false);
    partnerActionsApi
      .favoriteState(slug)
      .then((d) => setFavorited(d.favorited))
      .catch((error: unknown) => console.warn('[partner] favorite state', toApiError(error).message));
  }, [slug, status]);

  const d = res.data;
  const p = d?.partner;
  const home = d?.home ?? null;
  const isHidden = useMemo(() => hiddenChecker(d?.hiddenSections ?? []), [d?.hiddenSections]);

  const toggleFavorite = useCallback(
    () =>
      requireAuth(async () => {
        try {
          const r = favorited ? await partnerActionsApi.unfavorite(slug) : await partnerActionsApi.favorite(slug);
          haptic.success();
          setFavorited(r.favorited);
          toast.show(r.favorited ? 'أُضيف إلى مفضّلتك' : 'أُزيل من مفضّلتك', 'success');
        } catch (error) {
          toast.show(toApiError(error).message, 'error');
        }
      }),
    [favorited, requireAuth, slug, toast],
  );

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
        <Header back />
        <View style={styles.skeleton}>
          <View style={[styles.cover, { backgroundColor: colors.skeleton }]} />
          <Bone height={22} width="60%" />
          <Bone height={14} width="40%" />
          <Bone height={48} />
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

  const cover = home?.hero.coverUrl ?? p.hero;
  const subtitle = [home?.hero.industry ?? p.industry, home?.hero.city ?? p.address.city].filter(Boolean).join('، ');
  const stats = [
    { label: 'متابع', value: followers ?? d.stats.followers },
    { label: 'مشاهدة', value: d.stats.totalViews },
    { label: 'مقال', value: p.counts.articles },
  ];
  const book = p.cta.mode === 'FORM';
  const wa = p.phone ? whatsappLink(p.phone) : null;
  const reelWidth = (width - space.screen * 2 - space.xs * 2) / 2.6;

  const more = ([
    p.counts.articles > 0 ? { key: 'articles', icon: 'articles', label: 'كل المقالات', hint: `${plainNumber(p.counts.articles)} مقال`, onPress: () => router.push({ pathname: '/partners/[slug]/articles', params: { slug, name: p.name } }) } : null,
    { key: 'reviews', icon: 'rating', label: 'التقييمات', hint: p.counts.reviews > 0 ? `${plainNumber(p.counts.reviews)} تقييم` : 'كن أوّل من يقيّم', onPress: () => router.push({ pathname: '/partners/[slug]/reviews', params: { slug, name: p.name } }) },
    p.counts.gallery > 0 && !isHidden('gallery') ? { key: 'gallery', icon: 'gallery', label: 'الصور', onPress: () => router.push({ pathname: '/partners/[slug]/gallery', params: { slug, name: p.name } }) } : null,
    { key: 'faq', icon: 'question', label: 'الأسئلة والأجوبة', hint: 'اسأل الشريك مباشرة', onPress: () => router.push({ pathname: '/partners/[slug]/faqs', params: { slug, name: p.name, id: p.id } }) },
    !isHidden('newsletter') ? { key: 'newsletter', icon: 'email', label: 'اشترك في نشرته', onPress: () => router.push({ pathname: '/newsletter', params: { partnerId: p.id, name: p.name } }) } : null,
    { key: 'followers', icon: 'profile', label: 'المتابعون', onPress: () => router.push({ pathname: '/partners/[slug]/followers', params: { slug, name: p.name } }) },
  ] as (NavRowItem | null)[]).filter((x): x is NavRowItem => x !== null);

  return (
    <Screen>
      <Header
        back
        title={p.name}
        actions={
          <>
            <IconButton icon="bookmark" label={favorited ? 'إزالة من المفضّلة' : 'إضافة إلى المفضّلة'} selected={!!favorited} tone={favorited ? 'interactive' : 'text'} onPress={toggleFavorite} />
            <IconButton icon="share" label="مشاركة صفحة الشريك" onPress={() => void share()} />
          </>
        }
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={res.refreshing} onRefresh={res.refresh} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        {cover ? <Image source={cover} style={styles.cover} contentFit="cover" accessibilityLabel={p.name} /> : null}

        <View style={styles.pad}>
          <View style={styles.identity}>
            {p.logo ? <Image source={p.logo} style={[styles.logo, { backgroundColor: colors.surface, borderColor: colors.border }]} contentFit="contain" /> : null}
            <View style={styles.flex}>
              <View style={styles.rowCenter}>
                <AppText variant="pageTitle" accessibilityRole="header" style={styles.shrink}>
                  {p.name}
                </AppText>
                {p.isVerified ? <Icon name="trust" size={control.iconSmall} tone="interactive" /> : null}
              </View>
              {subtitle ? (
                <AppText variant="secondary" tone="muted">
                  {subtitle}
                </AppText>
              ) : null}
            </View>
          </View>
          {home?.hero.slogan ?? p.slogan ? <AppText variant="body">{home?.hero.slogan ?? p.slogan}</AppText> : null}

          <View style={[styles.stats, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {stats.map((s) => (
              <View key={s.label} style={styles.stat} accessible accessibilityLabel={`${plainNumber(s.value)} ${s.label}`}>
                <AppText variant="sectionTitle">{compactNumber(s.value)}</AppText>
                <AppText variant="secondary" tone="muted">
                  {s.label}
                </AppText>
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <View style={styles.flex}>
              <FollowButton slug={p.slug} onCount={setFollowers} />
            </View>
            {book ? (
              <View style={styles.flex}>
                <Button
                  label={p.cta.label ?? 'احجز'}
                  kind="outlined"
                  icon="booking"
                  onPress={() => router.push({ pathname: '/partners/[slug]/book', params: { slug, partnerId: p.id, name: p.name, source: 'client_page' } })}
                />
              </View>
            ) : p.cta.mode === 'LINK' && p.cta.url ? (
              <View style={styles.flex}>
                <Button label={p.cta.label ?? 'زيارة'} kind="outlined" icon="directions" onPress={() => void openExternal(p.cta.url!)} />
              </View>
            ) : null}
          </View>
          <View style={styles.contactRow}>
            {p.phone ? <IconButton icon="phone" label={`اتصال ${p.phone}`} onPress={() => void openExternal(`tel:${p.phone}`)} /> : null}
            {wa ? (
              <IconButton
                icon="whatsapp"
                label="واتساب"
                onPress={() => {
                  partnerActionsApi.whatsappLead(p.id).catch((error: unknown) => console.warn('[partner] whatsapp lead', toApiError(error).message));
                  void openExternal(wa);
                }}
              />
            ) : null}
            {p.email ? <IconButton icon="email" label={`مراسلة ${p.email}`} onPress={() => void openExternal(`mailto:${p.email}`)} /> : null}
            {home?.contact.mapHref ? <IconButton icon="location" label="الموقع على الخريطة" onPress={() => void openExternal(home.contact.mapHref!)} /> : null}
          </View>
        </View>

        {home && !isHidden('trust') && home.trust.credentials.length > 0 ? (
          <View style={[styles.box, styles.mx, { backgroundColor: colors.surfaceRaised }]}>
            <View style={styles.rowCenter}>
              <Icon name="trust" />
              <AppText variant="sectionTitle">الاعتمادات</AppText>
            </View>
            {home.trust.credentials.map((c, i) => (
              <AppText key={i} variant="body">
                {[c.name, c.authority, c.year].filter(Boolean).join('، ')}
              </AppText>
            ))}
          </View>
        ) : null}

        {home && !isHidden('about') && (home.about.description ?? p.description) ? (
          <View style={styles.block}>
            <SectionHeader title={`عن ${p.name}`} />
            <AppText variant="body" style={styles.mx}>
              {home.about.description ?? p.description}
            </AppText>
          </View>
        ) : null}

        {home && !isHidden('services') && home.services.length > 0 ? (
          <View style={styles.block}>
            <SectionHeader title="الخدمات" />
            <View style={[styles.group, styles.mx, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {home.services.map((s, i) => (
                <View key={i} style={[styles.serviceRow, i > 0 && { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
                  <AppText variant="label">{s.title}</AppText>
                  {s.description ? (
                    <AppText variant="secondary" tone="muted">
                      {s.description}
                    </AppText>
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {home && !isHidden('stats') && home.stats.length > 0 ? (
          <View style={[styles.statsGrid, styles.mx]}>
            {home.stats.map((s, i) => (
              <View key={i} style={[styles.statTile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <AppText variant="sectionTitle">{s.value}</AppText>
                <AppText variant="secondary" tone="muted">
                  {s.label}
                </AppText>
              </View>
            ))}
          </View>
        ) : null}

        {home && !isHidden('reels') && home.reels.length > 0 ? (
          <View style={styles.block}>
            <SectionHeader title="ريلز" />
            <FlatList
              horizontal
              data={home.reels}
              keyExtractor={(r) => r.href}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hList}
              renderItem={({ item }) => (
                <ReelTile
                  item={{ key: item.href, slug: item.href, title: item.title, poster: item.imageUrl, publisher: p.name, isVideo: false }}
                  onOpen={openHref}
                  width={reelWidth}
                />
              )}
            />
          </View>
        ) : null}

        {home && !isHidden('blog') && home.posts.length > 0 ? (
          <View style={styles.block}>
            <SectionHeader
              title="أحدث المقالات"
              onMore={p.counts.articles > home.posts.length ? () => router.push({ pathname: '/partners/[slug]/articles', params: { slug, name: p.name } }) : undefined}
            />
            <View style={[styles.mx, styles.gapList]}>
              {home.posts.slice(0, 4).map((post) => (
                <ArticleCard
                  key={post.href}
                  layout="row"
                  item={articleRow({ slug: post.href, title: post.title, image: post.imageUrl, dateLabel: post.date, publisher: post.category })}
                  onOpen={openHref}
                />
              ))}
            </View>
          </View>
        ) : null}

        {home && !isHidden('testimonials') && home.testimonials.length > 0 ? (
          <View style={styles.block}>
            <SectionHeader title="آراء العملاء" onMore={() => router.push({ pathname: '/partners/[slug]/reviews', params: { slug, name: p.name } })} />
            <FlatList
              horizontal
              data={home.testimonials.slice(0, 8)}
              keyExtractor={(_, i) => String(i)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hList}
              renderItem={({ item }) => (
                <View style={[styles.testimonial, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Stars value={item.rating} />
                  <AppText variant="body" numberOfLines={5}>
                    {item.comment}
                  </AppText>
                  <AppText variant="secondary" tone="muted">
                    {item.author}
                  </AppText>
                </View>
              )}
            />
          </View>
        ) : null}

        {home && !isHidden('team') && home.team.length > 0 ? (
          <View style={styles.block}>
            <SectionHeader title="الفريق" />
            <FlatList
              horizontal
              data={home.team}
              keyExtractor={(t, i) => `${t.name}-${i}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hList}
              renderItem={({ item }) => (
                <View style={styles.member}>
                  {item.photoUrl ? <Image source={item.photoUrl} style={styles.memberPhoto} contentFit="cover" /> : <View style={[styles.memberPhoto, { backgroundColor: colors.surfaceRaised }]} />}
                  <AppText variant="label" numberOfLines={1} align="center">
                    {item.name}
                  </AppText>
                  {item.role ? (
                    <AppText variant="secondary" tone="muted" numberOfLines={1} align="center">
                      {item.role}
                    </AppText>
                  ) : null}
                </View>
              )}
            />
          </View>
        ) : null}

        {home && !isHidden('faq') && home.faqs.length > 0 ? (
          <View style={styles.block}>
            <SectionHeader title="أسئلة شائعة" />
            <View style={[styles.group, styles.mx, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {home.faqs.slice(0, 5).map((f, i) => (
                <List.Accordion key={i} title={f.question} titleNumberOfLines={3} style={{ backgroundColor: colors.surface }} right={({ isExpanded }) => <Icon name={isExpanded ? 'close' : 'question'} size={control.iconSmall} tone="muted" />}>
                  <AppText variant="body" tone="muted" style={styles.faqAnswer}>
                    {f.answer}
                  </AppText>
                </List.Accordion>
              ))}
            </View>
          </View>
        ) : null}

        {home && !isHidden('contact') && (home.contact.address || home.contact.hours.length > 0) ? (
          <View style={styles.block}>
            <SectionHeader title="التواصل" />
            <View style={[styles.box, styles.mx, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth }]}>
              {home.contact.address ? (
                <View style={styles.rowCenter}>
                  <Icon name="location" size={control.iconSmall} tone="muted" />
                  <AppText variant="body" style={styles.flex}>
                    {home.contact.address}
                  </AppText>
                </View>
              ) : null}
              {home.contact.hours.map((h, i) => (
                <View key={i} style={styles.hours}>
                  <AppText variant="label">{h.day}</AppText>
                  <AppText variant="secondary" tone="muted">
                    {h.time}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.mx}>
          <NavGroup title="المزيد عن الشريك" items={more} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const TESTIMONIAL_WIDTH = 260;
const MEMBER_WIDTH = 104;

const styles = StyleSheet.create({
  content: { gap: space.section, paddingBottom: space.xxl },
  skeleton: { gap: space.sm, padding: space.screen },
  cover: { width: '100%', aspectRatio: media.partnerHeroAspect },
  pad: { paddingHorizontal: space.screen, gap: space.md, paddingTop: space.md },
  mx: { marginHorizontal: space.screen },
  identity: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  logo: { width: control.avatarLarge, height: control.avatarLarge, borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth },
  flex: { flex: 1 },
  shrink: { flexShrink: 1 },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  stats: { flexDirection: 'row', borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, paddingVertical: space.sm },
  stat: { flex: 1, alignItems: 'center', gap: space.xxs },
  actions: { flexDirection: 'row', gap: space.sm },
  contactRow: { flexDirection: 'row', gap: space.xs, justifyContent: 'center' },
  box: { borderRadius: radius.card, padding: space.card, gap: space.xs },
  block: { gap: space.sm },
  group: { borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  serviceRow: { padding: space.card, gap: space.xxs },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  statTile: { flexGrow: 1, flexBasis: '45%', borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: space.card, gap: space.xxs },
  hList: { paddingHorizontal: space.screen, gap: space.xs },
  gapList: { gap: space.listGap },
  testimonial: { width: TESTIMONIAL_WIDTH, borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: space.card, gap: space.xs },
  member: { width: MEMBER_WIDTH, alignItems: 'center', gap: space.xxs },
  memberPhoto: { width: control.avatarLarge, height: control.avatarLarge, borderRadius: radius.pill },
  faqAnswer: { paddingHorizontal: space.card, paddingBottom: space.card },
  hours: { flexDirection: 'row', justifyContent: 'space-between', gap: space.sm },
});
