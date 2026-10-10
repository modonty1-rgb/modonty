import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { memo, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';

import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { useFollow } from '@/hooks/useFollow';
import { compactNumber } from '@/lib/format';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds, dsFontScale, dsType } from '@/theme/tokens';

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

/** ظلّ الطلّات (Screens A · 05): كحلي عميق لا أسود — يحفظ تباين النصّ الأبيض فوق أيّ فيديو. */
const SHADE = '#080628';

/**
 * فيديو الطلّة: يُنشأ المشغّل مع الشريحة، ويعمل فقط وهي الظاهرة. الصوت يتبع زرّ الكتم في رأس الشاشة.
 * `textureView` على أندرويد: SurfaceView يرمش ويصغر داخل القوائم (مقيس ٩ أكتوبر). iOS يتجاهلها.
 * شريط التقدّم: `timeUpdate` كل ربع ثانية ← قيمة مشتركة، فلا يُعاد رسم الشريحة مع كل تحديث.
 * المصدر HLS من Bunny Stream (`hlsUrl` قبل `mp4Url`): يبدأ بجودة تناسب الشبكة ويرتفع، لا ملفّ كامل.
 */
function ReelVideo({ url, poster, active, muted, progress }: { url: string; poster: string | null; active: boolean; muted: boolean; progress: SharedValue<number> }) {
  const player = useVideoPlayer(url, (p) => {
    p.loop = true;
    p.timeUpdateEventInterval = 0.25;
    // الطلّة قصيرة: ٨ ثوانٍ أمامها تكفي للتشغيل السلس، بدل ٢٠ الافتراضية التي تُثقل الذاكرة والبيانات.
    p.bufferOptions = { preferredForwardBufferDuration: 8, minBufferForPlayback: 1 };
  });
  useEffect(() => {
    player.muted = muted;
  }, [muted, player]);
  useEffect(() => {
    if (active) player.play();
    else player.pause();
  }, [active, player]);
  useEffect(() => {
    const sub = player.addListener('timeUpdate', ({ currentTime }) => {
      const d = player.duration;
      progress.value = d > 0 ? Math.min(1, currentTime / d) : 0;
    });
    return () => sub.remove();
  }, [player, progress]);
  return (
    <>
      {poster ? <Image cachePolicy="memory-disk" source={poster} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" surfaceType="textureView" nativeControls={false} fullscreenOptions={{ enable: false }} />
    </>
  );
}

/**
 * شريحة طلّة بملء الشاشة — Screens A · 05: ظلّان (أعلى ٢٠٠ · أسفل ٤٠٠) · أفعال عمودية أيقونات ٢٨ بلا دوائر
 * والأعداد الصفرية مخفيّة · الشريك (شعار ٤٠ + اسم + «تابع») · العنوان ١٨ · الوصف سطران · «صفحة الشريك»
 * (لا زرّ حجز في بيانات الطلّة — لا نختلقه) · شريط تقدّم فوق الكبسولة.
 */
export const ReelSlide = memo(function ReelSlide({
  slide,
  height,
  active,
  near = true,
  muted = true,
  bottomInset,
  actions,
}: {
  slide: ReelSlideModel;
  height: number;
  active: boolean;
  /** الظاهرة وجارتاها فقط تملك مشغّلاً (يبدأ التالي فوراً عند السحب) — البعيدة صورتها الثابتة فقط. */
  near?: boolean;
  muted?: boolean;
  bottomInset: number;
  actions: ReelSlideActions;
}) {
  const { colors } = useAppTheme();
  const progress = useSharedValue(0);
  const bar = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  return (
    <View style={[styles.slide, { height, backgroundColor: colors.reelsBackground }]}>
      {slide.isVideo && slide.videoUrl && near ? (
        <ReelVideo url={slide.videoUrl} poster={slide.posterUrl} active={active} muted={muted} progress={progress} />
      ) : slide.isVideo && slide.posterUrl ? (
        <Image cachePolicy="memory-disk" source={slide.posterUrl} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : slide.imageUrl ? (
        <Image cachePolicy="memory-disk" source={slide.imageUrl} style={StyleSheet.absoluteFill} contentFit="contain" accessibilityLabel={slide.title} />
      ) : null}

      <LinearGradient pointerEvents="none" colors={['rgba(8,6,40,0.94)', 'rgba(8,6,40,0.82)', 'rgba(8,6,40,0)']} locations={[0, 0.45, 1]} style={styles.topShade} />
      <LinearGradient pointerEvents="none" colors={['rgba(8,6,40,0)', SHADE]} locations={[0, 0.52]} style={[styles.bottomShade, { height: 400 + bottomInset - 88 }]} />

      <View style={[styles.side, { bottom: bottomInset + 160 }]}>
        <SideAction icon={slide.liked ? 'likeFilled' : 'like'} label="أعجبني" count={slide.likes} active={slide.liked} onPress={() => actions.onLike(slide.id)} />
        <SideAction icon="comment" label="التعليقات" count={slide.comments} onPress={() => actions.onComments(slide)} />
        <SideAction icon={slide.favorited ? 'bookmarkFilled' : 'bookmark'} label="حفظ" count={slide.favorites} active={slide.favorited} onPress={() => actions.onFavorite(slide.id)} />
        <SideAction icon="share" label="مشاركة" onPress={() => actions.onShare(slide)} />
      </View>

      <View style={[styles.caption, { bottom: bottomInset + 8 }]}>
        <View style={styles.publisherRow}>
          <Tap label={slide.publisher} role="link" minTarget={false} onPress={() => actions.onPublisher(slide.publisherSlug)} style={styles.publisher}>
            {slide.publisherLogo ? <Image cachePolicy="memory-disk" source={slide.publisherLogo} style={styles.logo} contentFit="cover" /> : null}
            <Text style={styles.publisherName} numberOfLines={1} maxFontSizeMultiplier={1.2}>
              {slide.publisher}
            </Text>
          </Tap>
          <FollowPill slug={slide.publisherSlug} name={slide.publisher} />
        </View>
        {slide.title ? (
          <Text style={[dsType.titleMd, styles.title]} maxFontSizeMultiplier={dsFontScale.max}>
            {slide.title}
          </Text>
        ) : null}
        {slide.description ? (
          <Text style={[dsType.bodySm, styles.description]} numberOfLines={2} maxFontSizeMultiplier={dsFontScale.max}>
            {slide.description}
          </Text>
        ) : null}
        <Tap label={`صفحة ${slide.publisher}`} role="link" scale={0.96} onPress={() => actions.onPublisher(slide.publisherSlug)} style={styles.cta}>
          <Icon name="company" size={20} tone="navy" monochrome />
          <Text style={styles.ctaText} maxFontSizeMultiplier={1.2}>
            صفحة الشريك
          </Text>
        </Tap>
      </View>

      {slide.isVideo ? (
        <View style={[styles.track, { bottom: bottomInset - 4 }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Animated.View style={[styles.fill, bar]} />
        </View>
      ) : null}
    </View>
  );
});

/** «تابع» حبّة بحدّ أبيض — نفس منطق useFollow في كل التطبيق. */
function FollowPill({ slug, name }: { slug: string; name: string }) {
  const { following, busy, toggle } = useFollow(slug);
  return (
    <Tap
      label={following ? `تتابع ${name}` : `تابع ${name}`}
      accessibilityState={{ selected: !!following, busy }}
      disabled={busy || following === null}
      hitSlop={8}
      minTarget={false}
      onPress={toggle}
      style={[styles.follow, following ? styles.followOn : null]}
    >
      {busy ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text style={[styles.followText, following ? styles.followTextOn : null]} maxFontSizeMultiplier={1.2}>
          {following ? 'تتابعه' : 'تابع'}
        </Text>
      )}
    </Tap>
  );
}

function SideAction({ icon, label, count, active, onPress }: { icon: 'like' | 'likeFilled' | 'bookmark' | 'bookmarkFilled' | 'comment' | 'share'; label: string; count?: number | null; active?: boolean; onPress: () => void }) {
  return (
    <Tap label={active ? `${label} (مفعّل)` : label} accessibilityState={{ selected: active }} scale={0.9} onPress={onPress} style={styles.sideAction}>
      <Icon name={icon} size={ds.icon.reel} tone="onReels" monochrome={!active} knockout="reelsBackground" />
      {count != null && count > 0 ? (
        <Text style={styles.count} maxFontSizeMultiplier={1}>
          {compactNumber(count)}
        </Text>
      ) : null}
    </Tap>
  );
}

const styles = StyleSheet.create({
  slide: { width: '100%', overflow: 'hidden' },
  topShade: { position: 'absolute', top: 0, start: 0, end: 0, height: 200 },
  bottomShade: { position: 'absolute', start: 0, end: 0, bottom: 0 },
  side: { position: 'absolute', end: 8, gap: 6, alignItems: 'center', zIndex: 2 },
  sideAction: { width: 52, minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  count: { color: '#FFFFFF', fontFamily: 'Tajawal_700Bold', fontSize: 12, lineHeight: 16 },
  caption: { position: 'absolute', start: ds.layout.gutter, end: 72, gap: 10, zIndex: 2 },
  publisherRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  publisher: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1, minHeight: 44 },
  logo: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF' },
  publisherName: { color: '#FFFFFF', fontFamily: 'Tajawal_800ExtraBold', fontSize: 15, lineHeight: 22, flexShrink: 1 },
  follow: { height: 32, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1.5, borderColor: '#FFFFFF', justifyContent: 'center' },
  followOn: { backgroundColor: '#FFFFFF' },
  followText: { color: '#FFFFFF', fontFamily: 'Tajawal_700Bold', fontSize: 13, lineHeight: 18 },
  followTextOn: { color: '#0E065A' },
  title: { color: '#FFFFFF', fontFamily: 'Tajawal_800ExtraBold' },
  description: { color: '#E6E4F5' },
  cta: { alignSelf: 'flex-start', height: 48, paddingHorizontal: 22, borderRadius: 24, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: 8 },
  ctaText: { color: '#0E065A', fontFamily: 'Tajawal_800ExtraBold', fontSize: 15, lineHeight: 20 },
  track: { position: 'absolute', start: ds.layout.gutter, end: ds.layout.gutter, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.28)', zIndex: 3 },
  fill: { position: 'absolute', top: 0, bottom: 0, start: 0, borderRadius: 2, backgroundColor: '#FFFFFF' },
});
