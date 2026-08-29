import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { ErrorState, OfflineState, SkeletonCards, StatusPill } from '@/src/components/ui/MobileUI';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { getVideoCollection } from '@/src/services/engagement-api';
import { CONNECTION_COPY, useEngagementResource } from '@/src/services/use-engagement-resource';
import { control, fonts, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/**
 * S10 «رفع فيديو».
 *
 * The two source buttons render only when the server says `upload.available`. Today it says
 * `false`, and the screen shows why instead: there is no upload endpoint, no client ingest to
 * Bunny Stream, and no picker installed in the app. Drawing «تصوير الآن» over none of that
 * would teach the client the app is broken the first time they pressed it.
 *
 * Nothing else about the screen is conditional, so the day the write path lands the approved
 * layout appears with no change here.
 */

type Props = { accessToken: string; onDone: () => void };

export function VideoUploadRoute({ accessToken, onDone }: Props) {
  const { theme } = useAppTheme();
  const { resource, reload } = useEngagementResource(accessToken, getVideoCollection);
  const upload = resource.data?.upload;

  if (resource.status === 'loading') return <View style={styles.screen}>
    <ScreenHeader title={null} backLabel={CONNECTION_COPY.backLabel} onBack={onDone} />
    <View style={styles.state}><SkeletonCards count={2} /></View>
  </View>;
  if (resource.status === 'offline') return <View style={styles.screen}>
    <ScreenHeader title={null} backLabel={CONNECTION_COPY.backLabel} onBack={onDone} />
    <View style={styles.state}><OfflineState title={CONNECTION_COPY.offlineTitle} description={CONNECTION_COPY.offlineDescription} retryLabel={CONNECTION_COPY.retryLabel} onRetry={reload} /></View>
  </View>;
  if (resource.status === 'error' || upload === undefined) return <View style={styles.screen}>
    <ScreenHeader title={null} backLabel={CONNECTION_COPY.backLabel} onBack={onDone} />
    <View style={styles.state}><ErrorState message={resource.message ?? CONNECTION_COPY.errorTitle} retryLabel={CONNECTION_COPY.retryLabel} onRetry={reload} /></View>
  </View>;

  return <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
    <ScreenHeader title={upload.screenTitle} backLabel={upload.backLabel} onBack={onDone} />

    <View style={[styles.hero, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.heroTitle, { color: theme.colors.text }]}>{upload.title}</Text>
      <Text style={[styles.heroCopy, { color: theme.colors.muted }]}>{upload.description}</Text>
      <StatusPill tone="warning">{upload.statusBadgeLabel}</StatusPill>
    </View>

    {upload.available ? <>
      <Pressable accessibilityRole="button" accessibilityLabel={upload.cameraLabel} onPress={onDone} style={[styles.primaryAction, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.primaryLabel, { color: theme.colors.textOnPrimary }]}>{upload.cameraLabel}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={upload.libraryLabel} onPress={onDone} style={[styles.secondaryAction, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.secondaryLabel, { color: theme.colors.text }]}>{upload.libraryLabel}</Text>
      </Pressable>
    </> : <View style={[styles.note, { backgroundColor: theme.colors.surface, borderColor: theme.colors.warning }]}>
      <Text style={[styles.noteBody, { color: theme.colors.text }]}>{upload.unavailableLabel}</Text>
    </View>}

    <View style={[styles.note, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.noteTitle, { color: theme.colors.text }]}>{upload.noteTitle}</Text>
      <Text style={[styles.noteBody, { color: theme.colors.muted }]}>{upload.noteBody}</Text>
    </View>

    <Pressable accessibilityRole="button" accessibilityLabel={upload.backLabel} onPress={onDone} style={[styles.secondaryAction, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.secondaryLabel, { color: theme.colors.text }]}>{upload.backLabel}</Text>
    </Pressable>
  </ScrollView>;
}

const styles = StyleSheet.create({
  state: { flex: 1, paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.md },
  screen: { paddingHorizontal: spacing.screenHorizontal, paddingBottom: spacing.screenBottom },
  heading: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, marginTop: spacing.md, paddingBottom: spacing.md },
  pageTitle: { fontFamily: fonts.medium, fontSize: typography.pageTitle, lineHeight: typography.lineHeightPageTitle, textAlign: 'right', writingDirection: 'rtl' },
  backButton: { width: control.minTouchTarget, height: control.minTouchTarget, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, borderRadius: radii.card, padding: spacing.lg, marginTop: spacing.lg, gap: spacing.xs },
  heroTitle: { fontFamily: fonts.medium, fontSize: typography.pageTitle, lineHeight: typography.lineHeightPageTitle, textAlign: 'center', writingDirection: 'rtl' },
  heroCopy: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'center', writingDirection: 'rtl', marginBottom: spacing.xs },
  primaryAction: { minHeight: control.buttonHeight, borderRadius: radii.button, alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg },
  primaryLabel: { fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, writingDirection: 'rtl' },
  secondaryAction: { minHeight: control.buttonHeight, borderWidth: StyleSheet.hairlineWidth, borderRadius: radii.button, alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
  secondaryLabel: { fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, writingDirection: 'rtl' },
  note: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radii.card, padding: spacing.md, marginTop: spacing.lg, alignItems: 'flex-end' },
  noteTitle: { fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl' },
  noteBody: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.xxs },
});
