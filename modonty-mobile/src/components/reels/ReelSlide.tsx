import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { compactNumber } from '@/lib/format';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, radius, space } from '@/theme/tokens';

export type ReelSlideModel = {
  id: string;
  slug: string;
  title: string;
  description: string;
  isVideo: boolean;
  videoUrl: string | null;
  posterUrl: string | null;
  imageUrl: string | null;
  likes: number;
  favorites: number;
  comments: number | null;
  liked: boolean;
  favorited: boolean;
  publisher: string;
  publisherSlug: string;
  publisherLogo: string | null;
};

export type ReelSlideActions = {
  onLike: (id: string) => void;
  onFavorite: (id: string) => void;
  onComments: (slide: ReelSlideModel) => void;
  onShare: (slide: ReelSlideModel) => void;
  onPublisher: (slug: string) => void;
};

/** فيديو الريل: يُنشأ المشغّل مع الشريحة، ويعمل فقط وهي الظاهرة (لا تشغيل لما خارج الشاشة). */
function ReelVideo({ url, poster, active }: { url: string; poster: string | null; active: boolean }) {
  const player = useVideoPlayer(url, (p) => {
    p.loop = true;
  });
  useEffect(() => {
    if (active) player.play();
    else player.pause();
  }, [active, player]);
  return (
    <>
      {poster ? <Image source={poster} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} allowsFullscreen={false} />
    </>
  );
}

/**
 * شريحة ريل عمودية بارتفاع الشاشة: المحتوى خلفاً، والأفعال عموداً في الطرف، والناشر والعنوان أسفلاً
 * فوق ظلّ يحفظ تباين النصّ الأبيض.
 */
export const ReelSlide = memo(function ReelSlide({
  slide,
  height,
  active,
  bottomInset,
  actions,
}: {
  slide: ReelSlideModel;
  height: number;
  active: boolean;
  bottomInset: number;
  actions: ReelSlideActions;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.slide, { height, backgroundColor: colors.reelsBackground }]}>
      {slide.isVideo && slide.videoUrl ? (
        <ReelVideo url={slide.videoUrl} poster={slide.posterUrl} active={active} />
      ) : slide.imageUrl ? (
        <Image source={slide.imageUrl} style={StyleSheet.absoluteFill} contentFit="contain" accessibilityLabel={slide.title} />
      ) : null}

      <View style={[styles.side, { bottom: bottomInset + space.xxl * 3 }]}>
        <SideAction icon="like" label="أعجبني" count={slide.likes} active={slide.liked} onPress={() => actions.onLike(slide.id)} />
        <SideAction icon="bookmark" label="حفظ" count={slide.favorites} active={slide.favorited} onPress={() => actions.onFavorite(slide.id)} />
        <SideAction icon="comment" label="التعليقات" count={slide.comments} onPress={() => actions.onComments(slide)} />
        <SideAction icon="share" label="مشاركة" onPress={() => actions.onShare(slide)} />
      </View>

      <View style={[styles.caption, { paddingBottom: bottomInset + space.md, backgroundColor: colors.reelsScrim }]}>
        <Tap label={slide.publisher} role="link" onPress={() => actions.onPublisher(slide.publisherSlug)} style={styles.publisher}>
          {slide.publisherLogo ? <Image source={slide.publisherLogo} style={styles.logo} contentFit="cover" /> : null}
          <AppText variant="label" tone="onReels" numberOfLines={1}>
            {slide.publisher}
          </AppText>
        </Tap>
        {slide.title ? (
          <AppText variant="body" tone="onReels" numberOfLines={2}>
            {slide.title}
          </AppText>
        ) : null}
        {slide.description ? (
          <AppText variant="secondary" tone="onReelsMuted" numberOfLines={2}>
            {slide.description}
          </AppText>
        ) : null}
      </View>
    </View>
  );
});

function SideAction({ icon, label, count, active, onPress }: { icon: 'like' | 'bookmark' | 'comment' | 'share'; label: string; count?: number | null; active?: boolean; onPress: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Tap label={active ? `${label} (مفعّل)` : label} accessibilityState={{ selected: active }} onPress={onPress} style={styles.sideAction}>
      <View style={[styles.sideIcon, { backgroundColor: active ? colors.primary : colors.reelsScrim }]}>
        <Icon name={icon} tone="onReels" monochrome={!active} />
      </View>
      {count != null && count > 0 ? (
        <AppText variant="tabLabel" tone="onReels" fixedSize>
          {compactNumber(count)}
        </AppText>
      ) : null}
    </Tap>
  );
}

const styles = StyleSheet.create({
  slide: { width: '100%', overflow: 'hidden' },
  side: { position: 'absolute', end: space.xs, gap: space.sm, alignItems: 'center', zIndex: 2 },
  sideAction: { alignItems: 'center', gap: space.xxs },
  sideIcon: { width: control.touch, height: control.touch, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  caption: { position: 'absolute', start: 0, end: 0, bottom: 0, paddingStart: space.screen, paddingEnd: control.touch + space.lg, paddingTop: space.md, gap: space.xxs },
  publisher: { flexDirection: 'row', alignItems: 'center', gap: space.xs, alignSelf: 'flex-start', minWidth: 0 },
  logo: { width: control.icon, height: control.icon, borderRadius: radius.pill },
});
