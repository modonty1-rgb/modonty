import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ModontyWordmark } from '@/components/brand/ModontyWordmark';
import { SocialButtons } from '@/components/content/SocialButtons';
import { FormButton, FormError, FormField, FormSection } from '@/components/form/Form';
import { Header } from '@/components/ui/Header';
import { Tap } from '@/components/ui/Tap';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { accountApi } from '@/services/api';
import { toApiError } from '@/services/errors';
import { useAppTheme } from '@/theme/ThemeProvider';
import { brandWordmark, ds, dsFontScale } from '@/theme/tokens';

function close() {
  if (router.canDismiss()) router.dismissAll();
  else router.replace('/');
}

/**
 * الدخول (A2) على عُدّة النماذج (نظام التصميم ١٫٠): العلامة · «أهلاً بعودتك» · البريد · كلمة المرور بزرّ إظهار ·
 * «نسيت كلمة المرور؟» · دخول · أو Google/Apple · «ما عندك حساب؟». نفس تحقّق الويب، وحدّ ٥ محاولات/١٥ دقيقة
 * يصل برسالة الخادم.
 */
export default function LoginScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = email.trim().length > 3 && password.length > 0;

  const submit = async () => {
    if (!ready) {
      setError('اكتب بريدك وكلمة المرور.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const data = await accountApi.login(email.trim(), password);
      await signIn(data);
      toast.show('تمّ الدخول', 'success');
      close();
    } catch (e) {
      setError(toApiError(e).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.flex, { backgroundColor: colors.page }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Header back />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + ds.space.s8 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <ModontyWordmark width={brandWordmark.width * 1.5} height={brandWordmark.height * 1.5} />
          <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header" maxFontSizeMultiplier={1.2}>
            أهلاً بعودتك
          </Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]} maxFontSizeMultiplier={dsFontScale.max}>
            ادخل لتحفظ المقالات وتتابع الشركاء وتعلّق.
          </Text>
        </View>

        <FormSection title="البريد الإلكتروني">
          <FormField value={email} onChangeText={setEmail} placeholder="name@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" ltr />
        </FormSection>
        <FormSection title="كلمة المرور">
          <FormField value={password} onChangeText={setPassword} placeholder="كلمة المرور" secure autoComplete="current-password" textContentType="password" ltr onSubmitEditing={() => void submit()} returnKeyType="go" />
          <Tap label="نسيت كلمة المرور؟" role="link" onPress={() => router.push('/auth/forgot-password')} style={styles.forgot}>
            <Text style={[styles.link, { color: colors.primaryText }]} maxFontSizeMultiplier={1.2}>
              نسيت كلمة المرور؟
            </Text>
          </Tap>
        </FormSection>

        <View style={styles.actions}>
          <FormError message={error} />
          <FormButton label="دخول" icon="login" onPress={() => void submit()} busy={busy} busyLabel="جارٍ الدخول…" disabled={!ready} />
          <SocialButtons onDone={close} />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footText, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
            ما عندك حساب؟
          </Text>
          <Tap label="أنشئ حساباً" role="link" onPress={() => router.replace('/auth/register')} style={styles.footLink}>
            <Text style={[styles.link, { color: colors.primaryText }]} maxFontSizeMultiplier={1.2}>
              أنشئ حساباً
            </Text>
          </Tap>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: ds.layout.gutter },
  brand: { alignItems: 'center', gap: 8, paddingTop: ds.space.s2, paddingBottom: ds.space.s2 },
  title: { marginTop: ds.space.s3, fontFamily: 'Tajawal_900Black', fontSize: 26, lineHeight: 36, textAlign: 'center' },
  sub: { fontFamily: 'Tajawal_400Regular', fontSize: 15, lineHeight: 24, textAlign: 'center' },
  forgot: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
  link: { fontFamily: 'Tajawal_700Bold', fontSize: 14, lineHeight: 20 },
  actions: { paddingTop: ds.space.s5, gap: 12 },
  footer: { paddingTop: ds.space.s5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  footText: { fontFamily: 'Tajawal_500Medium', fontSize: 14, lineHeight: 20 },
  footLink: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 4 },
});
