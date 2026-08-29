import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { FlashList } from '@shopify/flash-list';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { ErrorState, OfflineState, SkeletonBar } from '@/src/components/ui/MobileUI';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { getReferralScreen, networkCopy, submitReferral, type MobileReferralRecord, type ReferralScreen } from '@/src/services/account-api';
import { MobileOfflineError } from '@/src/services/mobile-api';
import { control, fonts, radii, skeleton, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type ReferralRouteProps = { accessToken: string | null; onBack: () => void };
type ReferralSection = 'how' | 'add' | 'mine';

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
        // The new row has to enter «إحالاتي» too — updating `lastReferral` alone left the
        // list showing its empty state right after a successful submit.
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

  const sectionPicker = <ReferralSectionPicker activeSection={activeSection} labels={screen.sections} onChange={setActiveSection} />;

  /**
   * الرأس ومبدّل الأقسام ثابتان، والقائمة تمرّر وحدها.
   *
   * كانا داخل `ListHeaderComponent` فيمرّان مع الصفوف ويختفيان — فيفقد العميل طريقه بين
   * الأقسام الثلاثة لحظة ما يبدأ يقرأ إحالاته. القائمة الآن تأخذ ما تبقّى من الشاشة بـ`flex`.
   */
  if (activeSection === 'mine') {
    return <View style={styles.fill}>
    <View style={styles.stickyHeader}>
    <ScreenHeader title={screen.screenTitle} backLabel={screen.backLabel} onBack={onBack} />
    {sectionPicker}
    <Text maxFontSizeMultiplier={1} style={[styles.referralsTitle, { color: theme.colors.text }]}>{screen.referralsTitle}</Text>
    </View>
    <FlashList
      data={screen.referrals}
      renderItem={renderReferral}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.referralsContent}
      ListEmptyComponent={<View style={[styles.emptyReferrals, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceRaised }]}>
        <Text maxFontSizeMultiplier={1} style={[styles.emptyReferralTitle, { color: theme.colors.text }]}>{screen.referralsEmptyTitle}</Text>
        <Text maxFontSizeMultiplier={1} style={[styles.emptyReferralDescription, { color: theme.colors.muted }]}>{screen.referralsEmptyDescription}</Text>
      </View>}
      showsVerticalScrollIndicator={false}
    />
    </View>;
  }

  /**
   * The keyboard used to cover «إرسال بيانات العميل» outright: the phone field sits mid-screen,
   * the button below it, and the numeric pad took the bottom half. Measured on the device —
   * a tap where the button had been landed on the keypad and typed a digit into the field.
   */
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.fill}>
    <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
    <ScreenHeader title={screen.screenTitle} backLabel={screen.backLabel} onBack={onBack} />
    {sectionPicker}

    {activeSection === 'how' ? <>
    <View style={[styles.campaign, { backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.warning }]}>
      <Text maxFontSizeMultiplier={1} style={[styles.campaignTitle, { color: theme.colors.text }]}>{screen.title}</Text>
      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
      <Text maxFontSizeMultiplier={1} style={[styles.description, { color: theme.colors.text }]}>{screen.description}</Text>
    </View>

    <Text maxFontSizeMultiplier={1} style={[styles.stepsTitle, { color: theme.colors.text }]}>{screen.stepsTitle}</Text>
    <View style={[styles.steps, { backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.border }]}>
      {screen.steps.map((step, index) => <View key={step} style={[styles.step, index > 0 && { borderTopColor: theme.colors.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
        <View style={[styles.stepNumber, { backgroundColor: theme.colors.brandFill }]}>
          <Text maxFontSizeMultiplier={1} style={[styles.stepNumberText, { color: theme.colors.navy }]}>{index + 1}</Text>
        </View>
        <Text maxFontSizeMultiplier={1} style={[styles.stepText, { color: theme.colors.text }]}>{step}</Text>
      </View>)}
    </View>
    </> : <>

    {/* الضغط على فراغ البطاقة يُغلق الكيبورد — النمط الموثَّق في مستندات KeyboardAvoidingView.
        `accessible={false}` كي لا يبتلع الغلاف تسميات الحقول عن قارئ الشاشة. */}
    <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
    <View style={[styles.form, { backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.border }]}>
      <Text maxFontSizeMultiplier={1} style={[styles.formTitle, { color: theme.colors.text }]}>{screen.formTitle}</Text>
      <Text maxFontSizeMultiplier={1} style={[styles.fieldLabel, { color: theme.colors.muted }]}>{screen.nameLabel}</Text>
      <TextInput value={candidateName} onChangeText={(next) => { setCandidateName(next); if (submissionMessage?.isError) setSubmissionMessage(null); }} accessibilityLabel={screen.nameLabel} returnKeyType="next" submitBehavior="submit" onSubmitEditing={() => phoneInput.current?.focus()} placeholder={screen.namePlaceholder} placeholderTextColor={theme.colors.inputPlaceholder} style={[styles.nameInput, { backgroundColor: theme.colors.inputSurface, borderColor: theme.colors.inputBorder, color: theme.colors.text }]} textAlign="right" />
      <Text maxFontSizeMultiplier={1} style={[styles.fieldLabel, { color: theme.colors.muted }]}>{screen.phoneLabel}</Text>
      {/* The field itself carries the rejection, not only the line below the card — the user's
          eye is on the input they just filled, and the server is the only judge of the format. */}
      <TextInput ref={phoneInput} returnKeyType="next" submitBehavior="submit" onSubmitEditing={() => noteInput.current?.focus()} value={phone} onChangeText={(next) => { setPhone(next); if (submissionMessage?.isError) setSubmissionMessage(null); }} accessibilityLabel={screen.phoneLabel} placeholder={screen.phonePlaceholder} placeholderTextColor={theme.colors.inputPlaceholder} keyboardType="phone-pad" textContentType="telephoneNumber" style={[styles.input, { backgroundColor: theme.colors.inputSurface, borderColor: submissionMessage?.isError ? theme.colors.errorText : theme.colors.inputBorder, color: theme.colors.text }]} textAlign="left" />
      <Text maxFontSizeMultiplier={1} style={[styles.phoneFormat, { color: theme.colors.muted }]}>{screen.phoneFormatLabel}</Text>
      <Text maxFontSizeMultiplier={1} style={[styles.fieldLabel, { color: theme.colors.muted }]}>{screen.noteLabel}</Text>
      <TextInput ref={noteInput} value={candidateNote} onChangeText={setCandidateNote} accessibilityLabel={screen.noteLabel} placeholder={screen.notePlaceholder} placeholderTextColor={theme.colors.inputPlaceholder} multiline style={[styles.noteInput, { backgroundColor: theme.colors.inputSurface, borderColor: theme.colors.inputBorder, color: theme.colors.text }]} textAlign="right" />
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: hasConsent }} accessibilityLabel={screen.consentLabel} onPress={() => setConsent((checked) => !checked)} style={({ pressed }) => [styles.consentRow, pressed && styles.pressed]}>
        {/* غير المؤشَّر كان حدّه `border` = 1.38:1 داكناً و1.18:1 فاتحاً، والمؤشَّر في الفاتح
            1.58:1 — أي أنّ الموافقة كانت غير مرئية. الحالتان الآن تعبران 3:1 من التوكنز. */}
        <View style={[styles.checkbox, { borderColor: hasConsent ? theme.colors.brandFill : theme.colors.inputBorder, backgroundColor: hasConsent ? theme.colors.brandFill : theme.colors.inputSurface }]}>{hasConsent ? <ModontyIcon name="check" size={control.iconSize} primary={theme.colors.onBrandFill} accent={theme.colors.onBrandFill} /> : null}</View>
        <Text maxFontSizeMultiplier={1} style={[styles.consent, { color: theme.colors.text }]}>{screen.consentLabel}</Text>
      </Pressable>
      <Text maxFontSizeMultiplier={1} style={[styles.consentDescription, { color: theme.colors.muted }]}>{screen.consentDescription}</Text>
    </View>
    </TouchableWithoutFeedback>
    {/* Colour alone must not carry the outcome (UIUX §2): symbol + text + colour, all three. */}
    {submissionMessage ? <View style={styles.submissionRow}>
      <ModontyIcon name={submissionMessage.isError ? 'error' : 'check'} size={control.iconSize} primary={submissionMessage.isError ? theme.colors.errorText : theme.colors.textInteractive} accent={theme.colors.accent} />
      <Text maxFontSizeMultiplier={1} style={[styles.submissionMessage, { color: submissionMessage.isError ? theme.colors.errorText : theme.colors.textInteractive }]}>{submissionMessage.text}</Text>
    </View> : null}
    <PrimaryButton disabled={isSubmitting || !hasConsent || candidateName.trim().length === 0 || phone.trim().length === 0} label={isSubmitting ? screen.submittingLabel : screen.submitLabel} onPress={submit} style={styles.submit} />
    </>}
    </ScrollView>
  </KeyboardAvoidingView>;
}

