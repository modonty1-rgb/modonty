import { FlashList } from '@shopify/flash-list';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookingCard } from '@/src/components/bookings/BookingCard';
import { EmptyState, ErrorState, ListScreenSkeleton, OfflineState } from '@/src/components/ui/MobileUI';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { bookingFallbackText, getBookings, networkCopy, type BookingRequestItem, type BookingsScreen } from '@/src/services/bookings-api';
import { MobileOfflineError } from '@/src/services/mobile-api';
import { darkColors, fonts, lightColors, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type Props = { accessToken: string; onBack: () => void };

const keyOf = (booking: BookingRequestItem) => booking.id;

export function BookingsRoute({ accessToken, onBack }: Props) {
  const { mode, theme } = useAppTheme();
  const styles = mode === 'dark' ? darkStyles : lightStyles;
  const insets = useSafeAreaInsets();
  const [screen, setScreen] = useState<BookingsScreen | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setOffline] = useState(false);
  const [isRefreshing, setRefreshing] = useState(false);

  const fetchBookings = useCallback((isPullToRefresh: boolean) => {
    setError(null); setOffline(false);
    if (isPullToRefresh) setRefreshing(true); else setScreen(null);
    void getBookings(accessToken)
      .then(setScreen)
      .catch((reason: unknown) => {
        setOffline(reason instanceof MobileOfflineError);
        setError(reason instanceof Error ? reason.message : bookingFallbackText.loadFailed);
      })
      .finally(() => setRefreshing(false));
  }, [accessToken]);
  const load = useCallback(() => fetchBookings(false), [fetchBookings]);
  const refresh = useCallback(() => fetchBookings(true), [fetchBookings]);
  useEffect(load, [load]);

  const listContentStyle = useMemo(() => [styles.list, { paddingBottom: spacing.xxl + insets.bottom }], [insets.bottom, styles.list]);
  const refreshControl = useMemo(() => <RefreshControl refreshing={isRefreshing} onRefresh={refresh} colors={[theme.colors.textInteractive]} progressBackgroundColor={theme.colors.surfaceRaised} tintColor={theme.colors.textInteractive} />, [isRefreshing, refresh, theme.colors.surfaceRaised, theme.colors.textInteractive]);

  const renderBooking = useCallback(({ item }: { item: BookingRequestItem }) => <BookingCard booking={item} />, []);

  const listHeader = useMemo(() => screen === null ? null : <View style={styles.header}>
    <Text style={styles.subtitle}>{screen.subtitle}</Text>
    {/* قسم واتساب بلا زرّ: العميل لا يملك ما يفعله به، والنصّ يشرح لماذا بدل أن يترك سؤالاً. */}
    {screen.whatsapp ? <View style={styles.whatsappCard}>
      <View style={styles.whatsappHead}>
        <View style={styles.countBadge}><Text maxFontSizeMultiplier={1} style={styles.countBadgeText}>{screen.whatsapp.countLabel}</Text></View>
        <Text style={styles.whatsappTitle}>{screen.whatsapp.title}</Text>
      </View>
      <Text style={styles.whatsappBody}>{screen.whatsapp.description}</Text>
    </View> : null}
  </View>, [screen, styles]);

  if (isOffline) return <View style={styles.screen}>
    <ScreenHeader title={screen?.screenTitle ?? null} backLabel={networkCopy.retryLabel} onBack={onBack} />
    <ScrollView contentContainerStyle={styles.state}><OfflineState title={networkCopy.offlineTitle} description={networkCopy.offlineDescription} retryLabel={networkCopy.retryLabel} onRetry={load} /></ScrollView>
  </View>;

  if (error !== null && screen === null) return <View style={styles.screen}>
    <ScreenHeader title={null} backLabel={networkCopy.retryLabel} onBack={onBack} />
    <ScrollView contentContainerStyle={styles.state}><ErrorState message={error} retryLabel={networkCopy.retryLabel} onRetry={load} /></ScrollView>
  </View>;

  if (screen === null) return <View style={styles.screen}>
    <ScreenHeader title={null} backLabel={networkCopy.retryLabel} onBack={onBack} />
    <View style={styles.state}><ListScreenSkeleton count={3} withSubtitle /></View>
  </View>;

  return <View style={styles.screen}>
    <ScreenHeader title={screen.screenTitle} backLabel={screen.backLabel} onBack={onBack} />
    {error !== null ? <Text style={styles.inlineError}>{error}</Text> : null}
    <FlashList
      data={screen.requests}
      renderItem={renderBooking}
      keyExtractor={keyOf}
      contentContainerStyle={listContentStyle}
      refreshControl={refreshControl}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={<EmptyState icon="comment" title={screen.emptyTitle} copy={screen.emptyDescription} />}
    />
  </View>;
}

const shared = {
  screen: { flex: 1 },
  state: { flexGrow: 1, paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.md },
  list: { paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.md },
  header: { gap: spacing.md, marginBottom: spacing.md },
  subtitle: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  whatsappCard: { borderRadius: radii.card, borderWidth: StyleSheet.hairlineWidth, gap: spacing.xs, padding: spacing.md },
  whatsappHead: { alignItems: 'center' as const, flexDirection: 'row-reverse' as const, gap: spacing.xs },
  whatsappTitle: { flex: 1, fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  countBadge: { borderRadius: radii.field, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: spacing.xs, paddingVertical: spacing.xxs },
  countBadgeText: { fontFamily: fonts.medium, fontSize: typography.tabLabel, lineHeight: typography.lineHeightTabLabel, writingDirection: 'rtl' as const },
  whatsappBody: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  inlineError: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, marginBottom: spacing.sm, paddingHorizontal: spacing.screenHorizontal, textAlign: 'right' as const, writingDirection: 'rtl' as const },
};

function stylesFor(palette: typeof darkColors) {
  return StyleSheet.create({
    ...shared,
    subtitle: { ...shared.subtitle, color: palette.muted },
    whatsappCard: { ...shared.whatsappCard, backgroundColor: palette.surface, borderColor: palette.border },
    whatsappTitle: { ...shared.whatsappTitle, color: palette.text },
    countBadge: { ...shared.countBadge, borderColor: palette.muted },
    countBadgeText: { ...shared.countBadgeText, color: palette.muted },
    whatsappBody: { ...shared.whatsappBody, color: palette.muted },
    inlineError: { ...shared.inlineError, color: palette.errorText },
  });
}

const darkStyles = stylesFor(darkColors);
const lightStyles = stylesFor(lightColors);
