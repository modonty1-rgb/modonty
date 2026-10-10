import { FlashList, type ViewToken } from '@shopify/flash-list';
import { useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReelSlide, type ReelSlideModel } from '@/components/reels/ReelSlide';
import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { ErrorState, StateView } from '@/components/ui/StateView';
import { useTabBottomInset } from '@/components/navigation/NavScroll';
import { usePagedList } from '@/hooks/usePagedList';
import { useResource } from '@/hooks/useResource';
import { trackReelViewOnce, useReelActions } from '@/hooks/useReelActions';
import { contentApi } from '@/services/api';
import type { ReelFeedItemWithState } from '@/services/api-types';
import { useAuth } from '@/providers/AuthProvider';
import { useAppTheme } from '@/theme/ThemeProvider';
import { plainNumber } from '@/lib/format';
import { radius, space } from '@/theme/tokens';

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

/** «طلّة واحدة · طلّتان · ٣ طلّات · ١١ طلّة» بصيغة العدد العربية. */
function reelsCount(n: number): string {
  if (n === 1) return 'طلّة واحدة';
  if (n === 2) return 'طلّتان';
  if (n <= 10) return `${plainNumber(n)} طلّات`;
  return `${plainNumber(n)} طلّة`;
}

/**
 * S10 — الطلّات، نظام التصميم ١٫٠ (Screens A · 05 / 05ب): فيد عمودي بملء الشاشة، الظاهرة وحدها تعمل.
 * الرأس: «الطلّات» (أو اسم الشريك المختار وزرّ ×) · زرّ الشركاء · زرّ الصوت (مكتوم أوّلاً، يسري على كل الطلّات).
 * الشركاء: لوحة سفلية بشعاراتهم الدائرية وعدد طلّات كلٍّ (`/reels/filters`). «لك/المتابَعون» ينتظران الخادم (UI-DECISIONS).
 */
export default function ReelsScreen() {
  const insets = useSafeAreaInsets();
  const tabInset = useTabBottomInset();
  const { colors } = useAppTheme();
  const { status } = useAuth();
  const focused = useIsFocused();
  const [height, setHeight] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [client, setClient] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [muted, setMuted] = useState(true);
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
  const activeIndex = useMemo(() => Math.max(0, list.items.findIndex((s) => s.id === activeId)), [list.items, activeId]);
  const renderItem = useCallback(
    ({ item, index }: { item: ReelSlideModel; index: number }) => (
      <ReelSlide
        slide={item}
        height={height}
        active={focused && item.id === activeId}
        near={Math.abs(index - activeIndex) <= 1}
        muted={muted}
        bottomInset={tabInset}
        actions={actions}
      />
    ),
    [height, focused, activeId, activeIndex, actions, tabInset, muted],
  );
  const selected = useMemo(() => filters.data?.items.find((f) => f.slug === client)?.name ?? null, [filters.data, client]);

  return (
    <View style={[styles.root, { backgroundColor: colors.reelsBackground }]} onLayout={onLayout}>
      {list.status === 'loading' || height === 0 ? (
        <View style={styles.center} accessibilityLabel="جارٍ تحميل الريلز" accessibilityRole="progressbar">
          <View style={[styles.skeleton, { backgroundColor: '#1F1F23' }]} />
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
          extraData={{ activeId, activeIndex, focused, height, muted }}
          refreshControl={<RefreshControl refreshing={list.refreshing} onRefresh={list.refresh} tintColor={colors.onReels} />}
        />
      )}

      <View style={[styles.top, { paddingTop: insets.top + 4 }]} pointerEvents="box-none">
        <Text style={styles.title} numberOfLines={1} accessibilityRole="header" maxFontSizeMultiplier={1.2}>
          {selected ?? 'الطلّات'}
        </Text>
        {selected ? <RoundButton icon="close" label="كل الشركاء" onPress={() => setClient(null)} /> : null}
        <View style={styles.flex} />
        <RoundButton icon="company" label="الشركاء" onPress={() => setFilterOpen(true)} />
        <RoundButton icon={muted ? 'listenOff' : 'listen'} label={muted ? 'تشغيل الصوت' : 'كتم الصوت'} onPress={() => setMuted((m) => !m)} />
      </View>

      <PartnersSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        items={filters.data?.items ?? []}
        error={filters.status === 'error' ? filters.error : null}
        onRetry={filters.reload}
        value={client}
        onPick={(slug) => {
          setClient(slug);
          setFilterOpen(false);
        }}
      />
    </View>
  );
}

/** زرّ دائري Ø40 بخلفية بيضاء شفّافة فوق الفيديو — هدف ٤٨. */
function RoundButton({ icon, label, onPress }: { icon: 'close' | 'company' | 'listenOff' | 'listen'; label: string; onPress: () => void }) {
  return (
    <Tap label={label} onPress={onPress} style={styles.round}>
      <View style={styles.roundInner}>
        <Icon name={icon} size={20} tone="onReels" monochrome />
      </View>
    </Tap>
  );
}

