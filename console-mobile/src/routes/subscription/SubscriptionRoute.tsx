import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { EmptyState, ErrorState, OfflineState, SkeletonBar } from '@/src/components/ui/MobileUI';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { getSubscriptionScreen, networkCopy, type SubscriptionDetailRow, type SubscriptionScreen } from '@/src/services/account-api';
import { MobileOfflineError } from '@/src/services/mobile-api';
import { control, fonts, radii, skeleton, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type SubscriptionRouteProps = { accessToken: string | null; onBack: () => void; onSupport: () => void };

export function SubscriptionRoute({ accessToken, onBack, onSupport }: SubscriptionRouteProps) {
  const { theme } = useAppTheme();
  const [screen, setScreen] = useState<SubscriptionScreen | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setOffline] = useState(false);

  const load = useCallback(() => {
    if (!accessToken) return;
    setError(null);
    setOffline(false);
    setScreen(null);
    void getSubscriptionScreen(accessToken)
      .then(setScreen)
      .catch((reason: unknown) => {
        if (reason instanceof MobileOfflineError) {
          setOffline(true);
          return;
        }
        setError(reason instanceof Error && reason.message ? reason.message : networkCopy.loadFailed);
      });
  }, [accessToken]);

  useEffect(load, [load]);

  const subscription = screen?.subscription ?? null;
  const statusColor = subscription?.statusTone === 'positive' ? theme.colors.textInteractive
    : subscription?.statusTone === 'danger' ? theme.colors.errorText
      : theme.colors.warning;

  const body = isOffline
    ? <OfflineState title={networkCopy.offlineTitle} description={networkCopy.offlineDescription} retryLabel={networkCopy.retryLabel} onRetry={load} />
    : error !== null
      ? <ErrorState message={error} retryLabel={networkCopy.retryLabel} onRetry={load} />
      : screen === null
        ? <View style={styles.skeletonStack}>
          <SkeletonBar height={skeleton.blockHeight} radius={radii.card} />
          <SkeletonBar height={skeleton.blockHeight} radius={radii.card} />
          <SkeletonBar height={skeleton.blockHeight} radius={radii.card} />
        </View>
        : screen.empty !== null
          ? <EmptyState icon="info" title={screen.empty.title} copy={screen.empty.description} actionLabel={screen.empty.actionLabel} onAction={onSupport} />
          : subscription === null
            ? null
            : <>
              <View style={[styles.hero, { backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.border }]}>
                <View style={[styles.statusPill, { borderColor: statusColor }]}>
                  <Text maxFontSizeMultiplier={1} style={[styles.statusText, { color: statusColor }]}>{subscription.statusLabel}</Text>
                </View>
                {subscription.daysRemainingLabel ? <Text maxFontSizeMultiplier={1} style={[styles.daysRemaining, { color: theme.colors.text }]}>{subscription.daysRemainingLabel}</Text> : null}
              </View>

              {subscription.planPayment ? <View style={styles.section}>
                <Text maxFontSizeMultiplier={1} style={[styles.sectionTitle, { color: theme.colors.text }]}>{subscription.planPayment.title}</Text>
                <DetailCard rows={subscription.planPayment.rows} />
              </View> : null}

              {subscription.usage ? <View style={styles.section}>
                <Text maxFontSizeMultiplier={1} style={[styles.sectionTitle, { color: theme.colors.text }]}>{subscription.usage.title}</Text>
                <View style={[styles.usageCard, { backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.border }]}>
                  <View style={styles.usageRow}>
                    <Text maxFontSizeMultiplier={1} style={[styles.usageValue, { color: theme.colors.textInteractive }]}>{subscription.usage.valueLabel}</Text>
                    <Text maxFontSizeMultiplier={1} style={[styles.usageLabel, { color: theme.colors.text }]}>{subscription.usage.remainingLabel}</Text>
                  </View>
                  <View
                    accessibilityRole="progressbar"
                    accessibilityLabel={subscription.usage.remainingLabel}
                    accessibilityValue={{ now: subscription.usage.remainingPercent, min: 0, max: 100 }}
                    style={[styles.progressTrack, { backgroundColor: theme.colors.inputSurface, borderColor: theme.colors.inputBorder }]}
                  >
                    <View style={[styles.progressValue, { backgroundColor: theme.colors.brandFill, width: `${subscription.usage.remainingPercent}%` }]} />
                  </View>
                  <Text maxFontSizeMultiplier={1} style={[styles.usageNote, { color: theme.colors.muted }]}>{subscription.usage.note}</Text>
                </View>
              </View> : null}

              {subscription.period ? <View style={styles.section}>
                <Text maxFontSizeMultiplier={1} style={[styles.sectionTitle, { color: theme.colors.text }]}>{subscription.period.title}</Text>
                <DetailCard rows={subscription.period.rows} />
              </View> : null}
            </>;

  return <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <ScreenHeader title={screen?.screenTitle ?? null} backLabel={screen?.backLabel ?? networkCopy.backLabel} onBack={onBack} />
    {body}
  </ScrollView>;
}

