import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { control, fonts, radii, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/**
 * The initial circle on every audience card.
 *
 * The tone is derived from the row id, not from its position, so a person keeps the same
 * colour after the list reorders — the circle is recognition, and recognition that changes
 * on every refresh is noise.
 */

const TONES = ['accent', 'warning', 'primary'] as const;

function toneOf(seed: string): (typeof TONES)[number] {
  let sum = 0;
  for (let index = 0; index < seed.length; index += 1) sum += seed.charCodeAt(index);
  return TONES[sum % TONES.length];
}

export function AudienceAvatar({ seed, initial }: { seed: string; initial: string | null }) {
  const { theme } = useAppTheme();
  const tone = toneOf(seed);
  const background = tone === 'warning' ? theme.colors.warning : tone === 'primary' ? theme.colors.primary : theme.colors.brandFill;
  const foreground = tone === 'primary' ? theme.colors.textOnPrimary : theme.colors.navy;
  return <View style={[styles.circle, { backgroundColor: background }]}>
    {initial ? <Text maxFontSizeMultiplier={1} style={[styles.initial, { color: foreground }]}>{initial}</Text> : null}
  </View>;
}

const styles = StyleSheet.create({
  circle: { width: control.minTouchTarget, height: control.minTouchTarget, borderRadius: radii.card, alignItems: 'center', justifyContent: 'center' },
  initial: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection },
});
