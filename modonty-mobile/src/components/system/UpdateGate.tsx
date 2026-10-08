import { Image } from 'expo-image';
import * as Updates from 'expo-updates';
import { useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useAppTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

/** لا نسأل الخادم أكثر من مرّة في الدقيقة حين يعود التطبيق للواجهة. */
const RECHECK_MS = 60_000;

/**
 * التحديث في فتحة واحدة (طلب خالد ٩ أكتوبر). الافتراضي في Expo: الفتحة الأولى تنزّل في الخلفية والثانية
 * تطبّق — فكان المستخدم يفتح مرّتين. هنا: عند الفتح وعند العودة للتطبيق نسأل (`checkForUpdateAsync`)،
 * فإن وُجد تحديث نعرض شاشة هادئة بنسبة التحميل (`useUpdates().downloadProgress`) ثم نعيد التشغيل
 * (`fetchUpdateAsync` ← `reloadAsync`) — توثيق expo-updates (SDK 54). أيّ فشل يُخفي الشاشة ويُكمل
 * المستخدم بالنسخة الحالية؛ التحديث يُعاد في الفتحة التالية.
 */
export function UpdateGate() {
  const { colors } = useAppTheme();
  const { downloadProgress, isUpdatePending } = Updates.useUpdates();
  const [visible, setVisible] = useState(false);
  const busy = useRef(false);
  const lastCheck = useRef(0);

  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) return;

    const run = async () => {
      if (busy.current || Date.now() - lastCheck.current < RECHECK_MS) return;
      busy.current = true;
      lastCheck.current = Date.now();
      try {
        const check = await Updates.checkForUpdateAsync();
        if (!check.isAvailable) return;
        setVisible(true);
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      } catch (error) {
        console.warn('[updates] apply failed — continuing on the current version', error);
        setVisible(false);
      } finally {
        busy.current = false;
      }
    };

    run();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') run();
    });
    return () => sub.remove();
  }, []);

  // نزّله النظام في الخلفية قبل أن نسأل نحن — يكفي إعادة التشغيل.
  useEffect(() => {
    if (__DEV__ || !isUpdatePending) return;
    setVisible(true);
    Updates.reloadAsync().catch((error: unknown) => {
      console.warn('[updates] reload failed', error);
      setVisible(false);
    });
  }, [isUpdatePending]);

  if (!visible) return null;
  const progress = Math.max(0.08, Math.min(1, downloadProgress ?? 0));

  return (
    <Animated.View entering={FadeIn.duration(220)} style={[StyleSheet.absoluteFill, styles.scrim, { backgroundColor: colors.page }]}>
      <View style={styles.card} accessibilityRole="progressbar" accessibilityLabel="نحدّث مدونتي لك">
        <Image source={require('../../../assets/brand/modonty-mark.png')} style={styles.mark} contentFit="contain" />
        <Text style={[styles.title, { color: colors.text }]}>نحدّث مدونتي لك…</Text>
        <Text style={[styles.body, { color: colors.muted }]}>نسخة أحدث جاهزة — ثوانٍ ونكمل من حيث كنت.</Text>
        <View style={[styles.track, { backgroundColor: colors.surfaceHigh }]}>
          <View style={[styles.fill, { width: `${Math.round(progress * 100)}%`, backgroundColor: colors.primary }]} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scrim: { alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  card: { alignItems: 'center', gap: 10, paddingHorizontal: 32, width: '100%', maxWidth: 360 },
  mark: { width: 56, height: 56, marginBottom: 6 },
  title: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 28 },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, textAlign: 'center' },
  track: { width: '70%', height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 8 },
  fill: { height: '100%', borderRadius: 2 },
});
