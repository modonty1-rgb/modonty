import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { darkColors, fonts, lightColors, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/**
 * `Article.citations` is `String[]` — a list of source URLs and nothing else. The card
 * shows exactly that: no publisher name, no summary, no «appears in section», and no
 * confirm/edit action, because none of those has a field or a write path today.
 */
export const ArticleCitationCard = memo(function ArticleCitationCard({ url, sourceLabel }: { url: string; sourceLabel: string }) {
  const { mode } = useAppTheme();
  const styles = mode === 'dark' ? darkStyles : lightStyles;
  return <View style={styles.card}>
    <Text style={styles.source}>{sourceLabel}</Text>
    <Text selectable style={styles.url}>{url}</Text>
  </View>;
});

const shared = {
  card: { borderRadius: radii.card, borderWidth: StyleSheet.hairlineWidth, marginBottom: spacing.sm, padding: spacing.md },
  source: { fontFamily: fonts.medium, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  url: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, marginTop: spacing.xs, textAlign: 'left' as const, writingDirection: 'ltr' as const },
};

const darkStyles = StyleSheet.create({ ...shared, card: { ...shared.card, backgroundColor: darkColors.surface, borderColor: darkColors.border }, source: { ...shared.source, color: darkColors.textInteractive }, url: { ...shared.url, color: darkColors.text } });
const lightStyles = StyleSheet.create({ ...shared, card: { ...shared.card, backgroundColor: lightColors.surface, borderColor: lightColors.border }, source: { ...shared.source, color: lightColors.textInteractive }, url: { ...shared.url, color: lightColors.text } });
