import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { ErrorState, OfflineState, SkeletonCards } from '@/src/components/ui/MobileUI';
import { EnterView, IconShape, SectionHeading, TonalCard } from '@/src/components/ui/Nabd';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { getVideoCollection } from '@/src/services/engagement-api';
import { CONNECTION_COPY, useEngagementResource } from '@/src/services/use-engagement-resource';
import { control, fonts, spacing, typography } from '@/src/theme/tokens';
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

  /**
   * «نبض» (S10): العنوان الكبير · سطرا الشرح · بطاقتا المصدر (تصوير · استديو) · تنبيه الإغلاق
   * بحاوية التحذير · ثم ملاحظة «الرفع ما ينشر مباشرة». اليوم `available: false` فالبطاقتان
   * **معطّلتان مرئياً** (شفافية ٤٥٪ ولا تُضغطان) بجانب السبب — لا زرّاً يعد بما لا يقع.
   * زرّ «العودة للطلّات» في آخر الشاشة سقط: الرجوع الدائري في أعلاها يؤدّيه، وكانا فعلين لشيء واحد.
   */
  const source = (icon: 'video' | 'gallery', label: string) => <TonalCard
    key={icon}
    onPress={upload.available ? onDone : undefined}
    accessibilityLabel={label}
    style={[styles.source, upload.available ? null : styles.disabled]}
  >
    <IconShape icon={icon} />
    <Text style={[styles.sourceLabel, { color: theme.colors.text }]}>{label}</Text>
  </TonalCard>;

  return <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
    <ScreenHeader title={upload.screenTitle} backLabel={upload.backLabel} onBack={onDone} />
    <EnterView index={0} style={styles.intro}>
      <SectionHeading>{upload.title}</SectionHeading>
      <Text style={[styles.secondary, { color: theme.colors.muted }]}>{upload.description}</Text>
    </EnterView>
    <EnterView index={1} style={styles.sources}>
      <View accessibilityState={{ disabled: !upload.available }} style={styles.sources}>
        {source('video', upload.cameraLabel)}
        {source('gallery', upload.libraryLabel)}
      </View>
    </EnterView>
    {upload.available ? null : <EnterView index={2}>
      {/* رمز «معلومة» لا «رفع»: سهم الرفع هنا كان يُقرأ زرّاً لا يعمل (خالد ٥ أكتوبر ٢٠٢٦)، والعنوان رابط يُضغط. */}
      <TonalCard tone="warning" style={styles.notice}>
        <ModontyIcon name="info" size={control.iconSizeSmall} primary={theme.colors.onWarningContainer} accent={theme.colors.accent} />
        <Text style={[styles.noticeText, { color: theme.colors.onWarningContainer }]}>
          {upload.unavailableText && upload.consoleLinkLabel && upload.consoleUrl
            ? <>
              {`${upload.unavailableText} `}
              <Text accessibilityRole="link" onPress={() => { if (upload.consoleUrl) void Linking.openURL(upload.consoleUrl).catch(() => undefined); }} style={styles.link}>{upload.consoleLinkLabel}</Text>
            </>
            : upload.unavailableLabel}
        </Text>
      </TonalCard>
    </EnterView>}
    <EnterView index={3}>
      <Text style={[styles.secondary, { color: theme.colors.muted }]}>{`${upload.noteTitle} ${upload.noteBody}`}</Text>
    </EnterView>
  </ScrollView>;
}

const styles = StyleSheet.create({
  state: { flex: 1, paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.md },
  screen: { gap: spacing.sm, paddingHorizontal: spacing.screenHorizontal, paddingBottom: spacing.screenBottom },
  intro: { gap: spacing.xxs },
  sources: { gap: spacing.sm },
  source: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.sm, minHeight: 72 },
  disabled: { opacity: 0.45 },
  sourceLabel: { flex: 1, fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'right', writingDirection: 'rtl' },
  notice: { alignItems: 'flex-start', flexDirection: 'row-reverse', gap: spacing.sm },
  link: { fontFamily: fonts.bold, textDecorationLine: 'underline' },
  noticeText: { flex: 1, fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'right', writingDirection: 'rtl' },
  secondary: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl' },
});