function ReferralSectionPicker({ activeSection, labels, onChange }: { activeSection: ReferralSection; labels: ReferralScreen['sections']; onChange: (section: ReferralSection) => void }) {
  const { theme } = useAppTheme();
  const sections: { key: ReferralSection; label: string }[] = [
    { key: 'how', label: labels.how },
    { key: 'add', label: labels.add },
    { key: 'mine', label: labels.mine },
  ];
  return <View style={[styles.sectionPicker, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceRaised }]}>
    {sections.map((section) => {
      const selected = section.key === activeSection;
      // UIUX §7: every press answers within 100ms — opacity is the cheap, thread-safe signal.
      return <Pressable key={section.key} accessibilityRole="tab" accessibilityState={{ selected }} accessibilityLabel={section.label} onPress={() => onChange(section.key)} style={({ pressed }) => [styles.sectionTab, selected && { backgroundColor: theme.colors.primary }, pressed && styles.pressed]}>
        <Text maxFontSizeMultiplier={1} style={[styles.sectionTabLabel, { color: selected ? theme.colors.textOnPrimary : theme.colors.muted }]}>{section.label}</Text>
      </Pressable>;
    })}
  </View>;
}

const ReferralItem = memo(function ReferralItem({ item }: { item: MobileReferralRecord }) {
  const { theme } = useAppTheme();
  // النغمة تأتي من الخادم — الشاشة لا تعرف أنّ CONTACTED «تقدّم» وREWARDED «اكتمال».
  const statusColor = item.statusTone === 'closed' ? theme.colors.errorText
    : item.statusTone === 'waiting' ? theme.colors.warning
      : item.statusTone === 'progress' ? theme.colors.statusProgress
        : theme.colors.textInteractive;
  return <View style={[styles.referralItem, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceRaised }]}>
    <View style={styles.referralItemHeader}>
      <Text maxFontSizeMultiplier={1} style={[styles.referralItemName, { color: theme.colors.text }]}>{item.name}</Text>
      <Text maxFontSizeMultiplier={1} style={[styles.referralItemStatus, { color: statusColor }]}>{item.statusLabel}</Text>
    </View>
    {item.note ? <Text maxFontSizeMultiplier={1} style={[styles.referralItemNote, { color: theme.colors.muted }]}>{item.note}</Text> : null}
    {/* سبب الإغلاق كان يُكتب في الأدمن ولا يصل صاحب الإحالة — «اعتذر العميل» بلا سبب. */}
    {item.closingNote ? <Text maxFontSizeMultiplier={1} style={[styles.referralItemNote, { color: theme.colors.muted }]}>{item.closingNote}</Text> : null}
    {/* «متى تحرّكت» متى وُجد، وإلا «متى أرسلتها» — الختمان معاً يربكان. */}
    <Text maxFontSizeMultiplier={1} style={[styles.referralItemSentAt, { color: theme.colors.muted }]}>{item.stageAtLabel ?? item.sentAtLabel}</Text>
  </View>;
});

