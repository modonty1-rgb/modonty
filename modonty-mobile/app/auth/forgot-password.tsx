import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormButton, FormField, FormSection } from '@/components/form/Form';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { accountApi } from '@/services/api';
import { toApiError } from '@/services/errors';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds, dsFontScale } from '@/theme/tokens';

/**
 * S14 — نسيت كلمة المرور (A7) على عُدّة النماذج: نفس `forgotPasswordAction` — رابط الإعادة في البريد يفتح صفحة الويب.
 * الجواب واحد دائماً لبريد صحيح الصيغة، فلا يُكشف إن كان البريد مسجّلاً.
 */
export default function ForgotPasswordScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await accountApi.forgotPassword(email.trim());
      setSent(true);
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
        <View style={styles.top}>
          <View style={[styles.badge, { backgroundColor: sent ? colors.accentContainer : colors.primaryContainer }]}>
            <Icon name={sent ? 'email' : 'lock'} size={32} tone={sent ? 'interactive' : 'primaryText'} monochrome />
          </View>
          <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header" maxFontSizeMultiplier={1.2}>
            {sent ? 'تحقّق من بريدك' : 'نسيت كلمة المرور؟'}
          </Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]} maxFontSizeMultiplier={dsFontScale.max}>
            {sent
              ? `إن كان ${email.trim()} مسجّلاً لدينا فستصلك رسالة فيها رابط لتعيين كلمة مرور جديدة. الرابط صالح لساعة.`
              : 'اكتب بريدك ونرسل لك رابطاً لتعيين كلمة مرور جديدة.'}
          </Text>
        </View>
        {sent ? (
          <View style={styles.actions}>
            <FormButton label="رجوع لتسجيل الدخول" onPress={() => router.back()} />
          </View>
        ) : (
          <>
            <FormSection title="البريد الإلكتروني">
              <FormField value={email} onChangeText={setEmail} placeholder="name@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" ltr error={error} onSubmitEditing={() => void submit()} returnKeyType="send" />
            </FormSection>
            <View style={styles.actions}>
              <FormButton label="أرسل الرابط" icon="email" onPress={() => void submit()} busy={busy} busyLabel="يُرسل…" disabled={!email.trim()} />
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: ds.layout.gutter },
  top: { alignItems: 'center', gap: 8, paddingTop: ds.space.s4 },
  badge: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  title: { marginTop: ds.space.s3, fontFamily: 'Tajawal_900Black', fontSize: 26, lineHeight: 36, textAlign: 'center' },
  sub: { fontFamily: 'Tajawal_400Regular', fontSize: 15, lineHeight: 24, textAlign: 'center' },
  actions: { paddingTop: ds.space.s5, gap: 12 },
});
