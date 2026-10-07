import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { StateView } from '@/components/ui/StateView';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/providers/AuthProvider';
import { actionsApi } from '@/services/api';
import type { BookingSource } from '@/services/api-types';
import { toApiError } from '@/services/errors';
import { control, space } from '@/theme/tokens';

/**
 * S09b — طلب حجز / «اترك رقمك» (E14 — submitBookingRequest نفسها). بلا دخول؛ الاسم والبريد اختياريان.
 * الإرسال = موافقة على الشروط والخصوصية كما في نموذج الويب (`BookingForm.tsx:85,191-194`)، والرفض
 * (رقم غير صالح · تكرار خلال ساعة) يصل بنصّ الخادم.
 */
export default function BookScreen() {
  const params = useLocalSearchParams<{ slug: string; partnerId: string; name?: string; articleId?: string; source?: BookingSource }>();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await actionsApi.book(params.partnerId, {
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim(),
        message: message.trim() || undefined,
        source: params.source ?? 'client_page',
        articleId: params.articleId ?? null,
        disclaimerAccepted: true,
      });
      setDone(true);
    } catch (e) {
      setError(toApiError(e).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Header back title={params.name ? `احجز مع ${params.name}` : 'طلب حجز'} />
      {done ? (
        <StateView icon="check" title="تم استلام طلبك" body="رقمك للحجز فقط — بلا رسائل تسويقية. سيتواصل معك المزوّد لتأكيد الموعد." actionLabel="رجوع" onAction={() => router.back()} />
      ) : (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <TextField label="رقم جوّالك" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" ltr />
            <TextField label="اسمك — اختياري" value={name} onChangeText={setName} autoComplete="name" />
            <TextField label="بريدك — اختياري" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" ltr />
            <TextField label="تفاصيل أو وقت تفضّله؟ — اختياري، والمزوّد يؤكّده" value={message} onChangeText={setMessage} multiline />
            <View style={styles.consent}>
              <Icon name="info" size={control.iconInline} tone="muted" />
              <AppText variant="secondary" tone="muted" style={styles.flex}>
                بمتابعتك، أنت توافق على الشروط والخصوصية — مدوّنتي منصّة تعريفية، لسنا مقدّم الخدمة.
              </AppText>
            </View>
            <View style={styles.links}>
              <Button label="الشروط" kind="text" compact onPress={() => router.push({ pathname: '/pages/[key]', params: { key: 'terms' } })} />
              <Button label="الخصوصية" kind="text" compact onPress={() => router.push({ pathname: '/pages/[key]', params: { key: 'privacy-policy' } })} />
            </View>
            {error ? (
              <AppText variant="label" tone="danger" accessibilityLiveRegion="polite">
                {error}
              </AppText>
            ) : null}
            <Button label="أرسل الطلب" icon="booking" onPress={() => void submit()} busy={busy} busyLabel="يُرسل الطلب…" disabled={!phone.trim()} />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: space.screen, gap: space.md },
  consent: { flexDirection: 'row', gap: space.xs, alignItems: 'flex-start' },
  links: { flexDirection: 'row', gap: space.xs },
});
