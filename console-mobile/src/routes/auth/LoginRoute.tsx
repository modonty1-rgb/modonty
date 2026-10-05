import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandCookieHero } from '@/src/components/brand/BrandCookieHero';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { ErrorState, OfflineState, SkeletonBar } from '@/src/components/ui/MobileUI';
import { BackgroundGlow, EnterView, haptic, LargeTitle, TonalCard } from '@/src/components/ui/Nabd';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { useKeyboardInset } from '@/src/components/ui/useKeyboardInset';
import { getLoginScreenCopy, networkCopy, type LoginScreenCopy } from '@/src/services/account-api';
import { MobileOfflineError } from '@/src/services/mobile-api';
import { control, fonts, radii, skeleton, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type LoginRouteProps = {
  onLogin: (email: string, password: string) => Promise<void>;
  restoreError: string | null;
};

export function LoginRoute({ onLogin, restoreError }: LoginRouteProps) {
  const { theme } = useAppTheme();
  const [copy, setCopy] = useState<LoginScreenCopy | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [isOffline, setOffline] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const passwordInput = useRef<TextInput>(null);
  const keyboardInset = useKeyboardInset();
  const scrollRef = useRef<ScrollView>(null);
  // حين تفتح اللوحة ويقصر العرض فعلاً (onLayout) ينزل التمرير حتى يظهر زرّ الدخول فوقها.
  const followKeyboard = useCallback(() => { if (keyboardInset > 0) scrollRef.current?.scrollToEnd({ animated: true }); }, [keyboardInset]);

  const loadCopy = useCallback(() => {
    setCopyError(null);
    setOffline(false);
    setCopy(null);
    void getLoginScreenCopy()
      .then(setCopy)
      .catch((reason: unknown) => {
        if (reason instanceof MobileOfflineError) {
          setOffline(true);
          return;
        }
        setCopyError(reason instanceof Error && reason.message ? reason.message : networkCopy.loadFailed);
      });
  }, []);

  useEffect(loadCopy, [loadCopy]);

  const submit = async () => {
    if (!copy) return;
    setNotice(null);
    if (!email.trim() || !password) {
      setError(copy.missingFieldsMessage);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onLogin(email, password);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : networkCopy.loadFailed);
    } finally {
      setSubmitting(false);
    }
  };

  const body = isOffline
    ? <OfflineState title={networkCopy.offlineTitle} description={networkCopy.offlineDescription} retryLabel={networkCopy.retryLabel} onRetry={loadCopy} />
    : copyError !== null
      ? <ErrorState message={copyError} retryLabel={networkCopy.retryLabel} onRetry={loadCopy} />
      : copy === null
        ? <View accessibilityLabel={networkCopy.loadingLabel} style={styles.skeletonStack}>
            <SkeletonBar height={skeleton.titleHeight} width="40%" />
            <SkeletonBar width="65%" />
            <SkeletonBar height={control.inputHeight} radius={radii.field} />
            <SkeletonBar height={control.inputHeight} radius={radii.field} />
            <SkeletonBar height={control.buttonHeight} radius={radii.button} />
          </View>
        : <View style={styles.form}>
            <LargeTitle title={copy.title} subtitle={copy.subtitle} />
            <TonalCard style={styles.card}>
            <Text style={[styles.label, { color: theme.colors.text }]}>{copy.emailLabel}</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={copy.emailPlaceholder}
              placeholderTextColor={theme.colors.inputPlaceholder}
              autoCapitalize="none"
              autoCorrect={false}
              // الحقل يقبل البريد **أو اسم الحساب**، فلوحة المفاتيح عامّة لا لوحة بريد
              // (لوحة البريد على أندرويد تخفي العربية، واسم الحساب قد يكون عربياً).
              autoComplete="username"
              keyboardType="default"
              textContentType="username"
              accessibilityLabel={copy.emailLabel}
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => passwordInput.current?.focus()}
              style={[styles.input, { backgroundColor: theme.colors.inputSurface, borderColor: error === null ? theme.colors.inputBorder : theme.colors.errorText, color: theme.colors.text }]}
              textAlign="left"
              editable={!isSubmitting}
            />
            <Text style={[styles.label, { color: theme.colors.text }]}>{copy.passwordLabel}</Text>
            <View style={[styles.passwordField, { backgroundColor: theme.colors.inputSurface, borderColor: error === null ? theme.colors.inputBorder : theme.colors.errorText }]}>
              <TextInput
                ref={passwordInput}
                returnKeyType="go"
                onSubmitEditing={() => void submit()}
                value={password}
                onChangeText={setPassword}
                placeholderTextColor={theme.colors.inputPlaceholder}
                secureTextEntry={!isPasswordVisible}
                autoComplete="current-password"
                textContentType="password"
                accessibilityLabel={copy.passwordLabel}
                style={[styles.passwordInput, { color: theme.colors.text }]}
                textAlign="left"
                editable={!isSubmitting}
              />
              {/* مفتاح لا زرّ: الحالة في اللون والدور معاً، لا في التسمية وحدها. */}
              <Pressable
                style={({ pressed }) => [styles.passwordVisibilityButton, pressed && styles.pressed]}
                onPress={() => { haptic('selection'); setPasswordVisible((visible) => !visible); }}
                accessibilityRole="switch"
                accessibilityState={{ checked: isPasswordVisible }}
                accessibilityLabel={isPasswordVisible ? copy.hidePasswordLabel : copy.showPasswordLabel}
              >
                <ModontyIcon name="views" size={control.iconSize - spacing.xxs} primary={isPasswordVisible ? theme.colors.textInteractive : theme.colors.muted} accent={theme.colors.accent} />
              </Pressable>
            </View>
            {error ?? restoreError ? <View accessibilityLiveRegion="assertive" style={styles.messageRow}><ModontyIcon name="error" size={control.iconSize} primary={theme.colors.danger} accent={theme.colors.accent} /><Text style={[styles.message, { color: theme.colors.errorText }]}>{error ?? restoreError}</Text></View> : null}
            <PrimaryButton label={isSubmitting ? copy.submittingLabel : copy.submitLabel} onPress={() => void submit()} style={styles.loginButton} disabled={isSubmitting} />
            <Pressable
              style={({ pressed }) => [styles.forgotButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={copy.forgotPasswordLabel}
              onPress={() => setNotice(copy.forgotPasswordUnavailableMessage)}
            >
              <Text style={[styles.forgot, { color: theme.colors.textInteractive }]}>{copy.forgotPasswordLabel}</Text>
            </Pressable>
            {notice ? <View style={styles.messageRow}><ModontyIcon name="info" size={control.iconSize} primary={theme.colors.warning} accent={theme.colors.accent} /><Text style={[styles.message, { color: theme.colors.muted }]}>{notice}</Text></View> : null}
            </TonalCard>
          </View>;

  /**
   * «نبض» (S01): التوهّج الثابت خلف الشاشة · «كعكة» الماركة ١٢٠ بظلّها الأزرق · «أهلًا بك» ٢٨/٣٦ ·
   * ثم الحقول في بطاقة نغمية. اللوحة تُحجز بـ`useKeyboardInset` كبقية الحقول (edge-to-edge).
   */
  return (
    <SafeAreaView style={[styles.page, { backgroundColor: theme.colors.page }]} edges={['top', 'bottom']}>
      <BackgroundGlow />
      <ScrollView ref={scrollRef} onLayout={followKeyboard} onContentSizeChange={followKeyboard} contentContainerStyle={[styles.scrollContent, { paddingBottom: spacing.screenBottom + keyboardInset }]} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <EnterView index={0}><BrandCookieHero /></EnterView>
        <EnterView index={1}>{body}</EnterView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  pressed: { opacity: 0.72 },
  scrollContent: { flexGrow: 1, gap: spacing.lg, paddingHorizontal: spacing.screenHorizontal },
  skeletonStack: { gap: spacing.sm },
  form: { gap: spacing.md },
  card: { gap: spacing.xs },
  label: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, marginTop: spacing.xxs, textAlign: 'right', writingDirection: 'rtl' },
  input: { height: control.inputHeight, borderWidth: control.inputBorderWidth, borderRadius: radii.field, paddingHorizontal: spacing.md, fontFamily: fonts.regular, fontSize: typography.body, writingDirection: 'ltr' },
  passwordField: { height: control.inputHeight, borderWidth: control.inputBorderWidth, borderRadius: radii.field, flexDirection: 'row-reverse', alignItems: 'center' },
  passwordInput: { flex: 1, height: '100%', paddingHorizontal: spacing.md, fontFamily: fonts.regular, fontSize: typography.body, writingDirection: 'ltr' },
  passwordVisibilityButton: { width: control.minTouchTarget, height: control.minTouchTarget, alignItems: 'center', justifyContent: 'center' },
  loginButton: { marginTop: spacing.sm },
  forgotButton: { minHeight: control.minTouchTarget, alignItems: 'center', justifyContent: 'center' },
  forgot: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'center', writingDirection: 'rtl' },
  messageRow: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.xs, marginTop: spacing.xxs },
  message: { flex: 1, fontFamily: fonts.regular, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'right', writingDirection: 'rtl' },
});
