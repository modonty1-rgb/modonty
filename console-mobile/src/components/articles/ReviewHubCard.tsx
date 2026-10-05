import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ModontyIcon, type ModontyIconName } from '@/src/components/brand/icons/ModontyIcon';
import { IconShape, StatusBadge, TonalCard, type BadgeTone } from '@/src/components/ui/Nabd';
import { control, fonts, spacing, typography } from '@/src/theme/tokens';
import type { ReviewBadgeTone } from '@/src/services/articles-api';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type ReviewHubCardProps = {
  title: string;
  icon: ModontyIconName;
  badgeLabel: string;
  badgeTone: ReviewBadgeTone;
  description: string | null;
  statusLabel: string | null;
  actionLabel: string;
  onPress: () => void;
};

/** برتقاليّ = يحتاج قرارك · تركوازيّ = خلصت · محايد = عدد للعلم. نصّ + رمز + لون لكل معنى. */
const toneOf: Record<ReviewBadgeTone, BadgeTone> = { pending: 'warning', done: 'positive', neutral: 'neutral' };

/**
 * قسمٌ من لوحة «مراجعة المقال» — «نبض»: بطاقة نغمية تُضغط كلّها، رمز دائري، عنوان القسم وشارته،
 * سطرٌ يصف ما فيه، ثم الفعل بلون التفاعل. القرار نفسه **ليس هنا** (قرار خالد، ٢٩ أغسطس): كل قسم
 * يفتح شاشته، والاعتماد يجلس تحت نصّ المقال بعد قراءته.
 */
export const ReviewHubCard = memo(function ReviewHubCard({ title, icon, badgeLabel, badgeTone, description, statusLabel, actionLabel, onPress }: ReviewHubCardProps) {
  const { theme } = useAppTheme();
  return <TonalCard onPress={onPress} accessibilityLabel={`${title} — ${actionLabel}`} style={styles.card}>
    <View style={styles.head}>
      <IconShape icon={icon} />
      <Text numberOfLines={2} style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <StatusBadge label={badgeLabel} tone={toneOf[badgeTone]} />
    </View>
    {description ? <Text numberOfLines={2} style={[styles.description, { color: theme.colors.muted }]}>{description}</Text> : null}
    {statusLabel ? <Text style={[styles.description, { color: theme.colors.muted }]}>{statusLabel}</Text> : null}
    <View style={styles.action}>
      <Text style={[styles.actionText, { color: theme.colors.textInteractive }]}>{actionLabel}</Text>
      <ModontyIcon name="arrow-left" size={control.iconSizeSmall} primary={theme.colors.textInteractive} accent={theme.colors.accent} />
    </View>
  </TonalCard>;
});

const styles = StyleSheet.create({
  card: { gap: spacing.xs, marginBottom: spacing.sm },
  head: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.sm },
  title: { flex: 1, fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right', writingDirection: 'rtl' },
  description: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl' },
  action: { alignItems: 'center', alignSelf: 'flex-end', flexDirection: 'row-reverse', gap: spacing.xxs, minHeight: control.minTouchTarget - spacing.xs },
  actionText: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, writingDirection: 'rtl' },
});
