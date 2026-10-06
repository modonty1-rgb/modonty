import { useEvent } from 'expo';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, useWindowDimensions, View, type ViewToken } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { PressableScale, StatusBadge } from '@/src/components/ui/Nabd';
import type { VideoSummary } from '@/src/services/engagement-api';
import { reelBadgeTone } from '@/src/components/videos/reel-badge-tone';
import { control, darkColors, fonts, nabd, radii, spacing, typography } from '@/src/theme/tokens';

/**
 * مشغّل الطلّات ملء الشاشة — سحبٌ عمودي للتالي والسابق كتيك توك (خالد ٥ أكتوبر ٢٠٢٦).
 *
 * المسرح **داكن دائماً** (`darkColors`) في الوضعين: الفيديو يُشاهَد على أسود، وسطحٌ فاتح حوله
 * يبهر العين ويغيّر إحساس ألوان اللقطة نفسها.
 *
 * مشغّل واحد يعمل فقط: الصفحة الظاهرة تشغّل، وجارتاها تحمّلان مصدرهما مسبقاً وتبقيان موقوفتين
 * (السحب لا ينتظر شبكة)، وكل ما أبعد بلا مصدر أصلاً — فلا يتراكم فكّ ترميز عشرين فيديو في الذاكرة.
 */

export type ReelPlayerCopy = {
  backLabel: string;
  playLabel: string;
  pauseLabel: string;
  rejectionTitle: string;
  videoNotReadyLabel: string;
  playbackErrorLabel: string;
};

type Props = { videos: VideoSummary[]; initialIndex: number; copy: ReelPlayerCopy; onClose: () => void };

const viewability = { itemVisiblePercentThreshold: 60 };

export function ReelPlayer({ videos, initialIndex, copy, onClose }: Props) {
  const window = useWindowDimensions();
  /**
   * ارتفاع الصفحة = ارتفاع المسرح المقيس لا `useWindowDimensions`: النافذة تغطّي شريطي الحالة
   * والأزرار (`statusBarTranslucent` · `navigationBarTranslucent`) وأبعاد النافذة تستثنيهما، فكانت
   * كل صفحة أقصر من الشاشة ويطلّ رأس الطلّة التالية أسفلها (جوال خالد ٦ أكتوبر ٢٠٢٦).
   */
  const [stage, setStage] = useState<{ width: number; height: number } | null>(null);
  const width = stage?.width ?? window.width;
  const height = stage?.height ?? window.height;
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken<VideoSummary>[] }) => {
    const first = viewableItems.find((token) => token.isViewable && token.index !== null);
    if (first?.index != null) setActiveIndex(first.index);
  }).current;
  const getItemLayout = useCallback((_: ArrayLike<VideoSummary> | null | undefined, index: number) => ({ length: height, offset: height * index, index }), [height]);

  return <Modal visible animationType="fade" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
    <View style={[styles.stage, { backgroundColor: darkColors.page }]} onLayout={(event) => { const { width: w, height: h } = event.nativeEvent.layout; setStage((prev) => prev && prev.width === w && prev.height === h ? prev : { width: w, height: h }); }}>
      {stage === null ? null : <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <ReelPage item={item} width={width} height={height} isActive={index === activeIndex} isNear={Math.abs(index - activeIndex) <= 1} copy={copy} />}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        getItemLayout={getItemLayout}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={viewability}
        windowSize={3}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        decelerationRate="fast"
      />}
      <PlayerChrome copy={copy} onClose={onClose} />
    </View>
  </Modal>;
}

