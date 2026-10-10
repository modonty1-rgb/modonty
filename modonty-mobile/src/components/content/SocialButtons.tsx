import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { GoogleG } from '@/components/brand/GoogleG';
import { FormButton, OrDivider } from '@/components/form/Form';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { toApiError } from '@/services/errors';
import { appleAvailable, CANCELLED, signInWithApple, signInWithGoogle } from '@/services/social-auth';
import type { SocialAuthData } from '@/services/api-types-account';

/** Google · Apple — Apple يظهر على iOS فقط، وهو إلزامي هناك ما دام Google معروضاً (App Store 4.8). */
export function SocialButtons({ onDone }: { onDone: () => void }) {
  const { signIn } = useAuth();
  const toast = useToast();
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
      <OrDivider />
      <FormButton
        kind="outline"
        label="المتابعة بحساب Google"
        leading={<GoogleG />}
        busy={busy === 'google'}
        busyLabel="جارٍ الدخول بـGoogle…"
        disabled={busy !== null}
        onPress={() => void run('google', signInWithGoogle)}
      />
      {apple ? (
        <FormButton kind="outline" label="المتابعة بحساب Apple" busy={busy === 'apple'} busyLabel="جارٍ الدخول بـApple…" disabled={busy !== null} onPress={() => void run('apple', signInWithApple)} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
});
