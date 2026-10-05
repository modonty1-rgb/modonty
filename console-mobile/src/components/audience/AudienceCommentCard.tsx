import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { rtlLine } from '@/src/components/ui/bidi';
import { AudienceAvatar } from '@/src/components/audience/AudienceAvatar';
import { TonalCard } from '@/src/components/ui/Nabd';
import type { AudienceCommentSummary } from '@/src/services/engagement-api';
import { fonts, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/**
 * تعليق على مقال في S08 — «نبض»: نفس بطاقة السؤال بلا زرّ.
 *
 * بلا فعل عن قصد: عقد الجوّال فيه مسار ردّ للأسئلة ولا شيء للتعليقات، وبطاقة تُضغط ولا
 * تقود لشيء أسوأ من بطاقة ساكنة.
 */
export const AudienceCommentCard = memo(function AudienceCommentCard({ item }: { item: AudienceCommentSummary }) {
  const { theme } = useAppTheme();
  return <TonalCard style={styles.card}>
    <View style={styles.identity}>
      <AudienceAvatar initial={item.initial} />
      <View style={styles.identityCopy}>
        {item.name ? <Text numberOfLines={1} style={[styles.name, { color: theme.colors.text }]}>{item.name}</Text> : null}
        {item.metaLine ? <Text numberOfLines={1} style={[styles.secondary, { color: theme.colors.muted }]}>{rtlLine(item.metaLine)}</Text> : null}
      </View>
    </View>
    <Text style={[styles.content, { color: theme.colors.text }]}>{item.content}</Text>
    <Text numberOfLines={1} style={[styles.secondary, { color: theme.colors.muted }]}>{item.articleLine}</Text>
  </TonalCard>;
});

const styles = StyleSheet.create({
  card: { gap: spacing.xs, marginBottom: spacing.sm },
  identity: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.sm },
  identityCopy: { flex: 1, minWidth: 0 },
  name: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'right', writingDirection: 'rtl' },
  secondary: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl' },
  content: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl' },
});
