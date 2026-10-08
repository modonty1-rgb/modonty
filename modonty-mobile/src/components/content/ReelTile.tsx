import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, media, radius, space } from '@/theme/tokens';

export type ReelTileModel = { key: string; slug: string; title: string; poster: string | null; publisher: string; isVideo: boolean };

/** مصغّرة ريل عمودية ٩:١٦ — في الرئيسية وصفحة الشريك. */
export const ReelTile = memo(function ReelTile({ item, onOpen, width }: { item: ReelTileModel; onOpen: (slug: string) => void; width: number }) {
  const { colors } = useAppTheme();
  return (
    <Tap label={item.title || item.publisher} role="link" onPress={() => onOpen(item.slug)} style={[styles.tile, { width, backgroundColor: colors.reelsBackground }]}>
      {item.poster ? <Image source={item.poster} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} /> : null}
      <View style={[styles.shade, { backgroundColor: colors.reelsScrim }]}>
        {item.isVideo ? <Icon name="play" size={control.iconSmall} tone="onReels" monochrome /> : null}
        <AppText variant="secondary" tone="onReels" numberOfLines={2}>
          {item.title || item.publisher}
        </AppText>
      </View>
    </Tap>
  );
});

const styles = StyleSheet.create({
  tile: { aspectRatio: media.reelAspect, borderRadius: radius.image, overflow: 'hidden', justifyContent: 'flex-end' },
  shade: { padding: space.xs, gap: space.xxs },
});
