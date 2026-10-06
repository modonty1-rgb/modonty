import { useCallback, useState } from 'react';
import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useConfirm } from '@/src/components/ui/ConfirmProvider';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { ErrorState, OfflineState, SkeletonCards } from '@/src/components/ui/MobileUI';
import { Cookie, EnterView, GroupRow, haptic, ListGroup, PillButton, SectionHeading, StatusBadge, TonalCard } from '@/src/components/ui/Nabd';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { getAccountOverview, saveNotificationToggle } from '@/src/services/engagement-api';
import { CONNECTION_COPY, useEngagementResource } from '@/src/services/use-engagement-resource';
import { control, fonts, nabd, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { getAppVersionLine } from '@/src/services/app-version';

/**
 * S13 «حسابي».
 *
 * One switch per event (6 Oct 2026 — «يحدد يس أو نو» on every event we track), grouped under
 * the server's section headings; an older server sends only the two group switches, and those
 * render instead. Every switch writes to `Client.notificationPreferences` immediately. A switch that only
 * moves on screen is a lie the client discovers weeks later, when the notification they
 * turned off arrives anyway — so a failed save puts the switch back and says so.
 *
 * Logout is confirmed. It is the one destructive action here, and the rule is that a
 * destructive action is never one tap.
 */

type Props = { accessToken: string; onBack: () => void; onSupport: () => void; onLogout: () => void; /** شعار العميل من ملفّه — يجلس داخل «الكعكة» في بطاقة الهويّة. */ logoUrl?: string | null };

export function AccountRoute({ accessToken, onBack, onSupport, onLogout, logoUrl = null }: Props) {
  const confirm = useConfirm();
  const { theme } = useAppTheme();
  const { resource, reload, replace } = useEngagementResource(accessToken, getAccountOverview);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const overview = resource.data;

  const toggle = useCallback((key: string, enabled: boolean) => {
    if (overview === null || savingKey !== null) return;
    setSavingKey(key);
    setSaveError(null);
    saveNotificationToggle(accessToken, key, enabled)
      .then((result) => replace({ ...overview, account: { ...overview.account, notifications: result.notifications, notificationEvents: result.notificationEvents ?? overview.account.notificationEvents } }))
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
  /**
   * «نبض» (S13): بطاقة هويّة نغمية `secondary` بزاوية ٢٨ — «كعكة» كحلية بشعار العميل · الاسم ·
   * البريد · شارة الباقة — ثم مجموعتان مقطّعتان (التنبيهات · المساعدة) ثم الخروج كبسولة خطر.
   */
  return <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
    <ScreenHeader title={review.title} backLabel={review.backLabel} onBack={onBack} />

    <EnterView index={0}>
      <TonalCard tone="secondary" style={styles.identity}>
        <Cookie size={IDENTITY_COOKIE} color={theme.colors.navy}>
          {logoUrl
            ? <Image source={{ uri: logoUrl }} accessibilityLabel={account.name} cachePolicy="memory-disk" contentFit="contain" style={styles.logo} />
            : <ModontyIcon name="profile" size={control.iconSize} primary={theme.colors.onHero} accent={theme.colors.accent} />}
        </Cookie>
        <Text style={[styles.name, { color: theme.colors.onSecondary }]}>{account.name}</Text>
        <Text style={[styles.email, { color: theme.colors.onSecondary }]}>{account.email}</Text>
        <StatusBadge label={account.planLabel} tone="positive" style={styles.planBadge} />
      </TonalCard>
    </EnterView>

    <EnterView index={1} style={styles.section}>
      <SectionHeading>{review.notificationsSectionTitle}</SectionHeading>
      {account.notificationEvents && account.notificationGroups
        ? account.notificationGroups.map((section) => {
          const rows = account.notificationEvents?.filter((item) => item.section === section.key) ?? [];
          if (rows.length === 0) return null;
          return <View key={section.key} style={styles.eventSection}>
            <Text style={[styles.sectionLabel, { color: theme.colors.muted }]}>{section.label}</Text>
            <ListGroup>
              {rows.map((item) => <GroupRow key={item.key}>
                <View style={styles.row}>
                  <View style={styles.rowCopy}>
                    <Text style={[styles.rowLabel, { color: theme.colors.text }]}>{item.label}</Text>
                    {savingKey === item.key ? <Text style={[styles.secondary, { color: theme.colors.muted }]}>{review.savingLabel}</Text> : null}
                  </View>
                  <Switch
                    accessibilityLabel={item.label}
                    disabled={savingKey !== null}
                    onValueChange={(next) => { haptic('selection'); toggle(item.key, next); }}
                    thumbColor={item.enabled ? theme.colors.onBrandFill : theme.colors.inputBorder}
                    trackColor={{ false: theme.colors.surfaceHigh, true: theme.colors.brandFill }}
                    value={item.enabled}
                  />
                </View>
              </GroupRow>)}
            </ListGroup>
          </View>;
        })
        : <ListGroup>
          {account.notifications.map((item) => <GroupRow key={item.key}>
            <View style={styles.row}>
              <View style={styles.rowCopy}>
                <Text style={[styles.rowLabel, { color: theme.colors.text }]}>{item.label}</Text>
                <Text style={[styles.secondary, { color: theme.colors.muted }]}>{savingKey === item.key ? review.savingLabel : item.description}</Text>
              </View>
              <Switch
                accessibilityLabel={item.label}
                disabled={savingKey !== null}
                onValueChange={(next) => { haptic('selection'); toggle(item.key, next); }}
                thumbColor={item.enabled ? theme.colors.onBrandFill : theme.colors.inputBorder}
                trackColor={{ false: theme.colors.surfaceHigh, true: theme.colors.brandFill }}
                value={item.enabled}
              />
            </View>
          </GroupRow>)}
        </ListGroup>}
      {saveError ? <Text accessibilityLiveRegion="assertive" style={[styles.secondary, { color: theme.colors.errorText }]}>{saveError}</Text> : null}
    </EnterView>

    <EnterView index={2} style={styles.section}>
      <SectionHeading>{review.helpSectionTitle}</SectionHeading>
      <GroupRow onPress={onSupport} accessibilityLabel={review.supportTitle}>
        <View style={styles.row}>
          <ModontyIcon name="support" size={control.iconSize} primary={theme.colors.text} accent={theme.colors.accent} />
          <View style={styles.rowCopy}>
            <Text style={[styles.rowLabel, { color: theme.colors.text }]}>{review.supportTitle}</Text>
            <Text style={[styles.secondary, { color: theme.colors.muted }]}>{review.supportDescription}</Text>
          </View>
          <ModontyIcon name="arrow-left" size={control.iconSizeSmall} primary={theme.colors.muted} accent={theme.colors.accent} />
        </View>
      </GroupRow>
    </EnterView>

    <EnterView index={3} style={styles.section}>
      <PillButton label={review.logoutLabel} icon="logout" tone="danger" onPress={confirmLogout} />
    </EnterView>

    <Text selectable style={[styles.version, { color: theme.colors.muted }]}>{getAppVersionLine()}</Text>
  </ScrollView>;
}

/** «الكعكة» في بطاقة الهويّة ٧٢ (‎.cookie 72 في الموكب) والشعار داخلها ٤٤. */
const IDENTITY_COOKIE = 72;
const LOGO_SIZE = 44;

const styles = StyleSheet.create({
  state: { flex: 1, paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.md },
  screen: { gap: spacing.sm, paddingHorizontal: spacing.screenHorizontal, paddingBottom: spacing.screenBottom },
  identity: { alignItems: 'center', borderRadius: nabd.bigCardRadius, gap: spacing.xs, padding: spacing.lg },
  logo: { backgroundColor: '#FFFFFF', borderRadius: LOGO_SIZE, height: LOGO_SIZE, width: LOGO_SIZE },
  name: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'center', writingDirection: 'rtl' },
  // البريد لاتيني: يُعلن اتّجاهه كي لا تقلبه الفقرة العربية.
  email: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'center', writingDirection: 'ltr' },
  planBadge: { alignSelf: 'center' },
  section: { gap: spacing.xs, marginTop: spacing.xxs },
  eventSection: { gap: spacing.xxs, marginTop: spacing.xxs },
  sectionLabel: { fontFamily: fonts.medium, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, paddingHorizontal: spacing.xs, textAlign: 'right', writingDirection: 'rtl' },
  row: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.sm, minHeight: control.minTouchTarget },
  rowCopy: { flex: 1, minWidth: 0 },
  rowLabel: { fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl' },
  version: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, marginTop: spacing.xs, textAlign: 'center', writingDirection: 'rtl' },
  secondary: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl' },
});
