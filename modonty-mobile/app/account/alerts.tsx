import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Switch } from 'react-native-paper';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/StateView';
import { Tap } from '@/components/ui/Tap';
import { TextField } from '@/components/ui/TextField';
import { useResource } from '@/hooks/useResource';
import { fieldErrors } from '@/lib/field-errors';
import { useToast } from '@/providers/ToastProvider';
import { meApi } from '@/services/api-actions';
import { moreContentApi } from '@/services/api-content';
import type { AlertChannelId, AlertPrefs, AlertTopicId } from '@/services/api-types-actions';
import { ApiError, toApiError } from '@/services/errors';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, radius, space } from '@/theme/tokens';

const CHANNELS: { id: AlertChannelId; label: string }[] = [
  { id: 'email', label: 'بريد' },
  { id: 'whatsapp', label: 'واتساب' },
];

/**
 * S27 — التنبيهات (A12): رسائل التسويق + مواضيع القطاعات وقنواتها. أسماء المواضيع من `GET /sectors`
 * (نفس معرّفات التنبيه) — لا قائمة مكتوبة. الهاتف لقناة واتساب بصيغة E.164 يتحقّق منها الخادم.
 */
export default function AlertsScreen() {
  const { colors } = useAppTheme();
  const toast = useToast();
  const res = useResource(async (signal) => {
    const [prefs, sectors] = await Promise.all([meApi.alerts(signal), moreContentApi.sectors(signal)]);
    return { prefs, sectors: sectors.items };
  }, []);
  const [state, setState] = useState<AlertPrefs | null>(null);
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const errors = fieldErrors(error);

  useEffect(() => {
    if (res.data) {
      setState(res.data.prefs);
      setPhone(res.data.prefs.phone ?? '');
    }
  }, [res.data]);

  const toggleChannel = (topic: AlertTopicId, channel: AlertChannelId) =>
    setState((s) => {
      if (!s) return s;
      const current = s.topics[topic] ?? [];
      const nextList = current.includes(channel) ? current.filter((c) => c !== channel) : [...current, channel];
      return { ...s, topics: { ...s.topics, [topic]: nextList } };
    });

  const save = async () => {
    if (!state) return;
    setBusy(true);
    setError(null);
    try {
      const saved = await meApi.saveAlerts({ marketingEmails: state.marketingEmails, topics: state.topics, phone: phone.trim() || undefined });
      setState(saved);
      toast.show('حُفظت تفضيلاتك', 'success');
    } catch (e) {
      setError(toApiError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Header back title="التنبيهات والرسائل" />
      {res.status === 'loading' || (res.status === 'success' && !state) ? (
        <ListSkeleton kind="row" />
      ) : res.status === 'error' || !state || !res.data ? (
        <ErrorState error={res.error} onRetry={res.reload} what="تفضيلات التنبيه" />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Tap label="رسائل وعروض مدونتي بالبريد" role="switch" accessibilityState={{ checked: state.marketingEmails }} onPress={() => setState({ ...state, marketingEmails: !state.marketingEmails })} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <AppText variant="body" style={styles.flex}>
              رسائل وعروض مدونتي بالبريد
            </AppText>
            <Switch value={state.marketingEmails} onValueChange={(v) => setState({ ...state, marketingEmails: v })} color={colors.brandFill} />
          </Tap>
          <AppText variant="sectionTitle">نبّهني بجديد</AppText>
          {res.data.sectors.map((sector) => (
            <View key={sector.key} style={[styles.topic, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <AppText variant="label">{sector.label}</AppText>
              <View style={styles.channels}>
                {CHANNELS.map((c) => {
                  const on = (state.topics[sector.key] ?? []).includes(c.id);
                  return (
                    <Tap
                      key={c.id}
                      label={`${sector.label} — ${c.label}`}
                      role="checkbox"
                      accessibilityState={{ checked: on }}
                      onPress={() => toggleChannel(sector.key, c.id)}
                      style={[styles.chip, { backgroundColor: on ? colors.primaryContainer : colors.surface, borderColor: on ? colors.primary : colors.border }]}
                    >
                      <View style={styles.chipInner}>
                        {on ? <Icon name="check" size={control.iconInline} tone="onPrimaryContainer" /> : null}
                        <AppText variant="label" tone={on ? 'onPrimaryContainer' : 'text'}>
                          {c.label}
                        </AppText>
                      </View>
                    </Tap>
                  );
                })}
              </View>
            </View>
          ))}
          <TextField label="رقم الجوّال لواتساب (اختياري)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" ltr error={errors.phone} />
          {error && Object.keys(errors).length === 0 ? (
            <AppText variant="label" tone="danger">
              {error.message}
            </AppText>
          ) : null}
          <Button label="حفظ التفضيلات" onPress={() => void save()} busy={busy} busyLabel="يُحفظ…" />
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.screen, gap: space.md, paddingBottom: space.xxl },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: space.card },
  flex: { flex: 1 },
  topic: { borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: space.card, gap: space.xs },
  channels: { flexDirection: 'row', gap: space.xs },
  chipInner: { flexDirection: 'row', alignItems: 'center', gap: space.xxs },
  chip: { borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: space.md, justifyContent: 'center' },
});
