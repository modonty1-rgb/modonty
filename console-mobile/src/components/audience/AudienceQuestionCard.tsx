import { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { rtlLine } from '@/src/components/ui/bidi';
import { AudienceAvatar } from '@/src/components/audience/AudienceAvatar';
import { PillButton, StatusBadge, TonalCard } from '@/src/components/ui/Nabd';
import type { AudienceQuestionSummary } from '@/src/services/engagement-api';
import { fonts, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type Props = { item: AudienceQuestionSummary; replyLabel: string; openPrefix: string; badgeLabel?: string; onOpen: (questionId: string) => void };

/**
 * سؤال قارئ على S08 — «نبض»: بطاقة نغمية · هويّة السائل (دائرة + اسم + بريد/وقت) وشارة «ينتظر ردك»
 * · السؤال · المقال · ثم زرّ «الرد على السؤال» كبسولة ثانوية في بداية السطر.
 *
 * الزرّ هو الفعل الوحيد — البطاقة لا تُضغط كلّها، فلا وعدان لفعل واحد. و`onOpen(id)` مستقرّة
 * فتأخذ كل الصفوف الدالّة نفسها بدل إغلاق جديد لكل صفّ.
 */
export const AudienceQuestionCard = memo(function AudienceQuestionCard({ item, replyLabel, openPrefix, badgeLabel, onOpen }: Props) {
  const { theme } = useAppTheme();
  const open = useCallback(() => onOpen(item.id), [item.id, onOpen]);
  return <TonalCard style={styles.card}>
    <View style={styles.identity}>
      <AudienceAvatar initial={item.initial} />
      <View style={styles.identityCopy}>
        {item.name ? <Text numberOfLines={1} style={[styles.name, { color: theme.colors.text }]}>{item.name}</Text> : null}
        {item.metaLine ? <Text numberOfLines={1} style={[styles.secondary, { color: theme.colors.muted }]}>{rtlLine(item.metaLine)}</Text> : null}
      </View>
      {badgeLabel ? <StatusBadge label={badgeLabel} tone="warning" /> : null}
    </View>
    <Text style={[styles.question, { color: theme.colors.text }]}>{item.question}</Text>
    <Text numberOfLines={1} style={[styles.secondary, { color: theme.colors.muted }]}>{item.articleLine}</Text>
    <PillButton label={replyLabel} icon="comment" tone="secondary" size="medium" onPress={open} accessibilityLabel={`${openPrefix} ${item.name ?? ''}`.trim()} style={styles.reply} />
  </TonalCard>;
});

const styles = StyleSheet.create({
  card: { gap: spacing.xs, marginBottom: spacing.sm },
  identity: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.sm },
  identityCopy: { flex: 1, minWidth: 0 },
  name: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'right', writingDirection: 'rtl' },
  secondary: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl' },
  question: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right', writingDirection: 'rtl' },
  reply: { alignSelf: 'flex-end', marginTop: spacing.xxs },
});
