import { FlashList, type ViewToken } from '@shopify/flash-list';
import { useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReelSlide, type ReelSlideModel } from '@/components/reels/ReelSlide';
import { AppText } from '@/components/ui/AppText';
import { IconButton } from '@/components/ui/IconButton';
import { NavGroup } from '@/components/ui/NavGroup';
import { ErrorState, StateView } from '@/components/ui/StateView';
import { usePagedList } from '@/hooks/usePagedList';
import { useResource } from '@/hooks/useResource';
import { trackReelViewOnce, useReelActions } from '@/hooks/useReelActions';
import { contentApi } from '@/services/api';
import type { ReelFeedItemWithState } from '@/services/api-types';
import { useAuth } from '@/providers/AuthProvider';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, radius, space } from '@/theme/tokens';

export function toSlide(r: ReelFeedItemWithState): ReelSlideModel {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    isVideo: r.isVideo,
    videoUrl: r.hlsUrl ?? r.mp4Url,
    posterUrl: r.posterUrl,
    imageUrl: r.imageUrl,
    likes: r.likesCount,
    favorites: r.favoritesCount,
    comments: r.commentsCount,
    liked: r.likedByMe,
    favorited: r.favoritedByMe,
    publisher: r.clientName,
    publisherSlug: r.clientSlug,
    publisherLogo: r.clientLogoUrl,
  };
}

/** S10 — الريلز: فيد عمودي بملء الشاشة (C14 cursor ٦) مع فلتر الشريك (C15). الفيديو الظاهر وحده يعمل. */
export default function ReelsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { status } = useAuth();
  const focused = useIsFocused();
  const [height, setHeight] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [client, setClient] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const filters = useResource((signal) => contentApi.reelFilters(signal), []);

  const list = usePagedList<ReelSlideModel, string>(
    async (cursor, signal) => {
      const d = await contentApi.reels({ cursor, client }, signal);
      return { items: d.items.map(toSlide), next: d.nextCursor };
    },
    [client, status],
  );

  const update = useCallback((id: string, fn: (s: ReelSlideModel) => ReelSlideModel) => list.update((items) => items.map((s) => (s.id === id ? fn(s) : s))), [list]);
  const actions = useReelActions(update);

  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken<ReelSlideModel>[] }) => {
    const first = viewableItems.find((v) => v.isViewable)?.item;
    if (first) {
      setActiveId(first.id);
      trackReelViewOnce(first.id);
    }
  }).current;

  useEffect(() => {
    if (!activeId && list.items[0]) setActiveId(list.items[0].id);
  }, [list.items, activeId]);

  const onLayout = (e: LayoutChangeEvent) => setHeight(Math.round(e.nativeEvent.layout.height));
  const renderItem = useCallback(
    ({ item }: { item: ReelSlideModel }) => (
      <ReelSlide slide={item} height={height} active={focused && item.id === activeId} bottomInset={0} actions={actions} />
    ),
    [height, focused, activeId, actions],
  );
  const selected = useMemo(() => filters.data?.items.find((f) => f.slug === client)?.name ?? null, [filters.data, client]);

  return (
    <View style={[styles.root, { backgroundColor: colors.reelsBackground }]} onLayout={onLayout}>
      {list.status === 'loading' || height === 0 ? (
        <View style={styles.center} accessibilityLabel="جارٍ تحميل الريلز" accessibilityRole="progressbar">
          <View style={[styles.skeleton, { backgroundColor: colors.surfaceHigh }]} />
        </View>
      ) : list.status === 'error' ? (
        <View style={[styles.center, { backgroundColor: colors.page }]}>
          <ErrorState error={list.error} onRetry={list.reload} what="الريلز" />
        </View>
      ) : list.items.length === 0 ? (
        <View style={[styles.center, { backgroundColor: colors.page }]}>
          <StateView
            icon="reels"
            title={selected ? `لا ريلز منشورة لـ${selected}` : 'لا ريلز منشورة بعد'}
            actionLabel={selected ? 'كل الشركاء' : 'تحديث'}
            onAction={selected ? () => setClient(null) : list.reload}
          />
        </View>
      ) : (
        <FlashList
          data={list.items}
          renderItem={renderItem}
          keyExtractor={(s) => s.id}
          pagingEnabled
          snapToInterval={height}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewable}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          onEndReached={list.hasMore ? list.loadMore : undefined}
          onEndReachedThreshold={2}
          extraData={{ activeId, focused, height }}
          refreshControl={<RefreshControl refreshing={list.refreshing} onRefresh={list.refresh} tintColor={colors.onReels} />}
        />
      )}

      <View style={[styles.top, { paddingTop: insets.top }]} pointerEvents="box-none">
        <AppText variant="pageTitle" tone="onReels" accessibilityRole="header">
          {selected ?? 'الطلّات'}
        </AppText>
        <IconButton icon="filter" label="تصفية حسب الشريك" tone="onReels" onPress={() => setFilterOpen(true)} />
      </View>

      <Portal>
        <Modal visible={filterOpen} onDismiss={() => setFilterOpen(false)} contentContainerStyle={[styles.sheet, { backgroundColor: colors.page }]}>
          <View style={styles.sheetHead}>
            <AppText variant="sectionTitle" style={styles.flex}>
              ريلز من
            </AppText>
            <IconButton icon="close" label="إغلاق" onPress={() => setFilterOpen(false)} />
          </View>
          {filters.status === 'error' ? (
            <ErrorState error={filters.error} onRetry={filters.reload} what="قائمة الشركاء" />
          ) : (
            <NavGroup
              items={[
                { key: '__all', icon: 'reels', label: 'كل الشركاء', hint: client === null ? 'المعروض الآن' : null, onPress: () => { setClient(null); setFilterOpen(false); } },
                ...(filters.data?.items ?? []).map((f) => ({
                  key: f.slug,
                  icon: 'partner' as const,
                  label: f.name,
                  hint: f.slug === client ? 'المعروض الآن' : `${f.reelCount} ريل`,
                  onPress: () => {
                    setClient(f.slug);
                    setFilterOpen(false);
                  },
                })),
              ]}
            />
          )}
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', padding: space.screen },
  skeleton: { flex: 1, borderRadius: radius.card, opacity: 0.4 },
  top: {
    position: 'absolute',
    top: 0,
    start: 0,
    end: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.screen,
    minHeight: control.header,
  },
  sheet: { margin: space.screen, borderRadius: radius.card, padding: space.md, maxHeight: '80%', gap: space.sm },
  sheetHead: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
});
