import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import type { BookingRequestItem } from '@/src/services/bookings-api';
import { darkColors, fonts, lightColors, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

const badgeStyle = { pending: 'pendingBadge', done: 'doneBadge', neutral: 'neutralBadge' } as const;
const badgeTextStyle = { pending: 'pendingBadgeText', done: 'doneBadgeText', neutral: 'neutralBadgeText' } as const;

/**
 * بطاقة طلب تواصل — **عرضٌ محض، صفر أفعال** (قرار خالد ٢٩ أغسطس).
 *
 * تحمل ما يحتاجه العميل ليعرف: من طلب · رقمه · ماذا قال · من أين جاء · متى · وأين وصل
 * الطلب في الكونسول. لا زرّ فيها إطلاقاً: إدارة الحالة في الكونسول، والاتصال من دفتر
 * هاتفه. ولذلك هي `View` لا `Pressable` — لا تُعلن نفسها زرّاً لقارئ الشاشة ولا تعد بضغطة.
 *
 * والرقم قابل للتحديد والنسخ (`selectable`) — فبلا زرّ اتصال، النسخ هو طريقه إليه.
 */
export const BookingCard = memo(function BookingCard({ booking }: { booking: BookingRequestItem }) {
  const { mode } = useAppTheme();
  const styles = mode === 'dark' ? darkStyles : lightStyles;

  return <View style={styles.card}>
    <View style={styles.head}>
      <View style={styles[badgeStyle[booking.statusTone]]}><Text maxFontSizeMultiplier={1} style={styles[badgeTextStyle[booking.statusTone]]}>{booking.statusLabel}</Text></View>
      <Text numberOfLines={1} style={styles.name}>{booking.name}</Text>
    </View>
    {booking.phone ? <Text selectable style={styles.phone}>{booking.phone}</Text> : null}
    {booking.message ? <Text style={styles.message}>{booking.message}</Text> : null}
    <Text numberOfLines={1} style={styles.meta}>{booking.metaLabel}</Text>
  </View>;
});

const shared = {
  card: { borderRadius: radii.card, borderWidth: StyleSheet.hairlineWidth, gap: spacing.xs, marginBottom: spacing.sm, padding: spacing.md },
  head: { alignItems: 'flex-end' as const, gap: spacing.xs },
  name: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right' as const, width: '100%' as const, writingDirection: 'rtl' as const },
  badge: { borderRadius: radii.field, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: spacing.xs, paddingVertical: spacing.xxs },
  badgeText: { fontFamily: fonts.medium, fontSize: typography.tabLabel, lineHeight: typography.lineHeightTabLabel, writingDirection: 'rtl' as const },
  // الرقم يُقرأ يساراً كأي رقم هاتف، ولو كانت الشاشة عربية.
  phone: { fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right' as const, writingDirection: 'ltr' as const },
  message: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  meta: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right' as const, writingDirection: 'rtl' as const },
};

function stylesFor(palette: typeof darkColors) {
  return StyleSheet.create({
    ...shared,
    card: { ...shared.card, backgroundColor: palette.surfaceRaised, borderColor: palette.border },
    name: { ...shared.name, color: palette.text },
    pendingBadge: { ...shared.badge, borderColor: palette.warning },
    pendingBadgeText: { ...shared.badgeText, color: palette.warning },
    doneBadge: { ...shared.badge, borderColor: palette.textInteractive },
    doneBadgeText: { ...shared.badgeText, color: palette.textInteractive },
    neutralBadge: { ...shared.badge, borderColor: palette.muted },
    neutralBadgeText: { ...shared.badgeText, color: palette.muted },
    // الرقم نصّ لا رابط — لكنه يبقى أبرز سطر في البطاقة لأنه ما يبحث عنه العميل.
    phone: { ...shared.phone, color: palette.text },
    message: { ...shared.message, color: palette.text },
    meta: { ...shared.meta, color: palette.muted },
  });
}

const darkStyles = stylesFor(darkColors);
const lightStyles = stylesFor(lightColors);
