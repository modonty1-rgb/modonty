import { useCallback, useState } from 'react';
import { useConfirm } from '@/src/components/ui/ConfirmProvider';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { ErrorState, OfflineState, SkeletonCards } from '@/src/components/ui/MobileUI';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { arabicDigits, getAudienceQuestion, sendAudienceReply } from '@/src/services/engagement-api';
import { CONNECTION_COPY, useEngagementResource } from '@/src/services/use-engagement-resource';
import { control, fonts, radii, skeleton, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/**
 * S08-reply «الرد على سؤال».
 *
 * It fetches the question itself from its id rather than receiving the row through
 * navigation, so the screen owns its own data and a cold open works.
 */

type Props = { accessToken: string; questionId: string; onBack: () => void; onSent: () => void };

export function AudienceReplyRoute({ accessToken, questionId, onBack, onSent }: Props) {
  const { theme } = useAppTheme();
  const confirm = useConfirm();
  const load = useCallback((token: string) => getAudienceQuestion(token, questionId), [questionId]);
  const { resource, reload } = useEngagementResource(accessToken, load);
  const [answer, setAnswer] = useState('');
  const [isSending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const detail = resource.data;
  const trimmed = answer.trim();
  const canSend = trimmed.length > 0 && !isSending;

  /**
   * تأكيد قبل الإرسال — الردّ علنيّ ودائم.
   *
   * كان يخرج بضغطة واحدة ثم تُغلق الشاشة بلا إشعار: يظهر للزوّار تحت المقال باسم العميل،
   * ولا مسار في المنتَج لتعديله أو حذفه. فعلٌ خارجيّ لا رجعة فيه، فيسبقه تأكيدٌ **يسمّي**
   * ما لا رجعة فيه — لا يسأل «هل أنت متأكد؟» ويترك العميل يخمّن ماذا يؤكّد.
   */
  const send = useCallback(async () => {
    if (!canSend || detail === null) return;
    const { review } = detail;
    // `tone: 'brand'` لا الافتراضي الأحمر: الأحمر لغة الحذف، والردّ على قارئك فعلٌ تريده لا تخافه.
    const approved = await confirm({ title: review.confirmTitle, description: review.confirmBody, confirmLabel: review.confirmAction, cancelLabel: review.confirmCancel, tone: 'brand' });
    if (!approved) return;
    setSending(true);
    setSendError(null);
    sendAudienceReply(accessToken, questionId, trimmed)
      .then(onSent)
      .catch((reason: unknown) => setSendError(reason instanceof Error ? reason.message : CONNECTION_COPY.errorTitle))
      .finally(() => setSending(false));
  }, [accessToken, canSend, confirm, detail, onSent, questionId, trimmed]);

  /**
   * رأس التطبيق الموحَّد — كان مبنيّاً هنا بيده، بالرجوع **يساراً** وعنوان `?? ''` غير مرئي
   * وزرّ بلا تسمية لقارئ الشاشة. صار `ScreenHeader` كبقية الشاشات المدفوعة الستّ.
   */
  const header = <ScreenHeader title={detail?.review.title ?? null} backLabel={detail?.review.backLabel ?? CONNECTION_COPY.backLabel} onBack={onBack} />;

  if (resource.status === 'loading') return <View style={styles.fill}>{header}<View style={styles.state}><SkeletonCards count={2} /></View></View>;
  if (resource.status === 'offline') return <View style={styles.fill}>{header}<View style={styles.state}><OfflineState title={CONNECTION_COPY.offlineTitle} description={CONNECTION_COPY.offlineDescription} retryLabel={CONNECTION_COPY.retryLabel} onRetry={reload} /></View></View>;
  if (resource.status === 'error' || detail === null) return <View style={styles.fill}>{header}<View style={styles.state}><ErrorState message={resource.message ?? CONNECTION_COPY.errorTitle} retryLabel={CONNECTION_COPY.retryLabel} onRetry={reload} /></View></View>;

  const { question, review } = detail;
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fill}>
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      {header}
      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        {question.name ? <Text style={[styles.name, { color: theme.colors.text }]}>{question.name}</Text> : null}
        {question.metaLine ? <Text style={[styles.meta, { color: theme.colors.muted }]}>{question.metaLine}</Text> : null}
      </View>
      <View style={[styles.card, styles.questionCard, { backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.border }]}>
        <Text style={[styles.cardLabel, { color: theme.colors.textInteractive }]}>{review.questionCardLabel}</Text>
        <Text style={[styles.question, { color: theme.colors.text }]}>{question.question}</Text>
      </View>

      {question.isAnswerable ? <>
        <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>{review.answerLabel}</Text>
        <View style={[styles.inputShell, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <TextInput
            accessibilityLabel={review.answerLabel}
            editable={!isSending}
            maxLength={review.answerMaxLength}
            multiline
            onChangeText={setAnswer}
            placeholder={review.answerPlaceholder}
            placeholderTextColor={theme.colors.inputPlaceholder}
            style={[styles.input, { backgroundColor: theme.colors.inputSurface, borderColor: theme.colors.inputBorder, color: theme.colors.text }]}
            textAlign="right"
            textAlignVertical="top"
            value={answer}
          />
          <Text style={[styles.counter, { color: theme.colors.muted }]}>{arabicDigits(answer.length)} / {review.counterMaxLabel}</Text>
        </View>
        {sendError ? <Text style={[styles.error, { color: theme.colors.errorText }]}>{sendError}</Text> : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={review.submitLabel}
          accessibilityState={{ disabled: !canSend, busy: isSending }}
          disabled={!canSend}
          onPress={send}
          style={({ pressed }) => [styles.submit, { backgroundColor: theme.colors.brandFill }, canSend ? null : styles.submitDisabled, pressed && canSend ? styles.pressed : null]}
        >
          {/* `onBrandFill` لا `navy`: قِيس navy على brandFill = **2.39:1** في الفاتح (يلزم 4.5). والتوكن موجود لهذا الغرض: 7.37:1 فاتحاً و9.91:1 داكناً. */}
          <Text style={[styles.submitLabel, { color: theme.colors.onBrandFill }]}>{isSending ? review.submittingLabel : review.submitLabel}</Text>
        </Pressable>
      </> : <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.cardLabel, { color: theme.colors.textInteractive }]}>{review.answeredLabel}</Text>
        {question.answer ? <Text style={[styles.question, { color: theme.colors.text }]}>{question.answer}</Text> : null}
      </View>}
    </ScrollView>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  state: { flex: 1, paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.md },
  screen: { paddingHorizontal: spacing.screenHorizontal, paddingBottom: spacing.screenBottom },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radii.card, padding: spacing.md, marginTop: spacing.md, alignItems: 'flex-end' },
  questionCard: { marginTop: spacing.sm },
  name: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right', writingDirection: 'rtl' },
  meta: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.xxs },
  cardLabel: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'right', writingDirection: 'rtl' },
  question: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.sm },
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
