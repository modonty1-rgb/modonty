import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { ModontyWordmark } from '@/components/brand/ModontyWordmark';
import { SocialButtons } from '@/components/content/SocialButtons';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { accountApi } from '@/services/api';
import { toApiError } from '@/services/errors';
import { brandWordmark, space } from '@/theme/tokens';

function close() {
  if (router.canDismiss()) router.dismissAll();
  else router.replace('/');
}

/** S12 — الدخول (A2): نفس تحقّق الويب، وحدّ ٥ محاولات/١٥ دقيقة يأتي برسالة الخادم. بلا هيدر رئيسية ولا تابات (BRANDING). */
export default function LoginScreen() {
  const { signIn } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!email.trim() || !password) {
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
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header back title="تسجيل الدخول" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <ModontyWordmark width={brandWordmark.width * 1.5} height={brandWordmark.height * 1.5} />
          <AppText variant="body" tone="muted" align="center">
            ادخل لتحفظ المقالات وتتابع الشركاء وتعلّق.
          </AppText>
        </View>
        <TextField label="البريد الإلكتروني" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" ltr />
        <TextField
          label="كلمة المرور"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secure}
          autoComplete="current-password"
          textContentType="password"
          ltr
          right={<TextFieldToggle secure={secure} onToggle={() => setSecure((s) => !s)} />}
          onSubmitEditing={() => void submit()}
        />
        {error ? (
          <AppText variant="label" tone="danger" accessibilityLiveRegion="polite">
            {error}
          </AppText>
        ) : null}
        <Button label="دخول" icon="login" onPress={() => void submit()} busy={busy} busyLabel="جارٍ الدخول…" />
        <Button label="نسيت كلمة المرور؟" kind="text" onPress={() => router.push('/auth/forgot-password')} />
        <SocialButtons onDone={close} />
        <View style={styles.footer}>
          <AppText variant="body" tone="muted">
            ليس لديك حساب؟
          </AppText>
          <Button label="أنشئ حساباً" kind="text" compact onPress={() => router.replace('/auth/register')} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

import { TextInput } from 'react-native-paper';
function TextFieldToggle({ secure, onToggle }: { secure: boolean; onToggle: () => void }) {
  return <TextInput.Affix text={secure ? 'إظهار' : 'إخفاء'} onPress={onToggle} accessibilityLabel={secure ? 'إظهار كلمة المرور' : 'إخفاء كلمة المرور'} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: space.screen, gap: space.md, paddingBottom: space.xxl },
  brand: { alignItems: 'center', gap: space.sm, paddingVertical: space.lg },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xxs },
});
