import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Checkbox } from 'react-native-paper';

import { SocialButtons } from '@/components/content/SocialButtons';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Tap } from '@/components/ui/Tap';
import { TextField } from '@/components/ui/TextField';
import { fieldErrors } from '@/lib/field-errors';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { accountApi } from '@/services/api';
import { ApiError, toApiError } from '@/services/errors';
import { useAppTheme } from '@/theme/ThemeProvider';
import { space } from '@/theme/tokens';

function close() {
  if (router.canDismiss()) router.dismissAll();
  else router.replace('/');
}

/**
 * S13 — إنشاء حساب (A1): نفس `registerUser` على الويب (المخطّط · رسائل الترحيب والتحقّق · التحويل)،
 * ثم الدخول مباشرة. موافقة الرسائل التسويقية اختيارية وتبدأ فارغة كما الويب.
 */
export default function RegisterScreen() {
  const { colors } = useAppTheme();
  const { signIn } = useAuth();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const errors = fieldErrors(error);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const data = await accountApi.register({ name: name.trim(), email: email.trim(), password, marketingConsent: consent });
      await signIn(data);
      toast.show('أُنشئ حسابك — أرسلنا رسالة تأكيد إلى بريدك', 'success');
      close();
    } catch (e) {
      setError(toApiError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header back title="إنشاء حساب" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextField label="الاسم" value={name} onChangeText={setName} autoComplete="name" textContentType="name" error={errors.name} />
        <TextField label="البريد الإلكتروني" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" ltr error={errors.email} />
        <TextField label="كلمة المرور" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" textContentType="newPassword" ltr error={errors.password} />
        <Tap label="أوافق على استقبال الرسائل والعروض من مدونتي" role="checkbox" accessibilityState={{ checked: consent }} onPress={() => setConsent((c) => !c)} style={styles.consent}>
          <Checkbox.Android status={consent ? 'checked' : 'unchecked'} color={colors.brandFill} uncheckedColor={colors.inputBorder} />
          <AppText variant="body" style={styles.flex}>
            أوافق على استقبال الرسائل والعروض من مدونتي (اختياري)
          </AppText>
        </Tap>
        {error && Object.keys(errors).length === 0 ? (
          <AppText variant="label" tone="danger" accessibilityLiveRegion="polite">
            {error.message}
          </AppText>
        ) : null}
        <Button label="إنشاء الحساب" onPress={() => void submit()} busy={busy} busyLabel="يُنشأ الحساب…" />
        <View style={styles.legal}>
          <Button label="الشروط" kind="text" compact onPress={() => router.push({ pathname: '/pages/[key]', params: { key: 'terms' } })} />
          <Button label="سياسة الخصوصية" kind="text" compact onPress={() => router.push({ pathname: '/pages/[key]', params: { key: 'privacy-policy' } })} />
        </View>
        <SocialButtons onDone={close} />
        <View style={styles.footer}>
          <AppText variant="body" tone="muted">
            لديك حساب؟
          </AppText>
          <Button label="سجّل الدخول" kind="text" compact onPress={() => router.replace('/auth/login')} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: space.screen, gap: space.md, paddingBottom: space.xxl },
  consent: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  legal: { flexDirection: 'row', justifyContent: 'center', gap: space.xs },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xxs },
});
