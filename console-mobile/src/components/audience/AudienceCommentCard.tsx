import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { AudienceAvatar } from '@/src/components/audience/AudienceAvatar';
import type { AudienceCommentSummary } from '@/src/services/engagement-api';
import { fonts, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/**
 * One article comment on S08.
 *
 * It carries no action on purpose: the mobile API has a reply route for questions and none
 * for comments, and a tappable card that leads nowhere is worse than a plain one.
 */

export const AudienceCommentCard = memo(function AudienceCommentCard({ item }: { item: AudienceCommentSummary }) {
  const { theme } = useAppTheme();
  return <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
    <View style={styles.identity}>
      <AudienceAvatar seed={item.id} initial={item.initial} />
      <View style={styles.identityCopy}>
        {item.name ? <Text numberOfLines={1} style={[styles.name, { color: theme.colors.text }]}>{item.name}</Text> : null}
        {item.metaLine ? <Text numberOfLines={1} style={[styles.meta, { color: theme.colors.muted }]}>{item.metaLine}</Text> : null}
      </View>
    </View>
    <Text style={[styles.content, { color: theme.colors.text }]}>{item.content}</Text>
    <Text numberOfLines={2} style={[styles.article, { color: theme.colors.muted }]}>{item.articleLine}</Text>
  </View>;
});

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radii.card, padding: spacing.md, marginBottom: spacing.sm },
  identity: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm },
  identityCopy: { flex: 1, minWidth: 0, alignItems: 'flex-end' },
  name: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right', writingDirection: 'rtl' },
  meta: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.xxs },
  content: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.md },
  article: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.xs },
});
