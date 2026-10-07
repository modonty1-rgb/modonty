import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReelSlide, type ReelSlideModel } from '@/components/reels/ReelSlide';
import { Header } from '@/components/ui/Header';
import { IconButton } from '@/components/ui/IconButton';
import { ErrorState } from '@/components/ui/StateView';
import { trackReelViewOnce, useReelActions } from '@/hooks/useReelActions';
import { useResource } from '@/hooks/useResource';
import { contentApi } from '@/services/api';
import { useAppTheme } from '@/theme/ThemeProvider';
import { space } from '@/theme/tokens';

/**
 * S10b — ريل واحد (C16) — يُفتح من رابط أو إشعار أو صفحة الشريك. الأقدم/الأحدث بزرّين مرئيين
 * (لا رحلة بالسحب وحده — UIUX §٦). حالة إعجابي/حفظي لا ترجعها C16، فتبدأ «غير مفعّلة» ويصحّحها الخادم عند الضغط.
 */
export default function ReelScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [height, setHeight] = useState(0);
  const res = useResource((signal) => contentApi.reel(slug, signal), [slug]);
  const [slide, setSlide] = useState<ReelSlideModel | null>(null);

  useEffect(() => {
    const r = res.data?.reel;
    if (!r) return;
    setSlide({
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
      comments: null,
      liked: false,
      favorited: false,
      publisher: r.clientName,
      publisherSlug: r.clientSlug,
      publisherLogo: r.clientLogoUrl,
    });
    trackReelViewOnce(r.id);
  }, [res.data]);

  const update = useCallback((_id: string, fn: (s: ReelSlideModel) => ReelSlideModel) => setSlide((s) => (s ? fn(s) : s)), []);
  const actions = useReelActions(update);
  const n = res.data?.neighbors;

  return (
    <View style={[styles.root, { backgroundColor: colors.reelsBackground }]} onLayout={(e: LayoutChangeEvent) => setHeight(e.nativeEvent.layout.height)}>
      {res.status === 'error' ? (
        <View style={[styles.root, { backgroundColor: colors.page, paddingTop: insets.top }]}>
          <Header back />
          <ErrorState error={res.error} onRetry={res.reload} what="الريل" />
        </View>
      ) : slide && height > 0 ? (
        <ReelSlide slide={slide} height={height} active bottomInset={insets.bottom} actions={actions} />
      ) : null}
      <Header
        back
        overlay
        actions={
          <View style={styles.nav}>
            <IconButton icon="back" label="الريل الأحدث" tone="onReels" disabled={!n?.newer} onPress={() => n?.newer && router.replace({ pathname: '/reels/[slug]', params: { slug: n.newer } })} />
            <IconButton icon="forward" label="الريل الأقدم" tone="onReels" disabled={!n?.older} onPress={() => n?.older && router.replace({ pathname: '/reels/[slug]', params: { slug: n.older } })} />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 }, nav: { flexDirection: 'row', gap: space.xxs } });