function DetailCard({ rows }: { rows: SubscriptionDetailRow[] }) {
  const { theme } = useAppTheme();
  return <View style={[styles.detailCard, { backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.border }]}>
    {rows.map((row, index) => <View key={row.label} style={[styles.detailRow, index > 0 && { borderTopColor: theme.colors.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
      <Text maxFontSizeMultiplier={1} style={[styles.detailValue, { color: theme.colors.text }]}>{row.value}</Text>
      <Text maxFontSizeMultiplier={1} style={[styles.detailLabel, { color: theme.colors.muted }]}>{row.label}</Text>
    </View>)}
  </View>;
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.72 },
  content: { paddingBottom: spacing.screenBottom, paddingHorizontal: spacing.screenHorizontal },
  skeletonStack: { gap: spacing.sm },
  hero: { alignItems: 'flex-end', borderRadius: radii.card, borderWidth: StyleSheet.hairlineWidth, padding: spacing.md },
  statusPill: { borderWidth: control.inputBorderWidth, alignItems: 'center', borderRadius: radii.button, justifyContent: 'center', minHeight: control.iconSize + spacing.sm, paddingHorizontal: spacing.md },
  statusText: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, writingDirection: 'rtl' },
  daysRemaining: { fontFamily: fonts.bold, fontSize: typography.pageTitle, lineHeight: typography.lineHeightPageTitle, marginTop: spacing.sm, textAlign: 'right', writingDirection: 'rtl' },
  section: { marginTop: spacing.xl },
  sectionTitle: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, marginBottom: spacing.sm, textAlign: 'right', writingDirection: 'rtl' },
  detailCard: { borderRadius: radii.card, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden', paddingHorizontal: spacing.md },
  detailRow: { alignItems: 'center', flexDirection: 'row-reverse', justifyContent: 'space-between', minHeight: control.headerHeight },
  detailLabel: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'left', writingDirection: 'rtl' },
  detailValue: { flexShrink: 1, fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, marginEnd: spacing.sm, textAlign: 'right', writingDirection: 'rtl' },
  usageCard: { borderRadius: radii.card, borderWidth: StyleSheet.hairlineWidth, padding: spacing.md },
  usageRow: { alignItems: 'center', flexDirection: 'row-reverse', justifyContent: 'space-between' },
  usageLabel: { fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'left', writingDirection: 'rtl' },
  usageValue: { fontFamily: fonts.bold, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, writingDirection: 'rtl' },
  progressTrack: { borderWidth: control.inputBorderWidth, borderRadius: radii.field, height: spacing.xs, marginTop: spacing.md, overflow: 'hidden', width: '100%' },
  progressValue: { borderRadius: radii.field, height: '100%' },
  usageNote: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, marginTop: spacing.sm, textAlign: 'right', writingDirection: 'rtl' },
});
