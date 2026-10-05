import { memo, useCallback, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ltrLine } from '@/src/components/ui/bidi';
import { PillButton, StatusBadge, TonalCard, type BadgeTone } from '@/src/components/ui/Nabd';
import { bookingContactCopy, type BookingRequestItem, type BookingStatusTone } from '@/src/services/bookings-api';
import { fonts, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

const badgeTone: Record<BookingStatusTone, BadgeTone> = { pending: 'warning', done: 'positive', neutral: 'neutral' };

/** واتساب يريد الرقم أرقاماً فقط بصيغته الدولية: `wa.me/9665…` — بلا «+» ولا «00» ولا مسافات. */
function whatsappUrlOf(phone: string): string | null {
  const digits = phone.replace(/\D/g, '').replace(/^00/, '');
  return digits.length >= 8 ? `https://wa.me/${digits}` : null;
}

/**
 * بطاقة طلب تواصل — «نبض»: الاسم وشارة الحالة · ما قاله · ثم وسائل الوصول كبسولات (الجوال
 * والواتساب نغميّتان، والبريد شبحية) · ثم من أين جاء ومتى.
 *
 * كل وسيلة رابطٌ يفتح تطبيقه مباشرةً (`tel:` · `wa.me` · `mailto:`) — أقلّ فعل يحتاجه العميل
 * ليردّ، لا شاشة جديدة. إدارة حالة الطلب تبقى في الكونسول.
 */
export const BookingCard = memo(function BookingCard({ booking }: { booking: BookingRequestItem }) {
  const { theme } = useAppTheme();
  const [openFailed, setOpenFailed] = useState(false);
  const whatsappUrl = booking.phone ? whatsappUrlOf(booking.phone) : null;

  const open = useCallback((url: string) => {
    setOpenFailed(false);
    Linking.openURL(url).catch((reason: unknown) => {
      console.warn('[BookingCard] openURL failed', url, reason);
      setOpenFailed(true);
    });
  }, []);
  const call = useCallback(() => { if (booking.phone) open(`tel:${booking.phone.replace(/[^\d+]/g, '')}`); }, [booking.phone, open]);
  const email = useCallback(() => { if (booking.email) open(`mailto:${booking.email}`); }, [booking.email, open]);
  const whatsapp = useCallback(() => { if (whatsappUrl) open(whatsappUrl); }, [open, whatsappUrl]);

  return <TonalCard style={styles.card}>
    <View style={styles.head}>
      <Text numberOfLines={1} style={[styles.name, { color: theme.colors.text }]}>{booking.name}</Text>
      <StatusBadge label={booking.statusLabel} tone={badgeTone[booking.statusTone]} />
    </View>
    {booking.message ? <Text style={[styles.message, { color: theme.colors.text }]}>{booking.message}</Text> : null}
    {booking.phone || booking.email ? <View style={styles.contacts}>
      {booking.phone ? <PillButton label={ltrLine(booking.phone)} icon="phone" tone="secondary" size="medium" onPress={call} accessibilityLabel={`${bookingContactCopy.callPrefix} ${booking.phone}`} /> : null}
      {whatsappUrl && booking.phone ? <PillButton label={bookingContactCopy.whatsappLabel} icon="whatsapp" tone="secondary" size="medium" onPress={whatsapp} accessibilityLabel={`${bookingContactCopy.whatsappPrefix} ${booking.phone}`} /> : null}
      {booking.email ? <PillButton label={ltrLine(booking.email)} icon="email" tone="ghost" size="medium" onPress={email} accessibilityLabel={`${bookingContactCopy.emailPrefix} ${booking.email}`} /> : null}
    </View> : null}
    {booking.metaLabel ? <Text numberOfLines={1} style={[styles.secondary, { color: theme.colors.muted }]}>{booking.metaLabel}</Text> : null}
    {openFailed ? <Text accessibilityLiveRegion="polite" style={[styles.secondary, { color: theme.colors.errorText }]}>{bookingContactCopy.openFailed}</Text> : null}
  </TonalCard>;
});

const styles = StyleSheet.create({
  card: { gap: spacing.xs, marginBottom: spacing.sm },
  head: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.xs, justifyContent: 'space-between' },
  name: { flex: 1, fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right', writingDirection: 'rtl' },
  message: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl' },
  contacts: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: spacing.xs },
  secondary: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl' },
});
