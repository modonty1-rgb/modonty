import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import type { NotificationSummary } from '@/src/services/engagement-api';
import { control, fonts, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/**
 * One notification on S12.
 *
 * Unread is carried twice — an accent border AND the word «جديد» — so the distinction
 * survives a colour-blind reader and a dimmed screen in daylight.
 *
 * A row whose `target` is null is not pressable: the app has no screen for that type yet,
 * and a tap that goes nowhere is worse than none.
 */

type Props = { item: NotificationSummary; openPrefix: string; onOpen: (item: NotificationSummary) => void };

export const NotificationCard = memo(function NotificationCard({ item, openPrefix, onOpen }: Props) {
  const { theme } = useAppTheme();
  const open = useCallback(() => onOpen(item), [item, onOpen]);
  const body = <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: item.isUnread ? theme.colors.textInteractive : theme.colors.border }]}>
    <Text style={[styles.title, { color: theme.colors.text }]}>{item.title}</Text>
    {item.body ? <Text numberOfLines={2} style={[styles.body, { color: theme.colors.muted }]}>{item.body}</Text> : null}
    <View style={styles.footer}>
      <Text style={[styles.state, { color: item.isUnread ? theme.colors.textInteractive : theme.colors.muted }]}>{item.stateLabel}</Text>
      <Text style={[styles.time, { color: theme.colors.muted }]}>{item.timeLabel}</Text>
    </View>
  </View>;
  return item.target === null ? body
    : <Pressable accessibilityRole="button" accessibilityLabel={`${openPrefix} ${item.title}`} onPress={open}>{body}</Pressable>;
});

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radii.card, padding: spacing.md, marginBottom: spacing.sm, minHeight: control.minTouchTarget, alignItems: 'flex-end' },
  title: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right', writingDirection: 'rtl' },
  body: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.xxs },
  footer: { alignSelf: 'stretch', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs },
  state: { fontFamily: fonts.medium, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, writingDirection: 'rtl' },
  time: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, writingDirection: 'rtl' },
});
