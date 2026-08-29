import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { control, darkColors, fonts, lightColors, radii, spacing, typography } from '@/src/theme/tokens';
import type { ReviewBadgeTone } from '@/src/services/articles-api';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type ReviewHubCardProps = {
  title: string;
  badgeLabel: string;
  badgeTone: ReviewBadgeTone;
  description: string | null;
  statusLabel: string | null;
  actionLabel: string;
  onPress: () => void;
};

/** برتقاليّ = يحتاج قرارك · تركوازيّ = خلصت · رماديّ = عدد للعلم. لون واحد لكل معنى. */
const badgeStyle = { pending: 'pendingBadge', done: 'doneBadge', neutral: 'neutralBadge' } as const;
const badgeTextStyle = { pending: 'pendingBadgeText', done: 'doneBadgeText', neutral: 'neutralBadgeText' } as const;

export const ReviewHubCard = memo(function ReviewHubCard({ title, badgeLabel, badgeTone, description, statusLabel, actionLabel, onPress }: ReviewHubCardProps) {
  const { mode } = useAppTheme();
  const styles = mode === 'dark' ? darkStyles : lightStyles;
  const accent = mode === 'dark' ? darkColors.accent : lightColors.accent;
  return <Pressable accessibilityRole="button" accessibilityLabel={`${title} — ${actionLabel}`} onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
    <View style={styles.head}>
      <View style={styles[badgeStyle[badgeTone]]}><Text maxFontSizeMultiplier={1} style={styles[badgeTextStyle[badgeTone]]}>{badgeLabel}</Text></View>
      <Text numberOfLines={3} style={styles.title}>{title}</Text>
    </View>
    {description ? <Text numberOfLines={2} style={styles.description}>{description}</Text> : null}
    {statusLabel ? <Text style={styles.description}>{statusLabel}</Text> : null}
    <View style={styles.action}>
      <Text style={styles.actionText}>{actionLabel}</Text>
      <ModontyIcon name="arrow-left" size={control.iconSize} primary={styles.actionText.color as string} accent={accent} />
    </View>
  </Pressable>;
});

const shared = {
  pressed: { opacity: 0.72 },
  card: { borderRadius: radii.card, borderWidth: StyleSheet.hairlineWidth, marginBottom: spacing.sm, padding: spacing.md },
  /**
   * الشارة فوق العنوان لا بجانبه.
   *
   * كانت في صفّ واحد معه بفجوة ٢٠dp، فتأكل ≈٨٠dp من عرض العنوان — وعنوان المقال الحقيقي
   * كان يُقصّ عند «…التجميل في …» رغم سطرين. والعنوان هو الشيء الوحيد الذي يميّز مقالاً
   * عن مقال، فلا يزاحمه شيء. الشارة سطرٌ صغير فوقه، والعنوان يأخذ العرض كاملاً.
   */
  head: { alignItems: 'flex-end' as const, gap: spacing.xs },
  title: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right' as const, width: '100%' as const, writingDirection: 'rtl' as const },
  badge: { borderRadius: radii.field, paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs },
  badgeText: { fontFamily: fonts.medium, fontSize: typography.tabLabel, lineHeight: typography.lineHeightTabLabel, writingDirection: 'rtl' as const },
  description: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, marginTop: spacing.xs, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  action: { alignItems: 'center' as const, flexDirection: 'row-reverse' as const, justifyContent: 'space-between' as const, marginTop: spacing.xs, minHeight: control.minTouchTarget },
  actionText: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, writingDirection: 'rtl' as const },
};

function stylesFor(palette: typeof darkColors) {
  return StyleSheet.create({
    ...shared,
    card: { ...shared.card, backgroundColor: palette.surface, borderColor: palette.border },
    title: { ...shared.title, color: palette.text },
    pendingBadge: { ...shared.badge, backgroundColor: palette.surfaceRaised, borderColor: palette.warning, borderWidth: StyleSheet.hairlineWidth },
    pendingBadgeText: { ...shared.badgeText, color: palette.warning },
    doneBadge: { ...shared.badge, backgroundColor: palette.surfaceRaised, borderColor: palette.textInteractive, borderWidth: StyleSheet.hairlineWidth },
    doneBadgeText: { ...shared.badgeText, color: palette.textInteractive },
    neutralBadge: { ...shared.badge, backgroundColor: palette.surfaceRaised, borderColor: palette.muted, borderWidth: StyleSheet.hairlineWidth },
    neutralBadgeText: { ...shared.badgeText, color: palette.muted },
    description: { ...shared.description, color: palette.muted },
    actionText: { ...shared.actionText, color: palette.textInteractive },
  });
}

const darkStyles = stylesFor(darkColors);
const lightStyles = stylesFor(lightColors);