function ReferralSkeleton() {
  const { theme } = useAppTheme();
  return <View accessibilityLabel="جاري التحميل" style={styles.skeletonStack}>
    <View style={[styles.skeletonCard, { backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.border }]}>
      <SkeletonBar height={skeleton.titleHeight} />
      <SkeletonBar height={skeleton.lineHeight} />
      <SkeletonBar height={skeleton.lineHeight} />
    </View>
    <View style={[styles.skeletonCard, { backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.border }]}>
      <SkeletonBar height={skeleton.titleHeight} />
      <SkeletonBar height={skeleton.lineHeight} />
      <SkeletonBar height={control.inputHeight} radius={radii.field} />
      <SkeletonBar height={skeleton.lineHeight} />
    </View>
    <SkeletonBar height={control.buttonHeight} radius={radii.button} />
    <View style={[styles.skeletonCard, { backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.border }]}>
      <SkeletonBar height={skeleton.titleHeight} />
      <SkeletonBar height={control.minTouchTarget} radius={radii.field} />
      <SkeletonBar height={control.minTouchTarget} radius={radii.field} />
      <SkeletonBar height={control.minTouchTarget} radius={radii.field} />
    </View>
  </View>;
}

const styles = StyleSheet.create({
  screen: { paddingBottom: spacing.screenBottom, paddingHorizontal: spacing.screenHorizontal },
  title: { fontFamily: fonts.medium, fontSize: typography.pageTitle, lineHeight: typography.lineHeightPageTitle, textAlign: 'right', writingDirection: 'rtl' },
  sectionPicker: { borderRadius: radii.field, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row-reverse', marginTop: spacing.sm, padding: spacing.xxs },
  sectionTab: { alignItems: 'center', borderRadius: radii.field, flex: 1, justifyContent: 'center', minHeight: control.minTouchTarget, paddingHorizontal: spacing.xs },
  // A text-only segmented control is a label, not a tab-bar caption: 11sp is sized to sit
  // under an icon, and this control is the screen's whole navigation.
  sectionTabLabel: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'center', writingDirection: 'rtl' },
  pressed: { opacity: 0.72 },
  // الرأس الثابت يحمل حشو الحافة بنفسه بعدما خرج من حاوية القائمة.
  stickyHeader: { paddingHorizontal: spacing.screenHorizontal },
  fill: { flex: 1 },
  referralsContent: { paddingBottom: spacing.screenBottom, paddingHorizontal: spacing.screenHorizontal },
  referralsTitle: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, marginTop: spacing.xl, textAlign: 'right', writingDirection: 'rtl' },
  emptyReferrals: { borderRadius: radii.card, borderWidth: StyleSheet.hairlineWidth, marginTop: spacing.sm, padding: spacing.md },
  emptyReferralTitle: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right', writingDirection: 'rtl' },
  emptyReferralDescription: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, marginTop: spacing.xs, textAlign: 'right', writingDirection: 'rtl' },
  referralItem: { borderRadius: radii.card, borderWidth: StyleSheet.hairlineWidth, marginTop: spacing.sm, padding: spacing.md },
  referralItemHeader: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.sm, justifyContent: 'space-between' },
  referralItemName: { flex: 1, fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl' },
  referralItemStatus: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'left', writingDirection: 'rtl' },
  referralItemNote: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, marginTop: spacing.xs, textAlign: 'right', writingDirection: 'rtl' },
  referralItemSentAt: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, marginTop: spacing.xs, textAlign: 'right', writingDirection: 'rtl' },
  skeletonStack: { gap: spacing.sm, marginTop: spacing.xl },
  skeletonCard: { borderRadius: radii.card, borderWidth: StyleSheet.hairlineWidth, gap: spacing.sm, padding: spacing.md },
  campaign: { borderRadius: radii.card, borderWidth: StyleSheet.hairlineWidth, marginTop: spacing.xl, padding: spacing.md },
  campaignTitle: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right', writingDirection: 'rtl' },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: spacing.md },
  description: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl' },
  form: { borderRadius: radii.card, borderWidth: StyleSheet.hairlineWidth, marginTop: spacing.sm, padding: spacing.md },
  formTitle: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right', writingDirection: 'rtl' },
  fieldLabel: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, marginTop: spacing.xs, textAlign: 'right', writingDirection: 'rtl' },
  nameInput: { borderRadius: radii.field, borderWidth: control.inputBorderWidth, fontFamily: fonts.regular, fontSize: typography.body, height: control.inputHeight, marginTop: spacing.xs, paddingHorizontal: spacing.md, writingDirection: 'rtl' },
  input: { borderRadius: radii.field, borderWidth: control.inputBorderWidth, fontFamily: fonts.regular, fontSize: typography.body, height: control.inputHeight, marginTop: spacing.xs, paddingHorizontal: spacing.md, writingDirection: 'ltr' },
  phoneFormat: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, marginTop: spacing.xs, textAlign: 'right', writingDirection: 'rtl' },
  // A one-line box does not invite a note. Three lines say «اكتب» without a word.
  noteInput: { borderRadius: radii.field, borderWidth: control.inputBorderWidth, fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, marginTop: spacing.xs, minHeight: control.minTouchTarget * 2, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, textAlignVertical: 'top', writingDirection: 'rtl' },
  consentRow: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.sm, marginTop: spacing.md, minHeight: control.minTouchTarget },
  checkbox: { alignItems: 'center', borderRadius: radii.field, borderWidth: StyleSheet.hairlineWidth, height: control.iconSize + spacing.xs, justifyContent: 'center', width: control.iconSize + spacing.xs },
  consent: { flex: 1, fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl' },
  consentDescription: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl' },
  submissionRow: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.xs, marginTop: spacing.md },
  submissionMessage: { flex: 1, fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl' },
  submit: { marginTop: spacing.md },
  stepsTitle: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, marginTop: spacing.xl, textAlign: 'right', writingDirection: 'rtl' },
  steps: { borderRadius: radii.card, borderWidth: StyleSheet.hairlineWidth, marginTop: spacing.sm, overflow: 'hidden' },
  step: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.sm, minHeight: control.minTouchTarget, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  stepNumber: { alignItems: 'center', borderRadius: radii.field, height: control.iconSize, justifyContent: 'center', width: control.iconSize },
  // رقم الخطوة عدد لاتيني، فاتّجاهه يُعلَن صراحةً بدل أن يُترك للسياق.
  stepNumberText: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, writingDirection: 'ltr' },
  stepText: { flex: 1, fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl' },
});
