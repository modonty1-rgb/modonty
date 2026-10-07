import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { StateView } from '@/components/ui/StateView';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/providers/AuthProvider';
import { miscApi, partnerActionsApi } from '@/services/api-actions';
import { toApiError } from '@/services/errors';
import { space } from '@/theme/tokens';

/** S38 — النشرة البريدية (E19): نشرة مدونتي العامّة، أو نشرة شريك حين تُفتح بـ`partnerId`. */
export default function NewsletterScreen() {
  const { partnerId, name } = useLocalSearchParams<{ partnerId?: string; name?: string }>();
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      if (partnerId) {
        const r = await partnerActionsApi.subscribe(partnerId, email.trim());
        setDone(r.alreadySubscribed ? 'أنت مشترك من قبل.' : 'اشتركت — يصلك جديده على بريدك.');
      } else {
        const r = await miscApi.newsletter(email.trim());
        setDone(r.message);
      }
    } catch (e) {
      setError(toApiError(e).message);
    } finally {
      setBusy(false);
    }
  };

  const title = partnerId && name ? `نشرة ${name}` : 'نشرة مدونتي';
  return (
    <Screen>
      <Header back title={title} />
      {done ? (
        <StateView icon="email" title="تمّ" body={done} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AppText variant="body" tone="muted">
            {partnerId ? 'يصلك جديد مقالات الشريك على بريدك.' : 'أهمّ ما يُنشر في مدونتي على بريدك.'}
          </AppText>
          <TextField label="البريد الإلكتروني" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" ltr error={error} />
          <Button label="اشترك" icon="email" onPress={() => void submit()} busy={busy} busyLabel="يُشترك…" disabled={!email.trim()} />
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({ content: { padding: space.screen, gap: space.md } });
