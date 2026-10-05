import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { EmptyState, ErrorState, OfflineState, SkeletonBar } from '@/src/components/ui/MobileUI';
import { EnterView, GroupRow, HeroCard, ListGroup, Ring, SectionHeading, StatusBadge, TonalCard } from '@/src/components/ui/Nabd';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { getSubscriptionScreen, networkCopy, type SubscriptionDetailRow, type SubscriptionScreen } from '@/src/services/account-api';
import { arabicDigitsText } from "@/src/services/engagement-api";
import { MobileOfflineError } from '@/src/services/mobile-api';
import { fonts, nabd, skeleton, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type SubscriptionRouteProps = { accessToken: string | null; onBack: () => void; onSupport: () => void };

/** مسار الحلقة على البطل: أبيض ٢٥٪ كما في الموكب. */
const HERO_RING_TRACK = 'rgba(255,255,255,0.25)';

/**
 * S04 «تفاصيل الاشتراك» — «نبض»: البطل الأزرق الوحيد في الشاشة (حلقة الأيّام الباقية ترسم نفسها
 * مرّة، وبجانبها الباقة والمدّة وما مضى منها) · بطاقة الاستخدام · ثم صفوف التفاصيل مجموعاتٍ مقطّعة.
 * الحلقة بمعادلة حلقة الرئيسية نفسها (`daysRemaining ÷ durationDays` من الطلب الساري).
 */
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
  const hero = subscription?.hero ?? null;
  const ringProgress = hero && hero.daysRemaining !== null && hero.durationDays ? hero.daysRemaining / hero.durationDays : null;

  const body = isOffline
    ? <OfflineState title={networkCopy.offlineTitle} description={networkCopy.offlineDescription} retryLabel={networkCopy.retryLabel} onRetry={load} />
    : error !== null
      ? <ErrorState message={error} retryLabel={networkCopy.retryLabel} onRetry={load} />
      : screen === null
        ? <View style={styles.stack}>
          <SkeletonBar height={skeleton.cardHeight} radius={nabd.heroRadius} />
          <SkeletonBar height={skeleton.blockHeight} radius={nabd.cardRadius} />
          <SkeletonBar height={skeleton.blockHeight} radius={nabd.cardRadius} />
        </View>
        : screen.empty !== null
          ? <EmptyState icon="info" title={screen.empty.title} copy={screen.empty.description} actionLabel={screen.empty.actionLabel} onAction={onSupport} />
          : subscription === null
            ? null
            : <View style={styles.stack}>
              {subscription.notice ? <TonalCard tone={subscription.notice.tone === 'warning' ? 'warning' : undefined} accessibilityLabel={`${subscription.notice.title}. ${subscription.notice.body}`}>
                <Text style={[styles.noticeTitle, { color: theme.colors.text }]}>{subscription.notice.title}</Text>
                <Text style={[styles.noticeBody, { color: theme.colors.muted }]}>{subscription.notice.body}</Text>
              </TonalCard> : null}
              <EnterView index={0}>
                <HeroCard>
                  <View style={styles.heroHead}>
                    <Text style={[styles.label, { color: theme.colors.onHeroMuted }]}>{hero?.label ?? ''}</Text>
                    <StatusBadge label={subscription.statusLabel} tone={subscription.statusTone === 'positive' ? 'onHero' : subscription.statusTone === 'danger' ? 'danger' : 'warning'} style={styles.badgeInRow} />
                  </View>
                  {hero ? <View style={styles.heroRow}>
                    {ringProgress !== null && hero.daysValue ? <Ring size={nabd.heroRingSize} stroke={nabd.heroRingStroke} progress={ringProgress} color={theme.colors.onHero} track={HERO_RING_TRACK} onceKey="subscription-hero-ring" accessibilityLabel={subscription.daysRemainingLabel ?? undefined}>
                      <Text maxFontSizeMultiplier={1} style={[styles.ringNumeral, { color: theme.colors.onHero }]}>{arabicDigitsText(hero.daysValue)}</Text>
                      <Text maxFontSizeMultiplier={1} style={[styles.ringUnit, { color: theme.colors.onHeroMuted }]}>{hero.daysUnit}</Text>
                    </Ring> : null}
                    <View style={styles.heroCopy}>
                      {hero.planTitle ? <Text style={[styles.heroTitle, { color: theme.colors.onHero }]}>{hero.planTitle}</Text> : null}
                      {hero.rangeLabel ? <Text style={[styles.secondary, { color: theme.colors.onHeroMuted }]}>{arabicDigitsText(hero.rangeLabel)}</Text> : null}
                      {hero.elapsedLabel ? <Text style={[styles.secondary, { color: theme.colors.onHeroMuted }]}>{arabicDigitsText(hero.elapsedLabel)}</Text> : null}
                    </View>
                  </View> : subscription.daysRemainingLabel ? <Text style={[styles.heroTitle, { color: theme.colors.onHero }]}>{arabicDigitsText(subscription.daysRemainingLabel)}</Text> : null}
                </HeroCard>
              </EnterView>

              {subscription.usage ? <EnterView index={1}>
                <TonalCard style={styles.usage}>
                  <View style={styles.between}>
                    <SectionHeading>{subscription.usage.title}</SectionHeading>
                    <Text maxFontSizeMultiplier={1} style={[styles.label, { color: theme.colors.text }]}>{arabicDigitsText(subscription.usage.valueLabel)}</Text>
                  </View>
                  <Text style={[styles.secondary, { color: theme.colors.muted }]}>{arabicDigitsText(subscription.usage.remainingLabel)}</Text>
                  {/* الشريط يقيس ما يقوله الرقم بجانبه: المتبقّي — ممتلئ = رصيدك كامل. */}
                  <View
                    accessibilityRole="progressbar"
                    accessibilityLabel={arabicDigitsText(subscription.usage.remainingLabel)}
                    accessibilityValue={{ now: subscription.usage.remainingPercent, min: 0, max: 100 }}
                    style={[styles.track, { backgroundColor: theme.colors.surfaceHigh }]}
                  >
                    <View style={[styles.trackFill, { backgroundColor: theme.colors.brandFill, width: `${subscription.usage.remainingPercent}%` }]} />
                  </View>
                  <Text style={[styles.secondary, { color: theme.colors.muted }]}>{subscription.usage.note}</Text>
                </TonalCard>
              </EnterView> : null}

              {subscription.planPayment ? <EnterView index={2} style={styles.section}>
                <SectionHeading>{subscription.planPayment.title}</SectionHeading>
                <DetailRows rows={subscription.planPayment.rows} />
              </EnterView> : null}

              {subscription.period ? <EnterView index={3} style={styles.section}>
                <SectionHeading>{subscription.period.title}</SectionHeading>
                <DetailRows rows={subscription.period.rows} />
              </EnterView> : null}
            </View>;

  return <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <ScreenHeader title={screen?.screenTitle ?? null} backLabel={screen?.backLabel ?? networkCopy.backLabel} onBack={onBack} />
    {body}
  </ScrollView>;
}

