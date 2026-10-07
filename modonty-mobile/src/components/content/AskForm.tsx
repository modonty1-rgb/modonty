import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { StateView } from '@/components/ui/StateView';
import { TextField } from '@/components/ui/TextField';
import { fieldErrors } from '@/lib/field-errors';
import { ApiError, toApiError } from '@/services/errors';
import { space } from '@/theme/tokens';

/** سؤال للشريك (E13) — من المقال أو من صفحة الشريك. يُنشر بعد ردّ الشريك، ويصلك إشعار بالردّ. */
export function AskForm({ intro, submit }: { intro: string; submit: (question: string) => Promise<unknown> }) {
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [done, setDone] = useState(false);
  const errors = fieldErrors(error);

  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      await submit(question.trim());
      setDone(true);
    } catch (e) {
      setError(toApiError(e));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return <StateView icon="check" title="وصل سؤالك" body="يصلك إشعار حين يردّ الشريك." actionLabel="رجوع" onAction={() => router.back()} />;
  }
  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <AppText variant="body" tone="muted">
        {intro}
      </AppText>
      <TextField label="سؤالك" value={question} onChangeText={setQuestion} multiline error={errors.question ?? (error && Object.keys(errors).length === 0 ? error.message : null)} />
      <Button label="أرسل السؤال" icon="question" onPress={() => void send()} busy={busy} busyLabel="يُرسل…" disabled={!question.trim()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({ content: { padding: space.screen, gap: space.md } });
