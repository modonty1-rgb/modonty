import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { StateView } from '@/components/ui/StateView';
import { TextField } from '@/components/ui/TextField';
import { fieldErrors } from '@/lib/field-errors';
import { useAuth } from '@/providers/AuthProvider';
import { miscApi } from '@/services/api-actions';
import { ApiError, toApiError } from '@/services/errors';
import { space } from '@/theme/tokens';

/** S37 — تواصل معنا (E20 — نفس منطق /contact: ٣ رسائل/ساعة، والردّ يصل إشعاراً لصاحب الحساب). */
export default function ContactScreen() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const errors = fieldErrors(error);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await miscApi.contact({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() });
      setSent(r.message);
    } catch (e) {
      setError(toApiError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Header back title="تواصل معنا" />
      {sent ? (
        <StateView icon="check" title="وصلت رسالتك" body={sent} actionLabel="رجوع" onAction={() => router.back()} />
      ) : (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <TextField label="الاسم" value={name} onChangeText={setName} error={errors.name} />
            <TextField label="البريد الإلكتروني" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" ltr error={errors.email} />
            <TextField label="الموضوع" value={subject} onChangeText={setSubject} error={errors.subject} />
            <TextField label="رسالتك" value={message} onChangeText={setMessage} multiline error={errors.message} />
            {error && Object.keys(errors).length === 0 ? (
              <AppText variant="label" tone="danger">
                {error.message}
              </AppText>
            ) : null}
            <Button label="أرسل" icon="email" onPress={() => void submit()} busy={busy} busyLabel="يُرسل…" />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 }, content: { padding: space.screen, gap: space.md } });
