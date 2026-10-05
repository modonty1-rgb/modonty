import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useKeyboardInset } from '@/src/components/ui/useKeyboardInset';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { ErrorState, OfflineState, SkeletonCards } from '@/src/components/ui/MobileUI';
import { DockSurface, EnterView, PillButton, TextAreaField, TonalCard } from '@/src/components/ui/Nabd';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { arabicDigits, getSupportReview, sendSupportMessage } from '@/src/services/engagement-api';
import { CONNECTION_COPY, useEngagementResource } from '@/src/services/use-engagement-resource';
import { control, fonts, nabd, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/**
 * S14 «المساعدة والدعم» — one message to the Modonty team, stored as a `ContactMessage`.
 *
 * The send button is disabled while empty and while in flight, so a double tap cannot open
 * two tickets for one question.
 */

type Props = { accessToken: string; onDone: () => void };

export function SupportRoute({ accessToken, onDone }: Props) {
  const { theme } = useAppTheme();
  const { resource, reload } = useEngagementResource(accessToken, getSupportReview);
  const [message, setMessage] = useState('');
  const [isSending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isSent, setSent] = useState(false);
  const keyboardInset = useKeyboardInset();
  const scrollRef = useRef<ScrollView>(null);
  const followKeyboard = useCallback(() => { if (keyboardInset > 0) scrollRef.current?.scrollToEnd({ animated: true }); }, [keyboardInset]);

  const review = resource.data?.review;
  const trimmed = message.trim();
  const canSend = trimmed.length > 0 && !isSending && !isSent;

  const send = useCallback(() => {
    if (!canSend) return;
    setSending(true);
    setSendError(null);
    sendSupportMessage(accessToken, trimmed)
      .then(() => { setSent(true); setMessage(''); })
      .catch((reason: unknown) => setSendError(reason instanceof Error ? reason.message : CONNECTION_COPY.errorTitle))
      .finally(() => setSending(false));
  }, [accessToken, canSend, trimmed]);

  if (resource.status === 'loading') return <View style={styles.screen}>
    <ScreenHeader title={null} backLabel={CONNECTION_COPY.backLabel} onBack={onDone} />
    <View style={styles.state}><SkeletonCards count={2} /></View>
  </View>;
  if (resource.status === 'offline') return <View style={styles.screen}>
    <ScreenHeader title={null} backLabel={CONNECTION_COPY.backLabel} onBack={onDone} />
    <View style={styles.state}><OfflineState title={CONNECTION_COPY.offlineTitle} description={CONNECTION_COPY.offlineDescription} retryLabel={CONNECTION_COPY.retryLabel} onRetry={reload} /></View>
  </View>;
  if (resource.status === 'error' || review === undefined) return <View style={styles.screen}>
    <ScreenHeader title={null} backLabel={CONNECTION_COPY.backLabel} onBack={onDone} />
    <View style={styles.state}><ErrorState message={resource.message ?? CONNECTION_COPY.errorTitle} retryLabel={CONNECTION_COPY.retryLabel} onRetry={reload} /></View>
  </View>;

  /**
   * «نبض» (S14): بطل نغمي تركوازي بزاوية ٢٨ (رمز الدعم · «كيف نساعدك؟» ٢٢/٣٠) · حقل الرسالة
   * ١٨٠ وتحته ما يحدث بعد الإرسال والعدّاد · ثم زرّ الإرسال على لوح الفعل.
   */
  return <View style={[styles.fill, { paddingBottom: keyboardInset }]}>
    <ScrollView ref={scrollRef} onLayout={followKeyboard} contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <ScreenHeader title={review.title} backLabel={review.backLabel} onBack={onDone} />

      <EnterView index={0}>
        <TonalCard tone="tertiary" style={styles.hero}>
          <View style={styles.heroIcon}><ModontyIcon name="support" size={control.iconSize} primary={theme.colors.onTertiary} accent={theme.colors.accent} /></View>
          <Text style={[styles.heroTitle, { color: theme.colors.onTertiary }]}>{review.heroTitle}</Text>
          <Text style={[styles.secondary, { color: theme.colors.onTertiary }]}>{review.heroDescription}</Text>
        </TonalCard>
      </EnterView>

      {isSent ? <EnterView index={1}>
        <TonalCard tone="positive" style={styles.sent}>
          <View style={styles.sentHead}>
            <ModontyIcon name="check" size={control.iconSizeSmall} primary={theme.colors.onPositiveContainer} accent={theme.colors.accent} />
            <Text style={[styles.sentTitle, { color: theme.colors.onPositiveContainer }]}>{review.sentTitle}</Text>
          </View>
          <Text style={[styles.body, { color: theme.colors.onPositiveContainer }]}>{review.sentDescription}</Text>
        </TonalCard>
      </EnterView> : <EnterView index={1} style={styles.form}>
        <TextAreaField label={review.messageLabel} value={message} onChangeText={setMessage} placeholder={review.messagePlaceholder} maxLength={review.messageMaxLength} editable={!isSending} minHeight={MESSAGE_HEIGHT} helper={review.noteLabel} counter={`${arabicDigits(message.length)} / ${review.counterMaxLabel}`} />
        {sendError ? <Text accessibilityLiveRegion="assertive" style={[styles.secondary, { color: theme.colors.errorText }]}>{sendError}</Text> : null}
        <DockSurface>
          <PillButton label={isSending ? review.submittingLabel : review.submitLabel} disabled={!canSend} glow={false} onPress={send} accessibilityState={{ disabled: !canSend, busy: isSending }} />
        </DockSurface>
      </EnterView>}
    </ScrollView>
  </View>;
}

/** ‎.inp.area في S14: ١٨٠ — رسالة الدعم أطول من ردّ على قارئ. */
const MESSAGE_HEIGHT = 180;

const styles = StyleSheet.create({
  fill: { flex: 1 },
  state: { flex: 1, paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.md },
  screen: { gap: spacing.sm, paddingHorizontal: spacing.screenHorizontal, paddingBottom: spacing.screenBottom },
  // العمود لا يرث اتّجاه العربية (التطبيق بلا forceRTL)، فالرمز يُثبَّت في بداية السطر يميناً.
  heroIcon: { alignSelf: 'flex-end' },
  hero: { borderRadius: nabd.bigCardRadius, gap: spacing.xs, padding: spacing.lg },
  heroTitle: { fontFamily: fonts.bold, fontSize: typography.heroTitle, lineHeight: typography.lineHeightHeroTitle, textAlign: 'right', writingDirection: 'rtl' },
  form: { gap: spacing.sm, marginTop: spacing.xxs },
  sent: { gap: spacing.xs },
  sentHead: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.xs },
  sentTitle: { flex: 1, fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right', writingDirection: 'rtl' },
  body: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl' },
  secondary: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl' },
});
