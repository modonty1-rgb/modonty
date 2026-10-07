import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { fieldErrors } from '@/lib/field-errors';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { meApi } from '@/services/api-actions';
import { ApiError, toApiError } from '@/services/errors';
import { space } from '@/theme/tokens';

/**
 * S26 — كلمة المرور (A11): تغيير، أو إنشاء لحساب دخل بـGoogle/Apple. النجاح يُخرج جلساتك الأخرى
 * من كل الأجهزة ويُبقي هذا الجهاز.
 */
export default function PasswordScreen() {
  const { user, refreshMe } = useAuth();
  const toast = useToast();
  const has = !!user?.hasPassword;
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirmValue, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const errors = fieldErrors(error);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await meApi.password({ currentPassword: has ? current : undefined, newPassword: next, confirmPassword: confirmValue });
      await refreshMe();
      toast.show(r.revokedSessions > 0 ? `حُفظت كلمة المرور، وخرجت من ${r.revokedSessions} جلسة أخرى` : 'حُفظت كلمة المرور', 'success');
      router.back();
    } catch (e) {
      setError(toApiError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Header back title={has ? 'تغيير كلمة المرور' : 'إنشاء كلمة مرور'} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!has ? (
          <AppText variant="body" tone="muted">
            دخلت بحساب Google أو Apple. أنشئ كلمة مرور لتدخل بالبريد أيضاً.
          </AppText>
        ) : null}
        {has ? <TextField label="كلمة المرور الحالية" value={current} onChangeText={setCurrent} secureTextEntry ltr error={errors.currentPassword} autoComplete="current-password" /> : null}
        <TextField label="كلمة المرور الجديدة" value={next} onChangeText={setNext} secureTextEntry ltr error={errors.newPassword} autoComplete="new-password" />
        <TextField label="تأكيد كلمة المرور الجديدة" value={confirmValue} onChangeText={setConfirm} secureTextEntry ltr error={errors.confirmPassword} autoComplete="new-password" />
        {error && Object.keys(errors).length === 0 ? (
          <AppText variant="label" tone="danger">
            {error.message}
          </AppText>
        ) : null}
        <Button label="حفظ" onPress={() => void submit()} busy={busy} busyLabel="يُحفظ…" disabled={!next || !confirmValue || (has && !current)} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({ content: { padding: space.screen, gap: space.md } });
