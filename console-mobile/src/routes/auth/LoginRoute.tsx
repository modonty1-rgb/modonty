import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ModontyWordmark } from '@/src/components/brand/ModontyWordmark';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { colors, control, fonts, radii, spacing, typography } from '@/src/theme/tokens';

type LoginRouteProps = {
  onLogin: (email: string, password: string) => Promise<void>;
};

export function LoginRoute({ onLogin }: LoginRouteProps) {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError('أدخل البريد الإلكتروني وكلمة المرور.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onLogin(email, password);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'تعذّر تسجيل الدخول.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.page} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.brand}><ModontyWordmark /></View>
          <Text style={styles.title}>أهلًا بك</Text>
          <Text style={styles.copy}>تابع نموك من مكان واحد.</Text>
          <View style={styles.form}>
            <Text style={styles.label}>البريد الإلكتروني</Text>
            <TextInput value={email} onChangeText={setEmail} placeholder="name@company.com" placeholderTextColor={colors.inputPlaceholder} autoCapitalize="none" autoCorrect={false} autoComplete="email" keyboardType="email-address" textContentType="emailAddress" style={styles.input} textAlign="left" editable={!isSubmitting} />
            <Text style={styles.label}>كلمة المرور</Text>
            <View style={styles.passwordField}>
              <TextInput value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor={colors.inputPlaceholder} secureTextEntry={!isPasswordVisible} autoComplete="current-password" textContentType="password" style={styles.passwordInput} textAlign="right" editable={!isSubmitting} />
              <Pressable style={styles.passwordVisibilityButton} onPress={() => setPasswordVisible((visible) => !visible)} accessibilityRole="button" accessibilityLabel={isPasswordVisible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>
                <ModontyIcon name="views" size={control.iconSize} primary={colors.muted} accent={colors.primary} />
              </Pressable>
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton label={isSubmitting ? 'جارٍ تسجيل الدخول…' : 'دخول إلى حسابي'} onPress={() => void submit()} style={styles.loginButton} disabled={isSubmitting} />
            <Pressable style={styles.forgotButton} accessibilityRole="button"><Text style={styles.forgot}>نسيت كلمة المرور؟</Text></Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.page },
  scrollContent: { flexGrow: 1, paddingBottom: spacing.screenBottom },
  content: { flex: 1, paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.screenTop },
  brand: { alignItems: 'center', marginBottom: spacing.xxl },
  title: { color: colors.text, fontFamily: fonts.medium, fontSize: typography.title, lineHeight: typography.lineHeightTitle, textAlign: 'right', writingDirection: 'rtl' },
  copy: { color: colors.muted, fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.xs },
  form: { marginTop: spacing.xxl, gap: spacing.xs },
  label: { color: colors.textStrong, fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl' },
  input: { height: control.inputHeight, borderWidth: 1, borderColor: colors.border, borderRadius: radii.field, color: colors.text, backgroundColor: colors.surface, paddingHorizontal: spacing.md, fontFamily: fonts.regular, fontSize: typography.body, writingDirection: 'ltr' },
  passwordField: { height: control.inputHeight, borderWidth: 1, borderColor: colors.border, borderRadius: radii.field, backgroundColor: colors.surface, flexDirection: 'row-reverse', alignItems: 'center' },
  passwordInput: { flex: 1, height: '100%', color: colors.text, paddingRight: spacing.md, fontFamily: fonts.regular, fontSize: typography.body, writingDirection: 'ltr' },
  passwordVisibilityButton: { width: control.minTouchTarget, height: control.minTouchTarget, alignItems: 'center', justifyContent: 'center' },
  loginButton: { marginTop: spacing.sm },
  forgotButton: { minHeight: control.minTouchTarget, alignItems: 'center', justifyContent: 'center' },
  forgot: { color: colors.textInteractive, fontFamily: fonts.medium, fontSize: typography.label, textAlign: 'center', writingDirection: 'rtl' },
  error: { color: colors.errorText, fontFamily: fonts.regular, fontSize: typography.label, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.xs },
});
