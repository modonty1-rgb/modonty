import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/providers/AuthProvider';
import { confirm } from '@/providers/confirm';
import { useToast } from '@/providers/ToastProvider';
import { meApi } from '@/services/api-actions';
import { clearSession } from '@/services/session';
import { toApiError } from '@/services/errors';
import { useAppTheme } from '@/theme/ThemeProvider';
import { radius, space } from '@/theme/tokens';

const CONFIRM_WORD = 'حذف';

/**
 * S28 — حذف الحساب (A14 — متطلّب Apple 5.1.1(v)). فعل مدمّر: كتابة كلمة التأكيد + كلمة المرور إن وُجدت
 * + تأكيد أخير يسمّي ما سيُحذف (UIUX §١).
 */
export default function DeleteAccountScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const toast = useToast();
  const [word, setWord] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const ok = await confirm('حذف الحساب نهائياً', 'تُحذف محفوظاتك وإعجاباتك ومتابعاتك وجلساتك، وتبقى تعليقاتك بلا اسم. لا يمكن التراجع.', 'احذف حسابي');
    if (!ok) return;
    setBusy(true);
    setError(null);
    try {
      await meApi.remove({ confirm: word.trim(), password: user?.hasPassword ? password : undefined });
      await clearSession();
      toast.show('حُذف حسابك', 'success');
    } catch (e) {
      setError(toApiError(e).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Header back title="حذف الحساب" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.warn, { backgroundColor: colors.dangerContainer }]}>
          <AppText variant="sectionTitle" tone="onDangerContainer">
            لا يمكن التراجع عن هذا
          </AppText>
          <AppText variant="body" tone="onDangerContainer">
            يُحذف حسابك على الموقع والتطبيق معاً: المحفوظات والإعجابات والمتابعات والتقييمات والإشعارات والجلسات. تبقى تعليقاتك بلا اسم حتى لا تنقطع الردود عليها.
          </AppText>
        </View>
        <TextField label={`اكتب «${CONFIRM_WORD}» للتأكيد`} value={word} onChangeText={setWord} />
        {user?.hasPassword ? <TextField label="كلمة المرور" value={password} onChangeText={setPassword} secureTextEntry ltr /> : null}
        {error ? (
          <AppText variant="label" tone="danger">
            {error}
          </AppText>
        ) : null}
        <Button label="احذف حسابي" danger onPress={() => void submit()} busy={busy} busyLabel="يُحذف…" disabled={word.trim() !== CONFIRM_WORD || (!!user?.hasPassword && !password)} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.screen, gap: space.md },
  warn: { borderRadius: radius.card, padding: space.card, gap: space.xs },
});
