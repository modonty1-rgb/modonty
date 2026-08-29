import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useConfirm } from '@/src/components/ui/ConfirmProvider';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { ErrorState, OfflineState, SkeletonCards, StatusPill } from '@/src/components/ui/MobileUI';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { getAccountOverview, saveNotificationToggle, type NotificationToggle } from '@/src/services/engagement-api';
import { CONNECTION_COPY, useEngagementResource } from '@/src/services/use-engagement-resource';
import { control, fonts, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/**
 * S13 «حسابي».
 *
 * The two switches write to `Client.notificationPreferences` immediately. A switch that only
 * moves on screen is a lie the client discovers weeks later, when the notification they
 * turned off arrives anyway — so a failed save puts the switch back and says so.
 *
 * Logout is confirmed. It is the one destructive action here, and the rule is that a
 * destructive action is never one tap.
 */

type Props = { accessToken: string; onBack: () => void; onSupport: () => void; onLogout: () => void };

export function AccountRoute({ accessToken, onBack, onSupport, onLogout }: Props) {
  const confirm = useConfirm();
  const { theme } = useAppTheme();
  const { resource, reload, replace } = useEngagementResource(accessToken, getAccountOverview);
  const [savingKey, setSavingKey] = useState<NotificationToggle['key'] | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const overview = resource.data;

  const toggle = useCallback((key: NotificationToggle['key'], enabled: boolean) => {
    if (overview === null || savingKey !== null) return;
    setSavingKey(key);
    setSaveError(null);
    saveNotificationToggle(accessToken, key, enabled)
      .then((result) => replace({ ...overview, account: { ...overview.account, notifications: result.notifications } }))
      .catch((reason: unknown) => setSaveError(reason instanceof Error ? reason.message : overview.review.saveErrorTitle))
      .finally(() => setSavingKey(null));
  }, [accessToken, overview, replace, savingKey]);

  const confirmLogout = useCallback(() => {
    if (overview === null) return;
    const { review } = overview;
    void confirm({ title: review.logoutConfirmTitle, description: review.logoutConfirmDescription, confirmLabel: review.logoutConfirmLabel, cancelLabel: review.cancelLabel })
      .then((agreed) => { if (agreed) onLogout(); });
  }, [confirm, onLogout, overview]);

  // الرأس يُرسم مع الهيكل كي يبقى الرجوع مضغوطاً لو تعثّرت الشبكة — انظر تعليق `ScreenHeader`.
  if (resource.status === 'loading') return <View style={styles.screen}>
    <ScreenHeader title={null} backLabel={CONNECTION_COPY.backLabel} onBack={onBack} />
    <View style={styles.state}><SkeletonCards count={3} /></View>
  </View>;
  if (resource.status === 'offline') return <View style={styles.screen}>
    <ScreenHeader title={null} backLabel={CONNECTION_COPY.backLabel} onBack={onBack} />
    <View style={styles.state}><OfflineState title={CONNECTION_COPY.offlineTitle} description={CONNECTION_COPY.offlineDescription} retryLabel={CONNECTION_COPY.retryLabel} onRetry={reload} /></View>
  </View>;
  if (resource.status === 'error' || overview === null) return <View style={styles.screen}>
    <ScreenHeader title={null} backLabel={CONNECTION_COPY.backLabel} onBack={onBack} />
    <View style={styles.state}><ErrorState message={resource.message ?? CONNECTION_COPY.errorTitle} retryLabel={CONNECTION_COPY.retryLabel} onRetry={reload} /></View>
  </View>;

  const { account, review } = overview;
  return <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
    <ScreenHeader title={review.title} backLabel={review.backLabel} onBack={onBack} />

    <View style={[styles.card, styles.profile, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.name, { color: theme.colors.text }]}>{account.name}</Text>
      <Text style={[styles.email, { color: theme.colors.muted }]}>{account.email}</Text>
      <StatusPill>{account.planLabel}</StatusPill>
    </View>

    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{review.notificationsSectionTitle}</Text>
    {account.notifications.map((item) => <View key={item.key} style={[styles.card, styles.toggleRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Switch
        accessibilityLabel={item.label}
        disabled={savingKey !== null}
        onValueChange={(next) => toggle(item.key, next)}
        trackColor={{ false: theme.colors.border, true: theme.colors.brandFill }}
        value={item.enabled}
      />
      <View style={styles.toggleCopy}>
        <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>{item.label}</Text>
        <Text style={[styles.toggleDetail, { color: theme.colors.muted }]}>{savingKey === item.key ? review.savingLabel : item.description}</Text>
      </View>
    </View>)}
    {saveError ? <Text style={[styles.error, { color: theme.colors.errorText }]}>{saveError}</Text> : null}

    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{review.helpSectionTitle}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={review.supportTitle} onPress={onSupport} style={[styles.card, styles.supportRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.supportCopy}>
        <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>{review.supportTitle}</Text>
        <Text style={[styles.toggleDetail, { color: theme.colors.muted }]}>{review.supportDescription}</Text>
      </View>
      <ModontyIcon name="arrow-left" size={control.iconSize} primary={theme.colors.muted} accent={theme.colors.accent} />
    </Pressable>

    <Pressable accessibilityRole="button" accessibilityLabel={review.logoutLabel} onPress={confirmLogout} style={[styles.card, styles.logout, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.logoutLabel, { color: theme.colors.danger }]}>{review.logoutLabel}</Text>
    </Pressable>
  </ScrollView>;
}

const styles = StyleSheet.create({
  state: { flex: 1, paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.md },
  screen: { paddingHorizontal: spacing.screenHorizontal, paddingBottom: spacing.screenBottom },
  heading: { alignItems: 'flex-end', borderBottomWidth: StyleSheet.hairlineWidth, marginTop: spacing.md, paddingBottom: spacing.md },
  pageTitle: { fontFamily: fonts.medium, fontSize: typography.pageTitle, lineHeight: typography.lineHeightPageTitle, textAlign: 'right', writingDirection: 'rtl' },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radii.card, padding: spacing.md, marginBottom: spacing.sm },
  profile: { alignItems: 'center', gap: spacing.xxs, marginTop: spacing.lg, paddingVertical: spacing.lg },
  name: { fontFamily: fonts.medium, fontSize: typography.pageTitle, lineHeight: typography.lineHeightPageTitle, writingDirection: 'rtl' },
  email: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, writingDirection: 'ltr', marginBottom: spacing.xs },
  sectionTitle: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.xl, marginBottom: spacing.sm },
  toggleRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, minHeight: control.minTouchTarget },
  toggleCopy: { flex: 1, alignItems: 'flex-end' },
  toggleLabel: { fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl' },
  toggleDetail: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.xxs },
  supportRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, minHeight: control.minTouchTarget },
  supportCopy: { flex: 1, alignItems: 'flex-end' },
  error: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.xxs },
  logout: { alignItems: 'center', justifyContent: 'center', minHeight: control.buttonHeight, marginTop: spacing.xl },
  logoutLabel: { fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, writingDirection: 'rtl' },
});
