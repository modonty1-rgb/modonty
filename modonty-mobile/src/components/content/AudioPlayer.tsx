import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ProgressBar } from 'react-native-paper';

import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { duration as fmt } from '@/lib/format';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, radius, space } from '@/theme/tokens';

/** «استمع للمقال» — `audioUrl` نفسه الذي يشغّله الويب. المدّة من الملفّ، وإلا من حقل المقال. */
export const AudioPlayer = memo(function AudioPlayer({ url, durationSeconds }: { url: string; durationSeconds: number | null }) {
  const { colors } = useAppTheme();
  const player = useAudioPlayer(url);
  const status = useAudioPlayerStatus(player);
  const total = status.duration > 0 ? status.duration : (durationSeconds ?? 0);
  const progress = total > 0 ? Math.min(1, status.currentTime / total) : 0;
  const toggle = () => {
    if (status.playing) player.pause();
    else {
      if (status.didJustFinish || (total > 0 && status.currentTime >= total)) void player.seekTo(0);
      player.play();
    }
  };
  return (
    <View style={[styles.box, { backgroundColor: colors.surfaceRaised }]}>
      <Tap label={status.playing ? 'إيقاف الاستماع' : 'استمع للمقال'} onPress={toggle} style={[styles.play, { backgroundColor: colors.primary }]}>
        <Icon name={status.playing ? 'close' : 'play'} size={control.iconSmall} tone="onPrimary" monochrome />
      </Tap>
      <View style={styles.flex}>
        <AppText variant="label">{status.playing ? 'يُشغَّل الآن' : 'استمع للمقال'}</AppText>
        <ProgressBar progress={progress} color={colors.primary} style={[styles.bar, { backgroundColor: colors.border }]} />
        <AppText variant="secondary" tone="muted">
          {[fmt(status.currentTime), fmt(total)].filter(Boolean).join(' / ') || ' '}
        </AppText>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderRadius: radius.card, padding: space.sm },
  play: { width: control.touch, height: control.touch, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, gap: space.xxs },
  bar: { height: space.xxs, borderRadius: radius.pill },
});
