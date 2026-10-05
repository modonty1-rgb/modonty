import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { FlashList } from '@shopify/flash-list';
import { Keyboard, Pressable, ScrollView, StyleSheet, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { ErrorState, OfflineState, SkeletonBar } from '@/src/components/ui/MobileUI';
import { EnterView, haptic, PillButton, SectionHeading, SegmentedTabs, StatusBadge, TonalCard, type BadgeTone } from '@/src/components/ui/Nabd';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { useKeyboardInset } from '@/src/components/ui/useKeyboardInset';
import { getReferralScreen, networkCopy, submitReferral, type MobileReferralRecord, type ReferralScreen, type ReferralStatusTone } from '@/src/services/account-api';
import { arabicDigits } from '@/src/services/engagement-api';
import { MobileOfflineError } from '@/src/services/mobile-api';
import { control, fonts, nabd, radii, skeleton, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type ReferralRouteProps = { accessToken: string | null; onBack: () => void };
type ReferralSection = 'how' | 'add' | 'mine';

/** نغمة الخادم ← الشارة: الانتظار تحذير · التقدّم والاكتمال إيجابي · الإغلاق خطر. */
const badgeTone: Record<ReferralStatusTone, BadgeTone> = { waiting: 'warning', progress: 'primary', done: 'positive', closed: 'danger' };

/**
 * S03 «الإحالة» — «نبض»: مجموعة مقطّعة (كيف تعمل · إضافة · إحالاتي) فوق بطل عسلي بزاوية ٢٨
 * ورمز الهدية، ثم بطاقة الخطوات بدوائر مرقّمة، والنموذج في بطاقة نغمية، والإحالات بطاقاتٍ بشارات.
 *
 * الموكب يكدّس الأقسام الثلاثة؛ أُبقي التبديل بينها — القرار السابق بثبات الرأس والمبدّل كي
 * لا يضيع العميل بين الأقسام حين يقرأ إحالاته — وأخذ شكل «نبض» المقطّع بدل الشريط القديم.
 */
export function ReferralRoute({ accessToken, onBack }: ReferralRouteProps) {
  const { theme } = useAppTheme();
  const [screen, setScreen] = useState<ReferralScreen | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setOffline] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [phone, setPhone] = useState('');
  const [candidateNote, setCandidateNote] = useState('');
  const [hasConsent, setConsent] = useState(false);
  const [activeSection, setActiveSection] = useState<ReferralSection>('how');
  const [isSubmitting, setSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const phoneInput = useRef<TextInput>(null);
  const noteInput = useRef<TextInput>(null);
  /**
   * اللوحة كانت تغطّي «إرسال بيانات العميل» (قِيس على الجهاز: الضغطة مكان الزرّ كتبت رقماً).
   * `KeyboardAvoidingView` لا يُعتمد عليه في edge-to-edge على RN 0.81 — نفس علاج بقية الحقول.
   */
  const keyboardInset = useKeyboardInset();
  const formScroll = useRef<ScrollView>(null);
  const followKeyboard = useCallback(() => { if (keyboardInset > 0) formScroll.current?.scrollToEnd({ animated: true }); }, [keyboardInset]);

  const load = useCallback(() => {
    if (!accessToken) return;
    setError(null);
    setOffline(false);
    setScreen(null);
    void getReferralScreen(accessToken)
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

  const submit = useCallback(() => {
    if (!accessToken || isSubmitting) return;
    setSubmitting(true);
    setSubmissionMessage(null);
    void submitReferral(accessToken, { candidateName, phone, candidateNote, consent: hasConsent })
      .then((result) => {
        // الإحالة الجديدة تدخل «إحالاتي» أيضاً — تحديث `lastReferral` وحده ترك القائمة فارغة بعد النجاح.
        setScreen((current) => current
          ? { ...current, referrals: [result.lastReferral, ...current.referrals] }
          : current);
        setCandidateName('');
        setPhone('');
        setCandidateNote('');
        setConsent(false);
        setSubmissionMessage({ text: result.successLabel, isError: false });
      })
      .catch((reason: unknown) => setSubmissionMessage({ text: reason instanceof Error && reason.message ? reason.message : networkCopy.loadFailed, isError: true }))
      .finally(() => setSubmitting(false));
  }, [accessToken, candidateName, candidateNote, hasConsent, isSubmitting, phone]);

  const renderReferral = useCallback(({ item }: { item: MobileReferralRecord }) => <ReferralItem item={item} />, []);
  const keyExtractor = useCallback((item: MobileReferralRecord) => item.id, []);

  if (isOffline || error !== null || screen === null) {
    return <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
      <ScreenHeader title={null} backLabel={networkCopy.backLabel} onBack={onBack} />
      {isOffline
        ? <OfflineState title={networkCopy.offlineTitle} description={networkCopy.offlineDescription} retryLabel={networkCopy.retryLabel} onRetry={load} />
        : error !== null
          ? <ErrorState message={error} retryLabel={networkCopy.retryLabel} onRetry={load} />
          : <ReferralSkeleton />}
    </ScrollView>;
  }

  const sectionPicker = <SegmentedTabs<ReferralSection>
    items={[{ key: 'how', label: screen.sections.how }, { key: 'add', label: screen.sections.add }, { key: 'mine', label: screen.sections.mine }]}
    activeKey={activeSection}
    onSelect={setActiveSection}
  />;

  /** «إحالاتي»: الرأس والمبدّل ثابتان، والقائمة تمرّر وحدها. */
  if (activeSection === 'mine') {
    return <View style={styles.fill}>
      <View style={styles.stickyHeader}>
        <ScreenHeader title={screen.screenTitle} backLabel={screen.backLabel} onBack={onBack} />
        {sectionPicker}
      </View>
      <FlashList
        data={screen.referrals}
        renderItem={renderReferral}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.referralsContent}
        ListHeaderComponent={<View style={styles.listHeading}><SectionHeading>{screen.referralsTitle}</SectionHeading></View>}
        ListEmptyComponent={<TonalCard style={styles.emptyReferrals}>
          <Text maxFontSizeMultiplier={1.2} style={[styles.sectionText, { color: theme.colors.text }]}>{screen.referralsEmptyTitle}</Text>
          <Text maxFontSizeMultiplier={1.2} style={[styles.secondary, { color: theme.colors.muted }]}>{screen.referralsEmptyDescription}</Text>
        </TonalCard>}
        showsVerticalScrollIndicator={false}
      />
    </View>;
  }

  const inputStyle = { backgroundColor: theme.colors.inputSurface, borderColor: theme.colors.inputBorder, color: theme.colors.text };

  return <View style={[styles.fill, { paddingBottom: keyboardInset }]}>
    <ScrollView ref={formScroll} onLayout={followKeyboard} contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
      <ScreenHeader title={screen.screenTitle} backLabel={screen.backLabel} onBack={onBack} />
      {sectionPicker}

      {activeSection === 'how' ? <>
        <EnterView index={0}>
          <TonalCard tone="warning" style={styles.hero}>
            <View style={styles.heroIcon}><ModontyIcon name="offers" size={control.iconSize} primary={theme.colors.onWarningContainer} accent={theme.colors.accent} /></View>
            <Text style={[styles.heroTitle, { color: theme.colors.onWarningContainer }]}>{screen.title}</Text>
            <Text style={[styles.secondary, { color: theme.colors.onWarningContainer }]}>{screen.description}</Text>
          </TonalCard>
        </EnterView>
        <EnterView index={1}>
          <TonalCard style={styles.steps}>
            <SectionHeading>{screen.stepsTitle}</SectionHeading>
            {screen.steps.map((step, index) => <View key={step} style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: theme.colors.secondary }]}>
                <Text maxFontSizeMultiplier={1} style={[styles.stepNumberText, { color: theme.colors.onSecondary }]}>{arabicDigits(index + 1)}</Text>
              </View>
              <Text maxFontSizeMultiplier={1.2} style={[styles.stepText, { color: theme.colors.text }]}>{step}</Text>
            </View>)}
          </TonalCard>
        </EnterView>
      </> : <>
        {/* الضغط على فراغ البطاقة يُغلق اللوحة — `accessible={false}` كي لا يبتلع الغلاف تسميات الحقول. */}
        <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
          <View>
            <TonalCard style={styles.form}>
              <SectionHeading>{screen.formTitle}</SectionHeading>
              <Text maxFontSizeMultiplier={1.2} style={[styles.fieldLabel, { color: theme.colors.text }]}>{screen.nameLabel}</Text>
              <TextInput value={candidateName} onChangeText={(next) => { setCandidateName(next); if (submissionMessage?.isError) setSubmissionMessage(null); }} accessibilityLabel={screen.nameLabel} returnKeyType="next" submitBehavior="submit" onSubmitEditing={() => phoneInput.current?.focus()} placeholder={screen.namePlaceholder} placeholderTextColor={theme.colors.inputPlaceholder} style={[styles.input, styles.rtlInput, inputStyle]} textAlign="right" />
              <Text maxFontSizeMultiplier={1.2} style={[styles.fieldLabel, { color: theme.colors.text }]}>{screen.phoneLabel}</Text>
              {/* الحقل نفسه يحمل الرفض، لا السطر تحت البطاقة وحده — العين على الحقل الذي مُلئ للتوّ. */}
              <TextInput ref={phoneInput} returnKeyType="next" submitBehavior="submit" onSubmitEditing={() => noteInput.current?.focus()} value={phone} onChangeText={(next) => { setPhone(next); if (submissionMessage?.isError) setSubmissionMessage(null); }} accessibilityLabel={screen.phoneLabel} placeholder={screen.phonePlaceholder} placeholderTextColor={theme.colors.inputPlaceholder} keyboardType="phone-pad" textContentType="telephoneNumber" style={[styles.input, styles.ltrInput, inputStyle, submissionMessage?.isError ? { borderColor: theme.colors.errorText } : null]} textAlign="left" />
              <Text maxFontSizeMultiplier={1.2} style={[styles.secondary, { color: theme.colors.muted }]}>{screen.phoneFormatLabel}</Text>
              <Text maxFontSizeMultiplier={1.2} style={[styles.fieldLabel, { color: theme.colors.text }]}>{screen.noteLabel}</Text>
              <TextInput ref={noteInput} value={candidateNote} onChangeText={setCandidateNote} accessibilityLabel={screen.noteLabel} placeholder={screen.notePlaceholder} placeholderTextColor={theme.colors.inputPlaceholder} multiline style={[styles.input, styles.rtlInput, styles.noteInput, inputStyle]} textAlign="right" />
              <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: hasConsent }} accessibilityLabel={screen.consentLabel} onPress={() => { haptic('selection'); setConsent((checked) => !checked); }} style={({ pressed }) => [styles.consentRow, pressed && styles.pressed]}>
                {/* الحالتان تعبران ٣:١ من التوكنز — كان غير المؤشَّر ١٫٣٨:١ فالموافقة غير مرئية. */}
                <View style={[styles.checkbox, { borderColor: hasConsent ? theme.colors.brandFill : theme.colors.inputBorder, backgroundColor: hasConsent ? theme.colors.brandFill : theme.colors.inputSurface }]}>{hasConsent ? <ModontyIcon name="check" size={control.iconSize - spacing.xxs} primary={theme.colors.onBrandFill} accent={theme.colors.onBrandFill} /> : null}</View>
                <Text maxFontSizeMultiplier={1.2} style={[styles.consent, { color: theme.colors.text }]}>{screen.consentLabel}</Text>
              </Pressable>
              <Text maxFontSizeMultiplier={1.2} style={[styles.secondary, { color: theme.colors.muted }]}>{screen.consentDescription}</Text>
            </TonalCard>
          </View>
        </TouchableWithoutFeedback>
        {/* النتيجة رمز + نصّ + لون، ثلاثتها (UIUX §٢). */}
        {submissionMessage ? <View accessibilityLiveRegion="polite" style={styles.submissionRow}>
          <ModontyIcon name={submissionMessage.isError ? 'error' : 'check'} size={control.iconSize} primary={submissionMessage.isError ? theme.colors.errorText : theme.colors.textInteractive} accent={theme.colors.accent} />
          <Text maxFontSizeMultiplier={1.2} style={[styles.submissionMessage, { color: submissionMessage.isError ? theme.colors.errorText : theme.colors.textInteractive }]}>{submissionMessage.text}</Text>
        </View> : null}
        <PillButton disabled={isSubmitting || !hasConsent || candidateName.trim().length === 0 || phone.trim().length === 0} label={isSubmitting ? screen.submittingLabel : screen.submitLabel} onPress={submit} />
      </>}
    </ScrollView>
  </View>;
}

