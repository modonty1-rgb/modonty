import { useCallback, useRef, useState } from 'react';
import { useConfirm } from '@/src/components/ui/ConfirmProvider';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useKeyboardInset } from '@/src/components/ui/useKeyboardInset';
import { AppText as Text } from '@/src/components/ui/AppText';
import { rtlLine } from '@/src/components/ui/bidi';
import { DockSurface, EnterView, PillButton, TextAreaField, TonalCard } from '@/src/components/ui/Nabd';
import { ErrorState, OfflineState, SkeletonCards } from '@/src/components/ui/MobileUI';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { arabicDigits, getAudienceQuestion, sendAudienceReply } from '@/src/services/engagement-api';
import { CONNECTION_COPY, useEngagementResource } from '@/src/services/use-engagement-resource';
import { MobileOfflineError } from '@/src/services/mobile-api';
import { fonts, spacing, typography } from '@/src/theme/tokens';
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
  const { resource, reload, refresh } = useEngagementResource(accessToken, load);
  const [answer, setAnswer] = useState('');
  const [isSending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const keyboardInset = useKeyboardInset();
  const scrollRef = useRef<ScrollView>(null);
  // الحقل وزرّ الإرسال آخر المحتوى: لمّا تنفتح اللوحة ويقصر العرض فعلاً (onLayout)، ينزل التمرير إليهما.
  const followKeyboard = useCallback(() => { if (keyboardInset > 0) scrollRef.current?.scrollToEnd({ animated: true }); }, [keyboardInset]);

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
      .catch((reason: unknown) => {
        setSendError(reason instanceof Error && reason.message ? reason.message : CONNECTION_COPY.errorTitle);
        // الخادم يرد ٤٠٩ لسؤالٍ حُسم من مكان آخر — نعيد قراءته بصمت فتظهر حالته الحقيقية.
        if (!(reason instanceof MobileOfflineError)) refresh();
      })
      .finally(() => setSending(false));
  }, [accessToken, canSend, confirm, detail, onSent, questionId, refresh, trimmed]);

  /**
   * رأس التطبيق الموحَّد — كان مبنيّاً هنا بيده، بالرجوع **يساراً** وعنوان `?? ''` غير مرئي
   * وزرّ بلا تسمية لقارئ الشاشة. صار `ScreenHeader` كبقية الشاشات المدفوعة الستّ.
   */
  const header = <ScreenHeader title={detail?.review.title ?? null} backLabel={detail?.review.backLabel ?? CONNECTION_COPY.backLabel} onBack={onBack} />;

  if (resource.status === 'loading') return <View style={styles.fill}>{header}<View style={styles.state}><SkeletonCards count={2} /></View></View>;
  if (resource.status === 'offline') return <View style={styles.fill}>{header}<View style={styles.state}><OfflineState title={CONNECTION_COPY.offlineTitle} description={CONNECTION_COPY.offlineDescription} retryLabel={CONNECTION_COPY.retryLabel} onRetry={reload} /></View></View>;
  if (resource.status === 'error' || detail === null) return <View style={styles.fill}>{header}<View style={styles.state}><ErrorState message={resource.message ?? CONNECTION_COPY.errorTitle} retryLabel={CONNECTION_COPY.retryLabel} onRetry={reload} /></View></View>;

  const { question, review } = detail;
  /**
   * «نبض» (S08-reply): سطح نغمي `surfaceRaised` يحمل السؤال وصاحبه معاً — كانا بطاقتين بحدّ —
   * ثم حقل الرد، ثم زرّ الإرسال على لوح الفعل (‎.dock-glass) آخر المحتوى.
   */
  const askedBy = [question.name, question.metaLine].filter((part): part is string => Boolean(part)).join(' · ');
  return <View style={[styles.fill, { paddingBottom: keyboardInset }]}>
    <ScrollView ref={scrollRef} onLayout={followKeyboard} contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      {header}
      <EnterView index={0}>
        <TonalCard tone="raised" style={styles.questionCard}>
          <Text style={[styles.secondary, { color: theme.colors.muted }]}>{review.questionCardLabel}</Text>
          <Text style={[styles.question, { color: theme.colors.text }]}>{question.question}</Text>
          {askedBy ? <Text numberOfLines={2} style={[styles.secondary, { color: theme.colors.muted }]}>{rtlLine(askedBy)}</Text> : null}
        </TonalCard>
      </EnterView>

      {question.isAnswerable ? <EnterView index={1} style={styles.form}>
        <TextAreaField label={review.answerLabel} value={answer} onChangeText={setAnswer} placeholder={review.answerPlaceholder} maxLength={review.answerMaxLength} editable={!isSending} minHeight={MIN_ANSWER_HEIGHT} counter={`${arabicDigits(answer.length)} / ${review.counterMaxLabel}`} />
        {sendError ? <Text accessibilityLiveRegion="assertive" style={[styles.secondary, { color: theme.colors.errorText }]}>{sendError}</Text> : null}
        <DockSurface>
          <PillButton label={isSending ? review.submittingLabel : review.submitLabel} disabled={!canSend} glow={false} onPress={() => void send()} accessibilityState={{ disabled: !canSend, busy: isSending }} />
        </DockSurface>
      </EnterView> : <TonalCard tone="positive" style={styles.answered}>
        <Text style={[styles.label, { color: theme.colors.onPositiveContainer }]}>{review.answeredLabel}</Text>
        {question.answer ? <Text style={[styles.body, { color: theme.colors.onPositiveContainer }]}>{question.answer}</Text> : null}
      </TonalCard>}
    </ScrollView>
  </View>;
}

/** ‎.inp.area في الموكب: ١٣٢ لا ١١٢ — مساحة تقول «اكتب ردّاً» لا «اكتب كلمة». */
const MIN_ANSWER_HEIGHT = 132;

const styles = StyleSheet.create({
  fill: { flex: 1 },
  state: { flex: 1, paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.md },
  screen: { gap: spacing.sm, paddingHorizontal: spacing.screenHorizontal, paddingBottom: spacing.screenBottom },
  questionCard: { gap: spacing.xs },
  form: { gap: spacing.sm, marginTop: spacing.xxs },
  answered: { gap: spacing.xs },
  secondary: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl' },
  question: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right', writingDirection: 'rtl' },
  label: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'right', writingDirection: 'rtl' },
  body: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl' },
});
