import { Image } from 'expo-image';
import { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { PressableScale, StatusBadge } from '@/src/components/ui/Nabd';
import { reelBadgeTone } from '@/src/components/videos/reel-badge-tone';
import type { VideoSummary } from '@/src/services/engagement-api';
import { control, darkColors, nabd, radii, spacing } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/** الطلّة عمودية ٩:١٦ كما تُصوَّر وتُعرض في مدونتي — المربّع والعريض يقصّان نصف اللقطة. */
const REEL_ASPECT_RATIO = 9 / 16;

type Props = { item: VideoSummary; index: number; openPrefix: string | null; onOpen: ((index: number) => void) | null };

/**
 * مربّع طلّة في شبكة الطلّات — خالد ٥ أكتوبر ٢٠٢٦: «زيّ تيك توك».
 *
 * الحالة شارة فوق المصغّرة (كلمة + رمز + لون)، فتُقرأ الشبكة بنظرة: ما نُشر وما ينتظر وما رُفض.
 * ورمز التشغيل **فقط** حين يوجد ما يُشغَّل (`onOpen` + رابط): بلا مشغّل في هذه النسخة أو بلا رابط
 * بعد، المربّع لا يَعِد بضغطة لا تقع.
 */
export const ReelTile = memo(function ReelTile({ item, index, openPrefix, onOpen }: Props) {
  const { theme } = useAppTheme();
  const canOpen = onOpen !== null;
  const open = useCallback(() => onOpen?.(index), [index, onOpen]);
  const tile = <View style={[styles.tile, { backgroundColor: theme.colors.surfaceRaised }]}>
    {item.thumbnailUrl
      ? <Image accessibilityIgnoresInvertColors cachePolicy="memory-disk" contentFit="cover" source={item.thumbnailUrl} style={StyleSheet.absoluteFill} transition={200} />
      : <View style={styles.center}><ModontyIcon name="reels" size={control.iconSize} primary={theme.colors.muted} accent={theme.colors.accent} /></View>}
    {canOpen && item.videoUrl ? <View pointerEvents="none" style={styles.center}>
      <View style={[styles.play, { backgroundColor: darkColors.scrim }]}>
        <ModontyIcon name="play" size={control.iconSizeSmall} primary={darkColors.text} accent={darkColors.accent} />
      </View>
    </View> : null}
    {item.statusLabel ? <StatusBadge label={item.statusLabel} tone={reelBadgeTone(item.statusTone)} style={styles.badge} /> : null}
  </View>;
  if (!canOpen) return <View accessible accessibilityLabel={[item.statusLabel, item.metaLine].filter(Boolean).join(' · ')} style={styles.cell}>{tile}</View>;
  return <PressableScale onPress={open} accessibilityLabel={[openPrefix, item.statusLabel, item.metaLine].filter(Boolean).join(' · ')} style={styles.cell}>{tile}</PressableScale>;
});

const styles = StyleSheet.create({
  cell: { flex: 1 },
  tile: { aspectRatio: REEL_ASPECT_RATIO, borderRadius: radii.field, overflow: 'hidden', width: '100%' },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  play: { alignItems: 'center', borderRadius: nabd.pill, height: control.minTouchTarget, justifyContent: 'center', width: control.minTouchTarget },
  badge: { position: 'absolute', right: spacing.xs, top: spacing.xs },
});