const ReferralItem = memo(function ReferralItem({ item }: { item: MobileReferralRecord }) {
  const { theme } = useAppTheme();
  return <TonalCard style={styles.referralItem}>
    <View style={styles.referralHead}>
      <Text maxFontSizeMultiplier={1.2} style={[styles.referralName, { color: theme.colors.text }]}>{item.name}</Text>
      {/* النغمة من الخادم — الشاشة لا تعرف أنّ CONTACTED «تقدّم» وREWARDED «اكتمال». */}
      <StatusBadge label={item.statusLabel} tone={badgeTone[item.statusTone]} />
    </View>
    {item.note ? <Text maxFontSizeMultiplier={1.2} style={[styles.secondary, { color: theme.colors.muted }]}>{item.note}</Text> : null}
    {/* سبب الإغلاق يصل صاحب الإحالة — «اعتذر العميل» بلا سبب لا يكفي. */}
    {item.closingNote ? <Text maxFontSizeMultiplier={1.2} style={[styles.secondary, { color: theme.colors.muted }]}>{item.closingNote}</Text> : null}
    {/* «متى تحرّكت» متى وُجد، وإلا «متى أرسلتها» — الختمان معاً يربكان. */}
    <Text maxFontSizeMultiplier={1.2} style={[styles.secondary, { color: theme.colors.muted }]}>{item.stageAtLabel ?? item.sentAtLabel}</Text>
  </TonalCard>;
});

