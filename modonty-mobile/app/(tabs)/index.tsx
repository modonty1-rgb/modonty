import { router } from 'expo-router';
import { useCallback, useMemo, useRef } from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ModontyWordmark } from '@/components/brand/ModontyWordmark';
import { ArticleCard } from '@/components/content/ArticleCard';
import { FollowButton } from '@/components/content/FollowButton';
import { ReelTile, type ReelTileModel } from '@/components/content/ReelTile';
import { AppText } from '@/components/ui/AppText';
import { IconButton } from '@/components/ui/IconButton';
import { PagedList } from '@/components/ui/PagedList';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Tap } from '@/components/ui/Tap';
import { Screen } from '@/components/ui/Screen';
import { usePagedList } from '@/hooks/usePagedList';
import { toArticleCard, type ArticleCardModel } from '@/lib/models';
import { open } from '@/lib/nav';
import { useAuth } from '@/providers/AuthProvider';
import { contentApi } from '@/services/api';
import type { HomeData } from '@/services/api-types';
import { useAppTheme } from '@/theme/ThemeProvider';
import { brandWordmark, control, radius, space } from '@/theme/tokens';

type Sections = Omit<HomeData, 'articles' | 'hasMore'>;

const REELS_VISIBLE = 2.6;

/** S01 — الرئيسية: نفس قراءات صفحة الويب الأولى (`GET /home`)، ثم صفحات الفيد (`GET /articles?page`). */
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { unreadNotifications, requireAuth } = useAuth();
  const { width } = useWindowDimensions();
  const sections = useRef<Sections | null>(null);

  const list = usePagedList<ArticleCardModel, number>(async (page, signal) => {
    if (page === null) {
      const home = await contentApi.home(signal);
      const { articles, hasMore, ...rest } = home;
      sections.current = rest;
      return { items: articles.map(toArticleCard), next: hasMore ? 2 : null };
    }
    const next = await contentApi.articles({ page }, signal);
    return { items: next.items.map(toArticleCard), next: next.hasMore ? page + 1 : null };
  }, []);

  const renderItem = useCallback(({ item }: { item: ArticleCardModel }) => <ArticleCard item={item} onOpen={open.article} />, []);
  const s = list.status === 'success' ? sections.current : null;
  const reelWidth = (width - space.screen * 2 - space.xs * 2) / REELS_VISIBLE;
  const reels = useMemo<ReelTileModel[]>(
    () =>
      (s?.reels ?? []).map((r) => ({
        key: r.id,
        slug: r.slug,
        title: r.title,
        poster: r.posterUrl ?? r.imageUrl,
        publisher: r.clientName,
        isVideo: r.isVideo,
      })),
    [s],
  );

  const header = (
    <View style={styles.sections}>
      {s?.coreClientSlug ? (
        <View style={[styles.follow, { backgroundColor: colors.primaryContainer }]}>
          <AppText variant="label" tone="onPrimaryContainer" style={styles.flex}>
            تابع مدونتي ليصلك كل جديد
          </AppText>
          <FollowButton slug={s.coreClientSlug} compact />
        </View>
      ) : null}
      {reels.length > 0 ? (
        <View style={styles.block}>
          <SectionHeader title="ريلز" onMore={() => router.navigate('/reels')} />
          <FlatList
            horizontal
            data={reels}
            keyExtractor={(r) => r.key}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hList}
            renderItem={({ item }) => <ReelTile item={item} onOpen={open.reel} width={reelWidth} />}
          />
        </View>
      ) : null}
      {s && s.industries.length > 0 ? (
        <View style={styles.block}>
          <SectionHeader title="المجالات" onMore={() => router.push('/industries')} />
          <FlatList
            horizontal
            data={s.industries}
            keyExtractor={(i) => i.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hList}
            renderItem={({ item }) => (
              <Tap
                label={item.name}
                role="link"
                onPress={() => open.industry(item.slug)}
                style={[styles.pill, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <AppText variant="label">{item.name}</AppText>
              </Tap>
            )}
          />
        </View>
      ) : null}
      {s && s.partners.length > 0 ? (
        <View style={styles.block}>
          <SectionHeader title="شركاء انضمّوا حديثاً" onMore={() => router.push('/partners')} />
          <View style={styles.partners}>
            {s.partners.map((p) => (
              <Tap
                key={p.id}
                label={p.name}
                role="link"
                onPress={() => open.partner(p.slug)}
                style={[styles.partner, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <AppText variant="label" numberOfLines={1}>
                  {p.name}
                </AppText>
                {p.industry ? (
                  <AppText variant="secondary" tone="muted" numberOfLines={1}>
                    {p.industry}
                  </AppText>
                ) : null}
              </Tap>
            ))}
          </View>
        </View>
      ) : null}
      <SectionHeader title="أحدث المقالات" onMore={() => router.push('/articles')} moreLabel="الأرشيف" />
    </View>
  );

  return (
    <Screen>
      <View style={[styles.top, { paddingTop: insets.top, backgroundColor: colors.page, borderBottomColor: colors.border }]}>
        <View style={styles.topRow}>
          <ModontyWordmark width={brandWordmark.width} height={brandWordmark.height} />
          <View style={styles.flex} />
          <IconButton
            icon="notifications"
            label={unreadNotifications > 0 ? 'الإشعارات — غير مقروءة' : 'الإشعارات'}
            onPress={() => requireAuth(() => router.push('/account/notifications'))}
          />
        </View>
      </View>
      <PagedList
        list={list}
        renderItem={renderItem}
        keyOf={(a) => a.key}
        what="الرئيسية"
        header={header}
        inTabs
        empty={{ icon: 'articles', title: 'لا توجد مقالات منشورة بعد', body: 'عُد لاحقاً — المقالات تُنشر هنا فور اعتمادها.', actionLabel: 'تحديث', onAction: list.reload }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { borderBottomWidth: StyleSheet.hairlineWidth },
  topRow: { height: control.header, flexDirection: 'row', alignItems: 'center', paddingStart: space.screen, paddingEnd: space.xxs },
  flex: { flex: 1 },
  sections: { gap: space.section, paddingTop: space.md },
  block: { gap: space.sm },
  hList: { paddingHorizontal: space.screen, gap: space.xs },
  follow: {
    marginHorizontal: space.screen,
    borderRadius: radius.card,
    padding: space.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  pill: {
    minHeight: control.touch,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
  },
  partners: { paddingHorizontal: space.screen, gap: space.xs },
  partner: {
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: space.card,
    paddingVertical: space.sm,
    gap: space.xxs,
    justifyContent: 'center',
  },
});