/** الرجوع ثابت فوق الصفحات كلها — لا يتحرّك مع السحب. */
function PlayerChrome({ copy, onClose }: { copy: ReelPlayerCopy; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  return <View pointerEvents="box-none" style={[styles.chrome, { paddingTop: insets.top + spacing.xs }]}>
    <PressableScale accessibilityLabel={copy.backLabel} onPress={onClose} style={styles.backTarget}>
      <View style={[styles.back, { backgroundColor: darkColors.surfaceRaised }]}>
        {/* نفس رجوع `ScreenHeader`: السهم مرآةٌ في العربية فيشير إلى بداية القراءة. */}
        <View style={styles.mirrored}><ModontyIcon name="arrow-left" size={control.headerIconSize} primary={darkColors.text} accent={darkColors.accent} /></View>
      </View>
    </PressableScale>
  </View>;
}

const ReelPage = memo(function ReelPage({ item, width, height, isActive, isNear, copy }: { item: VideoSummary; width: number; height: number; isActive: boolean; isNear: boolean; copy: ReelPlayerCopy }) {
  const insets = useSafeAreaInsets();
  const videoUrl = item.videoUrl ?? null;
  // `.m3u8` يُعلَن HLS صراحةً؛ رابط Bunny Stream ينتهي به دائماً، وغيره (MP4) يُكتشف وحده.
  const source = isNear && videoUrl ? { uri: videoUrl, contentType: videoUrl.includes('.m3u8') ? 'hls' as const : 'auto' as const, useCaching: !videoUrl.includes('.m3u8') } : null;
  const player = useVideoPlayer(source, (created) => { created.loop = true; });
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const { status } = useEvent(player, 'statusChange', { status: player.status });
  /** إيقاف العميل بيده يُحترم حتى يسحب بعيداً — العودة للصفحة تبدأ تشغيلاً جديداً. */
  const [isPausedByUser, setPausedByUser] = useState(false);

  useEffect(() => {
    if (!isActive) { setPausedByUser(false); player.pause(); return; }
    if (!isPausedByUser) player.play();
  }, [isActive, isPausedByUser, player]);

  const togglePlayback = useCallback(() => {
    if (videoUrl === null) return;
    setPausedByUser((paused) => !paused);
  }, [videoUrl]);

  const hasError = status === 'error';
  const isLoading = videoUrl !== null && isActive && status === 'loading';
  const notice = item.isVideo && videoUrl === null ? copy.videoNotReadyLabel : hasError ? copy.playbackErrorLabel : null;
  const poster = item.thumbnailUrl ?? item.imageUrl ?? null;

  return <View style={{ width, height }}>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={videoUrl === null ? item.filename : `${isPlaying ? copy.pauseLabel : copy.playLabel} ${item.filename}`}
      onPress={togglePlayback}
      style={StyleSheet.absoluteFill}
    >
      {/* الملصق تحت المشغّل: يظهر حتى يصل أوّل إطار، فلا شاشة سوداء بين السحبة والتشغيل. */}
      {poster ? <Image source={poster} contentFit="contain" cachePolicy="memory-disk" style={StyleSheet.absoluteFill} /> : null}
      {videoUrl !== null && isNear ? <VideoView player={player} nativeControls={false} contentFit="contain" style={StyleSheet.absoluteFill} /> : null}
    </Pressable>

    {videoUrl !== null && isActive && !isPlaying && !isLoading && !hasError ? <View pointerEvents="none" style={styles.center}>
      <View style={[styles.playBadge, { backgroundColor: darkColors.scrim }]}>
        <ModontyIcon name="play" size={control.iconSize * 2} primary={darkColors.text} accent={darkColors.accent} />
      </View>
    </View> : null}

    <View pointerEvents="none" style={[styles.overlay, { paddingBottom: insets.bottom + spacing.lg }]}>
      {item.statusLabel ? <StatusBadge label={item.statusLabel} tone={reelBadgeTone(item.statusTone)} /> : null}
      {notice ? <Text style={[styles.notice, { color: darkColors.text, backgroundColor: darkColors.surfaceRaised }]}>{notice}</Text> : null}
      {/* سبب الرفض داخل المشغّل: العميل يرى اللقطة وسببها معاً فيعرف ماذا يغيّر. */}
      {item.rejectionReason ? <View style={[styles.rejection, { backgroundColor: darkColors.dangerContainer }]}>
        <Text style={[styles.rejectionTitle, { color: darkColors.onDangerContainer }]}>{copy.rejectionTitle}</Text>
        <Text style={[styles.rejectionBody, { color: darkColors.onDangerContainer }]}>{item.rejectionReason}</Text>
      </View> : null}
    </View>
  </View>;
});

const styles = StyleSheet.create({
  stage: { flex: 1 },
  chrome: { left: 0, paddingHorizontal: spacing.sm, position: 'absolute', right: 0, top: 0, flexDirection: 'row-reverse' },
  backTarget: { alignItems: 'center', height: control.minTouchTarget, justifyContent: 'center', width: control.minTouchTarget },
  back: { alignItems: 'center', borderRadius: nabd.pill, height: nabd.backButtonSize, justifyContent: 'center', width: nabd.backButtonSize },
  mirrored: { transform: [{ scaleX: -1 }] },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  playBadge: { alignItems: 'center', borderRadius: nabd.pill, height: control.buttonHeight * 1.5, justifyContent: 'center', width: control.buttonHeight * 1.5 },
  overlay: { bottom: 0, gap: spacing.xs, left: 0, paddingHorizontal: spacing.screenHorizontal, position: 'absolute', right: 0 },
  notice: { alignSelf: 'flex-end', borderRadius: radii.field, fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, overflow: 'hidden', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, textAlign: 'right', writingDirection: 'rtl' },
  rejection: { borderRadius: radii.field, gap: spacing.xxs, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  rejectionTitle: { fontFamily: fonts.bold, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'right', writingDirection: 'rtl' },
  rejectionBody: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl' },
});