function ReferralSkeleton() {
  return <View accessibilityLabel="جاري التحميل" style={styles.skeletonStack}>
    <SkeletonBar height={control.minTouchTarget} radius={nabd.pill} />
    <SkeletonBar height={skeleton.cardHeight} radius={nabd.bigCardRadius} />
    <SkeletonBar height={skeleton.blockHeight} radius={nabd.cardRadius} />
  </View>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  pressed: { opacity: 0.72 },
  screen: { gap: spacing.sm, paddingBottom: spacing.screenBottom, paddingHorizontal: spacing.screenHorizontal },
  stickyHeader: { gap: spacing.sm, paddingHorizontal: spacing.screenHorizontal },
  referralsContent: { paddingBottom: spacing.screenBottom, paddingHorizontal: spacing.screenHorizontal },
  listHeading: { marginBottom: spacing.xs, marginTop: spacing.md },
  // العمود لا يرث اتّجاه العربية (التطبيق بلا forceRTL)، فالرمز يُثبَّت في بداية السطر يميناً.
  heroIcon: { alignSelf: 'flex-end' },
  hero: { borderRadius: nabd.bigCardRadius, gap: spacing.xs, padding: spacing.lg },
  heroTitle: { fontFamily: fonts.bold, fontSize: typography.heroTitle, lineHeight: typography.lineHeightHeroTitle, textAlign: 'right', writingDirection: 'rtl' },
  steps: { gap: spacing.sm },
  step: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.sm },
  stepNumber: { alignItems: 'center', borderRadius: nabd.pill, height: spacing.xxl, justifyContent: 'center', width: spacing.xxl },
  stepNumberText: { fontFamily: fonts.bold, fontSize: typography.label, lineHeight: typography.lineHeightLabel },
  stepText: { flex: 1, fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'right', writingDirection: 'rtl' },
  form: { gap: spacing.xs },
  fieldLabel: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, marginTop: spacing.xs, textAlign: 'right', writingDirection: 'rtl' },
  input: { borderRadius: radii.field, borderWidth: control.inputBorderWidth, fontFamily: fonts.regular, fontSize: typography.body, minHeight: control.inputHeight, paddingHorizontal: spacing.md },
  rtlInput: { writingDirection: 'rtl' },
  ltrInput: { writingDirection: 'ltr' },
  // صندوق سطر واحد لا يدعو لملاحظة؛ ثلاثة أسطر تقول «اكتب» بلا كلمة.
  noteInput: { lineHeight: typography.lineHeightBody, minHeight: control.minTouchTarget * 2, paddingVertical: spacing.xs, textAlignVertical: 'top' },
  consentRow: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.sm, marginTop: spacing.xs, minHeight: control.minTouchTarget },
  checkbox: { alignItems: 'center', borderRadius: spacing.xs, borderWidth: control.inputBorderWidth, height: control.iconSize + spacing.xxs, justifyContent: 'center', width: control.iconSize + spacing.xxs },
  consent: { flex: 1, fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl' },
  submissionRow: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.xs },
  submissionMessage: { flex: 1, fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl' },
  emptyReferrals: { gap: spacing.xs },
  sectionText: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right', writingDirection: 'rtl' },
  referralItem: { gap: spacing.xxs, marginBottom: spacing.sm },
  referralHead: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.sm, justifyContent: 'space-between' },
  referralName: { flex: 1, fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl' },
  secondary: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl' },
  skeletonStack: { gap: spacing.sm },
});
