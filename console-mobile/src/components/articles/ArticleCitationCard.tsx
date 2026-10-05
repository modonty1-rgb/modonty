import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { GroupRow, IconShape } from '@/src/components/ui/Nabd';
import { fonts, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/**
 * `Article.citations` is `String[]` — a list of source URLs and nothing else. The row shows
 * exactly that: no publisher name, no summary, and no «افتح المصدر» action, because none of
 * those has a field or a write path today. «نبض»: صفّ في مجموعة مقطّعة برمز رابط دائري.
 */
export const ArticleCitationCard = memo(function ArticleCitationCard({ url, sourceLabel, position }: { url: string; sourceLabel: string; position: 'only' | 'first' | 'middle' | 'last' }) {
  const { theme } = useAppTheme();
  return <GroupRow position={position}>
    <View style={styles.row}>
      <IconShape icon="link" />
      <View style={styles.copy}>
        <Text style={[styles.source, { color: theme.colors.muted }]}>{sourceLabel}</Text>
        <Text selectable style={[styles.url, { color: theme.colors.text }]}>{url}</Text>
      </View>
    </View>
  </GroupRow>;
});

const styles = StyleSheet.create({
  row: { alignItems: 'flex-start', flexDirection: 'row-reverse', gap: spacing.sm },
  copy: { flex: 1, gap: spacing.xxs, minWidth: 0 },
  source: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl' },
  // الرابط يُقرأ يساراً كأي عنوان شبكة.
  url: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'left', writingDirection: 'ltr' },
});
