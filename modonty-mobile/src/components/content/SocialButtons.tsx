import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { toApiError } from '@/services/errors';
import { appleAvailable, CANCELLED, signInWithApple, signInWithGoogle } from '@/services/social-auth';
import type { SocialAuthData } from '@/services/api-types-account';
import { useAppTheme } from '@/theme/ThemeProvider';
import { space } from '@/theme/tokens';

/** Google · Apple — Apple يظهر على iOS فقط، وهو إلزامي هناك ما دام Google معروضاً (App Store 4.8). */
export function SocialButtons({ onDone }: { onDone: () => void }) {
  const { signIn } = useAuth();
  const toast = useToast();
  const { colors } = useAppTheme();
  const [apple, setApple] = useState(false);
  const [busy, setBusy] = useState<'google' | 'apple' | null>(null);

  useEffect(() => {
    appleAvailable()
      .then(setApple)
      .catch((error: unknown) => console.warn('[apple] availability', error));
  }, []);

  const run = async (kind: 'google' | 'apple', fn: () => Promise<SocialAuthData | typeof CANCELLED>) => {
    setBusy(kind);
    try {
      const result = await fn();
      if (result === CANCELLED) return;
      await signIn(result);
      toast.show(result.isNewUser ? 'أهلاً بك في مدونتي' : 'تمّ الدخول', 'success');
      onDone();
    } catch (error) {
      toast.show(toApiError(error).message, 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.divider}>
        <View style={[styles.line, { backgroundColor: colors.border }]} />
        <AppText variant="secondary" tone="muted">
          أو
        </AppText>
        <View style={[styles.line, { backgroundColor: colors.border }]} />
      </View>
      <Button label="المتابعة بحساب Google" kind="outlined" busy={busy === 'google'} busyLabel="جارٍ الدخول بـGoogle…" disabled={busy !== null} onPress={() => void run('google', signInWithGoogle)} />
      {apple ? (
        <Button label="المتابعة بحساب Apple" kind="outlined" busy={busy === 'apple'} busyLabel="جارٍ الدخول بـApple…" disabled={busy !== null} onPress={() => void run('apple', signInWithApple)} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  divider: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
});
