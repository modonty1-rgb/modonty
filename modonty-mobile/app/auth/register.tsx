import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ModontyWordmark } from '@/components/brand/ModontyWordmark';
import { SocialButtons } from '@/components/content/SocialButtons';
import { FormButton, FormError, FormField, FormSection } from '@/components/form/Form';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { fieldErrors } from '@/lib/field-errors';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { accountApi } from '@/services/api';
import { ApiError, toApiError } from '@/services/errors';
import { useAppTheme } from '@/theme/ThemeProvider';
import { brandWordmark, ds, dsFontScale } from '@/theme/tokens';

function close() {
  if (router.canDismiss()) router.dismissAll();
  else router.replace('/');
}

/**
 * S13 — إنشاء حساب (A1) على عُدّة النماذج: نفس `registerUser` على الويب (المخطّط · رسائل الترحيب والتحقّق ·
 * التحويل)، ثم الدخول مباشرة. أخطاء الحقول تحت حقولها، وموافقة الرسائل التسويقية اختيارية وتبدأ فارغة كالويب.
 */
export default function RegisterScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
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
    <KeyboardAvoidingView style={[styles.flex, { backgroundColor: colors.page }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Header back />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + ds.space.s8 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <ModontyWordmark width={brandWordmark.width * 1.5} height={brandWordmark.height * 1.5} />
          <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header" maxFontSizeMultiplier={1.2}>
            حساب جديد
          </Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]} maxFontSizeMultiplier={dsFontScale.max}>
            حساب واحد على مدونتي — نفسه على الموقع والتطبيق.
          </Text>
        </View>

        <FormSection title="الاسم">
          <FormField value={name} onChangeText={setName} placeholder="اسمك" autoComplete="name" textContentType="name" error={errors.name} />
        </FormSection>
        <FormSection title="البريد الإلكتروني">
          <FormField value={email} onChangeText={setEmail} placeholder="name@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" ltr error={errors.email} />
        </FormSection>
        <FormSection title="كلمة المرور">
          <FormField value={password} onChangeText={setPassword} placeholder="كلمة المرور" secure autoComplete="new-password" textContentType="newPassword" ltr error={errors.password} />
        </FormSection>

        <Tap label="أوافق على استقبال الرسائل والعروض من مدونتي (اختياري)" role="checkbox" accessibilityState={{ checked: consent }} onPress={() => setConsent((c) => !c)} style={styles.consent}>
          <View style={[styles.box, consent ? { backgroundColor: colors.primary, borderColor: colors.primary } : { borderColor: colors.inputBorder }]}>
            {consent ? <Icon name="check" size={16} tone="onPrimary" monochrome /> : null}
          </View>
          <Text style={[styles.consentText, { color: colors.text }]} maxFontSizeMultiplier={dsFontScale.max}>
            أوافق على استقبال الرسائل والعروض من مدونتي (اختياري)
          </Text>
        </Tap>

        <View style={styles.actions}>
          <FormError message={error && Object.keys(errors).length === 0 ? error.message : null} />
          <FormButton label="إنشاء الحساب" onPress={() => void submit()} busy={busy} busyLabel="يُنشأ الحساب…" disabled={!name.trim() || !email.trim() || !password} />
          <Text style={[styles.legal, { color: colors.textSecondary }]} maxFontSizeMultiplier={dsFontScale.max}>
            {'بإنشاء الحساب توافق على '}
            <Text maxFontSizeMultiplier={1.2} style={[styles.inlineLink, { color: colors.primaryText }]} accessibilityRole="link" onPress={() => router.push({ pathname: '/pages/[key]', params: { key: 'terms' } })}>
              الشروط
            </Text>
            {' و'}
            <Text maxFontSizeMultiplier={1.2} style={[styles.inlineLink, { color: colors.primaryText }]} accessibilityRole="link" onPress={() => router.push({ pathname: '/pages/[key]', params: { key: 'privacy-policy' } })}>
              سياسة الخصوصية
            </Text>
            .
          </Text>
          <SocialButtons onDone={close} />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footText, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
            عندك حساب؟
          </Text>
          <Tap label="سجّل الدخول" role="link" onPress={() => router.replace('/auth/login')} style={styles.footLink}>
            <Text style={[styles.inlineLink, { color: colors.primaryText }]} maxFontSizeMultiplier={1.2}>
              سجّل الدخول
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
  brand: { alignItems: 'center', gap: 8, paddingTop: ds.space.s2 },
  title: { marginTop: ds.space.s3, fontFamily: 'Tajawal_900Black', fontSize: 26, lineHeight: 36, textAlign: 'center' },
  sub: { fontFamily: 'Tajawal_400Regular', fontSize: 15, lineHeight: 24, textAlign: 'center' },
  consent: { marginTop: ds.space.s4, minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12 },
  box: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  consentText: { flex: 1, fontFamily: 'Tajawal_500Medium', fontSize: 14, lineHeight: 22 },
  actions: { paddingTop: ds.space.s4, gap: 12 },
  legal: { fontFamily: 'Tajawal_400Regular', fontSize: 13, lineHeight: 22, textAlign: 'center' },
  inlineLink: { fontFamily: 'Tajawal_700Bold', fontSize: 14, lineHeight: 20 },
  footer: { paddingTop: ds.space.s5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  footText: { fontFamily: 'Tajawal_500Medium', fontSize: 14, lineHeight: 20 },
  footLink: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 4 },
});
