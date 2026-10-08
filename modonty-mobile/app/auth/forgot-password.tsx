import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { StateView } from '@/components/ui/StateView';
import { TextField } from '@/components/ui/TextField';
import { accountApi } from '@/services/api';
import { toApiError } from '@/services/errors';
import { space } from '@/theme/tokens';

/**
 * S14 — نسيت كلمة المرور (A7): نفس `forgotPasswordAction` — رابط الإعادة في البريد يفتح صفحة الويب.
 * الجواب واحد دائماً لبريد صحيح الصيغة، فلا يُكشف إن كان البريد مسجّلاً.
 */
export default function ForgotPasswordScreen() {
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
    <>
      <Header back title="نسيت كلمة المرور" />
      {sent ? (
        <StateView icon="email" title="تحقّق من بريدك" body={`إن كان ${email.trim()} مسجّلاً لدينا فستصلك رسالة فيها رابط لتعيين كلمة مرور جديدة. الرابط صالح لساعة.`} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AppText variant="body" tone="muted">
            اكتب بريدك وسنرسل لك رابطاً لتعيين كلمة مرور جديدة.
          </AppText>
          <TextField label="البريد الإلكتروني" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" ltr error={error} onSubmitEditing={() => void submit()} />
          <Button label="أرسل الرابط" icon="email" onPress={() => void submit()} busy={busy} busyLabel="يُرسل…" disabled={!email.trim()} />
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({ content: { padding: space.screen, gap: space.md } });