type FilterItem = { slug: string; name: string; logoUrl: string | null; reelCount: number };

/** «شركاء الطلّات» — لوحة سفلية (Screens A · 05ب): «الكل» ثم الشركاء دوائر ٦٤ بشعاراتهم وعدد طلّات كلٍّ. */
function PartnersSheet({
  open,
  onClose,
  items,
  error,
  onRetry,
  value,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  items: FilterItem[];
  error: Parameters<typeof ErrorState>[0]['error'] | null;
  onRetry: () => void;
  value: string | null;
  onPick: (slug: string | null) => void;
}) {
  const insets = useSafeAreaInsets();
  const total = items.reduce((n, f) => n + f.reelCount, 0);
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="إغلاق" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.grab} />
        <View style={styles.sheetHead}>
          <View style={styles.flex}>
            <Text maxFontSizeMultiplier={1.2} style={styles.sheetTitle} accessibilityRole="header">
              شركاء الطلّات
            </Text>
            {items.length ? (
              <Text maxFontSizeMultiplier={1.2} style={styles.sheetSub}>
                {reelsCount(total)} من {plainNumber(items.length)} شركاء
              </Text>
            ) : null}
          </View>
          <Tap label="إغلاق" onPress={onClose} style={styles.close}>
            <Icon name="close" size={20} tone="onReels" monochrome />
          </Tap>
        </View>
        {error ? (
          <ErrorState error={error} onRetry={onRetry} what="قائمة الشركاء" />
        ) : (
          <ScrollView contentContainerStyle={styles.grid}>
            <PartnerTile name="الكل" count={reelsCount(total)} selected={value === null} onPress={() => onPick(null)} />
            {items.map((f) => (
              <PartnerTile key={f.slug} name={f.name} logo={f.logoUrl} count={reelsCount(f.reelCount)} selected={value === f.slug} onPress={() => onPick(f.slug)} />
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

function PartnerTile({ name, logo, count, selected, onPress }: { name: string; logo?: string | null; count: string; selected: boolean; onPress: () => void }) {
  return (
    <Tap label={`${name}، ${count}`} accessibilityState={{ selected }} scale={0.96} onPress={onPress} style={styles.tile}>
      <View style={[styles.avatar, selected && styles.avatarOn]}>
        {logo ? <Image cachePolicy="memory-disk" source={logo} style={styles.avatarImg} contentFit="cover" /> : <Icon name="categories" size={24} tone="onReels" monochrome />}
      </View>
      <Text maxFontSizeMultiplier={1.2} style={styles.tileName} numberOfLines={2}>
        {name}
      </Text>
      <Text maxFontSizeMultiplier={1.2} style={styles.tileCount}>{count}</Text>
    </Tap>
  );
}

const SHEET = '#28282E';
const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', padding: space.screen },
  // هيكل التحميل داكن كسطح الطلّات — لا ومضة رمادية فاتحة فوق الأسود.
  skeleton: { flex: 1, borderRadius: radius.card },
  top: { position: 'absolute', top: 0, start: 12, end: 8, flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 52 },
  title: { color: '#FFFFFF', fontFamily: 'Tajawal_900Black', fontSize: 22, lineHeight: 32, paddingHorizontal: 4, flexShrink: 1 },
  round: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  roundInner: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.56)' },
  sheet: { backgroundColor: SHEET, borderTopStartRadius: 28, borderTopEndRadius: 28, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: 8, paddingHorizontal: 20, gap: 16, maxHeight: '80%' },
  grab: { alignSelf: 'center', width: 32, height: 4, borderRadius: 2, backgroundColor: '#45454E' },
  sheetHead: { flexDirection: 'row', alignItems: 'center' },
  sheetTitle: { color: '#F2F1F7', fontFamily: 'Tajawal_800ExtraBold', fontSize: 18, lineHeight: 28 },
  sheetSub: { color: '#B8B6CB', fontFamily: 'Tajawal_500Medium', fontSize: 13, lineHeight: 20 },
  close: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#323238', alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 14 },
  tile: { width: '33.33%', alignItems: 'center', gap: 6, paddingHorizontal: 4 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#26265E', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  avatarOn: { borderColor: '#9C9CFF' },
  avatarImg: { width: '100%', height: '100%', backgroundColor: '#FFFFFF' },
  tileName: { color: '#F2F1F7', fontFamily: 'Tajawal_700Bold', fontSize: 13, lineHeight: 18, textAlign: 'center' },
  tileCount: { color: '#B8B6CB', fontFamily: 'Tajawal_500Medium', fontSize: 12, lineHeight: 16 },
  flex: { flex: 1 },
});