/** صفوف التفاصيل مجموعةً مقطّعة: التسمية خافتة في بداية السطر والقيمة في نهايته. */
function DetailRows({ rows }: { rows: SubscriptionDetailRow[] }) {
  const { theme } = useAppTheme();
  return <ListGroup>
    {rows.map((row) => <GroupRow key={row.label}>
      <View style={styles.detailRow}>
        <Text maxFontSizeMultiplier={1.2} style={[styles.body, { color: theme.colors.muted }]}>{row.label}</Text>
        <Text maxFontSizeMultiplier={1.2} style={[styles.body, styles.detailValue, { color: theme.colors.text }]}>{arabicDigitsText(row.value)}</Text>
      </View>
    </GroupRow>)}
  </ListGroup>;
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.screenBottom, paddingHorizontal: spacing.screenHorizontal },
  stack: { gap: spacing.sm },
  heroHead: { alignItems: 'center', flexDirection: 'row-reverse', justifyContent: 'space-between' },
  badgeInRow: { alignSelf: 'auto' },
  heroRow: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.md },
  heroCopy: { flex: 1, gap: spacing.xxs, minWidth: 0 },
  heroTitle: { fontFamily: fonts.bold, fontSize: typography.heroTitle, lineHeight: typography.lineHeightHeroTitle, textAlign: 'right', writingDirection: 'rtl' },
  ringNumeral: { fontFamily: fonts.extraBold, fontSize: typography.heroRingNumeral, lineHeight: typography.heroRingNumeral + spacing.xxs, textAlign: 'center' },
  ringUnit: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary - spacing.xxs, textAlign: 'center' },
  label: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'right', writingDirection: 'rtl' },
  noticeTitle: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'right', writingDirection: 'rtl' },
  noticeBody: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl' },
  secondary: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl' },
  body: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, writingDirection: 'rtl' },
  usage: { gap: spacing.xs },
  between: { alignItems: 'center', flexDirection: 'row-reverse', justifyContent: 'space-between' },
  track: { borderRadius: nabd.pill, height: spacing.xs, overflow: 'hidden', width: '100%' },
  trackFill: { borderRadius: nabd.pill, height: '100%' },
  section: { gap: spacing.xs, marginTop: spacing.xxs },
  // صفّ قراءة لا يُضغط: ارتفاعه سطره + حشو المجموعة (≈٤٧ كالموكب)، لا هدف لمس ٤٨.
  detailRow: { alignItems: 'center', flexDirection: 'row-reverse', justifyContent: 'space-between' },
  detailValue: { flexShrink: 1, fontFamily: fonts.medium, textAlign: 'left' },
});
