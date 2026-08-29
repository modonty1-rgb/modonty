import { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ModontyWordmark } from '@/src/components/brand/ModontyWordmark';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { ErrorState, OfflineState, SkeletonBar } from '@/src/components/ui/MobileUI';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { getLoginScreenCopy, networkCopy, type LoginScreenCopy } from '@/src/services/account-api';
import { MobileOfflineError } from '@/src/services/mobile-api';
import { brand, control, fonts, radii, skeleton, spacing, typography } from '@/src/theme/tokens';
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
            <Text style={[styles.title, { color: theme.colors.text }]}>{copy.title}</Text>
            <Text style={[styles.copy, { color: theme.colors.muted }]}>{copy.subtitle}</Text>
            <Text style={[styles.label, { color: theme.colors.textStrong }]}>{copy.emailLabel}</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={copy.emailPlaceholder}
              placeholderTextColor={theme.colors.inputPlaceholder}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              accessibilityLabel={copy.emailLabel}
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => passwordInput.current?.focus()}
              style={[styles.input, { backgroundColor: theme.colors.inputSurface, borderColor: error === null ? theme.colors.inputBorder : theme.colors.errorText, color: theme.colors.text }]}
              textAlign="left"
              editable={!isSubmitting}
            />
            <Text style={[styles.label, { color: theme.colors.textStrong }]}>{copy.passwordLabel}</Text>
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
              {/* مفتاح لا زرّ: كانت الأيقونة واحدة في الحالتين والتسمية وحدها تتغيّر، فالمُبصر
                  لا يرى إن كانت كلمة المرور ظاهرة أم لا. الآن الحالة في اللون والدور معاً. */}
              <Pressable
                style={({ pressed }) => [styles.passwordVisibilityButton, pressed && styles.pressed]}
                onPress={() => setPasswordVisible((visible) => !visible)}
                accessibilityRole="switch"
                accessibilityState={{ checked: isPasswordVisible }}
                accessibilityLabel={isPasswordVisible ? copy.hidePasswordLabel : copy.showPasswordLabel}
              >
                <ModontyIcon name="views" size={control.iconSize} primary={isPasswordVisible ? theme.colors.textInteractive : theme.colors.muted} accent={theme.colors.accent} />
              </Pressable>
            </View>
            {error ?? restoreError ? <View style={styles.messageRow}><ModontyIcon name="error" size={control.iconSize} primary={theme.colors.danger} accent={theme.colors.accent} /><Text style={[styles.message, { color: theme.colors.errorText }]}>{error ?? restoreError}</Text></View> : null}
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
          </View>;

  return (
    <SafeAreaView style={[styles.page, { backgroundColor: theme.colors.page }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.brand}><ModontyWordmark width={brand.wordmarkWidth} height={brand.wordmarkHeight} /></View>
            {body}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  pressed: { opacity: 0.72 },
  keyboardAvoidingView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: spacing.screenBottom },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.screenHorizontal, paddingVertical: spacing.screenTop },
  brand: { alignItems: 'center', marginBottom: spacing.xxl },
  skeletonStack: { gap: spacing.sm },
  title: { fontFamily: fonts.medium, fontSize: typography.title, lineHeight: typography.lineHeightTitle, textAlign: 'right', writingDirection: 'rtl' },
  copy: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.xxs },
  form: { gap: spacing.xs },
  label: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.sm },
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
