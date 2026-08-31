import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ErrorState, OfflineState, SkeletonCards } from '@/src/components/ui/MobileUI';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { arabicDigits, getSupportReview, sendSupportMessage } from '@/src/services/engagement-api';
import { CONNECTION_COPY, useEngagementResource } from '@/src/services/use-engagement-resource';
import { control, fonts, radii, spacing, typography } from '@/src/theme/tokens';
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

  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fill}>
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <ScreenHeader title={review.title} backLabel={review.backLabel} onBack={onDone} />

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{review.heroTitle}</Text>
        <Text style={[styles.cardBody, { color: theme.colors.muted }]}>{review.heroDescription}</Text>
      </View>

      {isSent ? <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.textInteractive }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{review.sentTitle}</Text>
        <Text style={[styles.cardBody, { color: theme.colors.muted }]}>{review.sentDescription}</Text>
      </View> : <>
        <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>{review.messageLabel}</Text>
        <View style={[styles.inputShell, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <TextInput
            accessibilityLabel={review.messageLabel}
            editable={!isSending}
            maxLength={review.messageMaxLength}
            multiline
            onChangeText={setMessage}
            placeholder={review.messagePlaceholder}
            placeholderTextColor={theme.colors.inputPlaceholder}
            style={[styles.input, { backgroundColor: theme.colors.inputSurface, borderColor: theme.colors.inputBorder, color: theme.colors.text }]}
            textAlign="right"
            textAlignVertical="top"
            value={message}
          />
          <Text style={[styles.counter, { color: theme.colors.muted }]}>{arabicDigits(message.length)} / {review.counterMaxLabel}</Text>
        </View>
        {sendError ? <Text style={[styles.error, { color: theme.colors.errorText }]}>{sendError}</Text> : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={review.submitLabel}
          accessibilityState={{ disabled: !canSend, busy: isSending }}
          disabled={!canSend}
          onPress={send}
          style={({ pressed }) => [styles.submit, { backgroundColor: theme.colors.primary }, canSend ? null : styles.submitDisabled, pressed && canSend ? styles.pressed : null]}
        >
          <Text style={[styles.submitLabel, { color: theme.colors.textOnPrimary }]}>{isSending ? review.submittingLabel : review.submitLabel}</Text>
        </Pressable>
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.cardBody, { color: theme.colors.muted }]}>{review.noteLabel}</Text>
        </View>
      </>}
    </ScrollView>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  state: { flex: 1, paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.md },
  screen: { paddingHorizontal: spacing.screenHorizontal, paddingBottom: spacing.screenBottom },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radii.card, padding: spacing.md, marginTop: spacing.lg, alignItems: 'flex-end' },
  cardTitle: { fontFamily: fonts.medium, fontSize: typography.pageTitle, lineHeight: typography.lineHeightPageTitle, textAlign: 'right', writingDirection: 'rtl' },
  cardBody: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.xxs },
  fieldLabel: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.xl },
  inputShell: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radii.card, padding: spacing.md, marginTop: spacing.xs },
  // WCAG 1.4.11: حدّ عنصر التحكّم 3:1. كان الحقل بلا حدّ ولا خلفية فلا يُقرأ حقلاً أصلاً.
  input: { borderColor: 'transparent', borderRadius: radii.field, borderWidth: control.inputBorderWidth, fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, minHeight: control.buttonHeight * 2, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, writingDirection: 'rtl' },
  counter: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'left', writingDirection: 'ltr', marginTop: spacing.xs },
  error: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.xs },
  submit: { minHeight: control.buttonHeight, borderRadius: radii.button, alignItems: 'center', justifyContent: 'center', marginTop: spacing.md },
  submitDisabled: { opacity: 0.5 },
  pressed: { opacity: 0.72 },
  submitLabel: { fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, writingDirection: 'rtl' },
});
