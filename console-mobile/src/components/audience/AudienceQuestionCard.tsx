import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { AudienceAvatar } from '@/src/components/audience/AudienceAvatar';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import type { AudienceQuestionSummary } from '@/src/services/engagement-api';
import { control, fonts, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/**
 * One reader question on S08. Memoised, and it calls `onOpen(id)` so the list can hand every
 * row the same function instance instead of minting a closure per row on every render.
 */

type Props = { item: AudienceQuestionSummary; replyLabel: string; openPrefix: string; onOpen: (questionId: string) => void };

export const AudienceQuestionCard = memo(function AudienceQuestionCard({ item, replyLabel, openPrefix, onOpen }: Props) {
  const { theme } = useAppTheme();
  const open = useCallback(() => onOpen(item.id), [item.id, onOpen]);
  return <Pressable
    accessibilityRole="button"
    accessibilityLabel={`${openPrefix} ${item.name ?? ''}`.trim()}
    onPress={open}
    style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
  >
    <View style={styles.identity}>
      <AudienceAvatar seed={item.id} initial={item.initial} />
      <View style={styles.identityCopy}>
        {item.name ? <Text numberOfLines={1} style={[styles.name, { color: theme.colors.text }]}>{item.name}</Text> : null}
        {item.metaLine ? <Text numberOfLines={1} style={[styles.meta, { color: theme.colors.muted }]}>{item.metaLine}</Text> : null}
      </View>
    </View>
    <Text style={[styles.question, { color: theme.colors.text }]}>{item.question}</Text>
    <Text numberOfLines={2} style={[styles.article, { color: theme.colors.muted }]}>{item.articleLine}</Text>
    <View style={styles.replyRow}>
      <Text style={[styles.replyLabel, { color: theme.colors.textInteractive }]}>{replyLabel}</Text>
      <ModontyIcon name="arrow-left" size={control.iconSize} primary={theme.colors.muted} accent={theme.colors.accent} />
    </View>
  </Pressable>;
});

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radii.card, padding: spacing.md, marginBottom: spacing.sm },
  identity: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm },
  identityCopy: { flex: 1, minWidth: 0, alignItems: 'flex-end' },
  name: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right', writingDirection: 'rtl' },
  meta: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.xxs },
  question: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.md },
  article: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.xs },
  replyRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', minHeight: control.minTouchTarget, marginTop: spacing.xs },
  replyLabel: { fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, writingDirection: 'rtl' },
});
