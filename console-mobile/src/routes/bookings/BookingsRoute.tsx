import { FlashList } from '@shopify/flash-list';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookingCard } from '@/src/components/bookings/BookingCard';
import { EmptyState, ErrorState, ListScreenSkeleton, OfflineState, RefreshNotice } from '@/src/components/ui/MobileUI';
import { EnterView, TonalCard } from '@/src/components/ui/Nabd';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { bookingFallbackText, getBookings, networkCopy, type BookingRequestItem, type BookingsScreen, advanceBooking } from '@/src/services/bookings-api';
import { emitLiveRefresh } from '@/src/services/live-refresh';
import { MobileOfflineError } from '@/src/services/mobile-api';
import { darkColors, fonts, lightColors, nabd, spacing, typography } from '@/src/theme/tokens';
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

  // الخطوة تُحفظ ثم القائمة تُعاد بصمت (الطلب «خلص» ينزل لآخرها)، والرئيسية تُحدَّث عدّادها.
  const onAdvance = useCallback(async (booking: BookingRequestItem): Promise<string | null> => {
    if (!booking.nextStatus) return null;
    try {
      await advanceBooking(accessToken, booking.id, booking.nextStatus.key);
    } catch (reason) {
      return reason instanceof Error && reason.message ? reason.message : bookingFallbackText.loadFailed;
    }
    refresh();
    emitLiveRefresh();
    return null;
  }, [accessToken, refresh]);
  const renderBooking = useCallback(({ item }: { item: BookingRequestItem }) => <BookingCard booking={item} onAdvance={onAdvance} />, [onAdvance]);

  /**
   * «نبض» (S15): بلاطتا أرقام — المفتوح على سطح البطاقة، وواتساب تركوازية — ثم سطر واتساب
   * الذي يشرح لماذا لا قائمة لهم (لا نحفظ أرقامهم). الخادم الأقدم بلا `stats` يرجع لبطاقة واتساب.
   */
  const stats = screen?.stats ?? [];
  const listHeader = useMemo(() => screen === null ? null : <View style={styles.header}>
    {stats.length > 0 ? <EnterView index={0} style={styles.tiles}>
      {stats.map((stat) => <TonalCard key={stat.key} tone={stat.key === 'whatsapp' ? 'tertiary' : 'surface'} style={styles.tile}>
        <Text maxFontSizeMultiplier={1} style={[styles.tileNumeral, stat.key === 'whatsapp' ? styles.onTertiary : null]}>{stat.value}</Text>
        <Text style={[styles.subtitle, stat.key === 'whatsapp' ? styles.onTertiary : null]}>{stat.label}</Text>
      </TonalCard>)}
    </EnterView> : <Text style={styles.subtitle}>{screen.subtitle}</Text>}
    {screen.whatsapp ? <EnterView index={1}>
      {stats.length > 0
        ? <Text style={styles.subtitle}>{screen.whatsapp.description}</Text>
        : <TonalCard tone="tertiary" style={styles.whatsappCard}>
          <Text style={[styles.whatsappTitle, styles.onTertiary]}>{`${screen.whatsapp.title} · ${screen.whatsapp.countLabel}`}</Text>
          <Text style={[styles.subtitle, styles.onTertiary]}>{screen.whatsapp.description}</Text>
        </TonalCard>}
    </EnterView> : null}
  </View>, [screen, stats, styles]);

  // زرّ الرجوع اسمه «رجوع» في كل الحالات — كان يُعلَن لقارئ الشاشة «حاول مرة ثانية».
  if (isOffline && screen === null) return <View style={styles.screen}>
    <ScreenHeader padded title={null} backLabel={networkCopy.backLabel} onBack={onBack} />
    <ScrollView contentContainerStyle={styles.state}><OfflineState title={networkCopy.offlineTitle} description={networkCopy.offlineDescription} retryLabel={networkCopy.retryLabel} onRetry={load} /></ScrollView>
  </View>;

  if (error !== null && screen === null) return <View style={styles.screen}>
    <ScreenHeader padded title={null} backLabel={networkCopy.backLabel} onBack={onBack} />
    <ScrollView contentContainerStyle={styles.state}><ErrorState message={error} retryLabel={networkCopy.retryLabel} onRetry={load} /></ScrollView>
  </View>;

  if (screen === null) return <View style={styles.screen}>
    <ScreenHeader padded title={null} backLabel={networkCopy.backLabel} onBack={onBack} />
    <View style={styles.state}><ListScreenSkeleton count={3} withSubtitle /></View>
  </View>;

  return <View style={styles.screen}>
    <ScreenHeader padded title={screen.screenTitle} backLabel={screen.backLabel} onBack={onBack} />
    {error !== null ? <View style={styles.noticeSlot}><RefreshNotice message={error} offline={isOffline} retryLabel={networkCopy.retryLabel} onRetry={refresh} /></View> : null}
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
  list: { paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.xxs },
  header: { gap: spacing.sm, marginBottom: spacing.sm },
  subtitle: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  tiles: { flexDirection: 'row-reverse' as const, gap: spacing.sm },
  tile: { borderRadius: nabd.tileRadius, flex: 1, gap: spacing.xxs, minHeight: 88, padding: spacing.md },
  tileNumeral: { fontFamily: fonts.medium, fontSize: typography.tileNumeral, lineHeight: typography.lineHeightTileNumeral, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  whatsappCard: { gap: spacing.xxs },
  whatsappTitle: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  onTertiary: {},
  noticeSlot: { paddingHorizontal: spacing.screenHorizontal },
};

function stylesFor(palette: typeof darkColors) {
  return StyleSheet.create({
    ...shared,
    subtitle: { ...shared.subtitle, color: palette.muted },
    tileNumeral: { ...shared.tileNumeral, color: palette.text },
    onTertiary: { color: palette.onTertiary },
  });
}

const darkStyles = stylesFor(darkColors);
const lightStyles = stylesFor(lightColors);
