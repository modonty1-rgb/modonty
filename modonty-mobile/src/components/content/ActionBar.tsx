import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, I18nManager, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ModontyIconName } from '@/components/brand/ModontyIcon';
import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { clock, compactNumber, plainNumber, rateLabel } from '@/lib/format';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds } from '@/theme/tokens';

export type ActionItem = {
  key: string;
  icon: ModontyIconName;
  label: string;
  count?: number | null;
  active?: boolean;
  busy?: boolean;
  onPress: () => void;
};

const RATES = [1, 1.2, 1.5, 2, 0.8] as const;

/**
 * شريط أفعال المقال — Screens A · 04: حبّة عائمة ٦٤ (حشو ٨) فوق تدرّج يذيب المتن تحتها.
 * «اسمع المقال» حبّة خضراء ممتدّة حين يكون للمقال صوت، والباقي أيقونات Ø48 بأعدادها (الصفر يُخفى).
 * الحالة المفعّلة بالعلامة الممتلئة + نصّ لقارئ الشاشة (لا باللون وحده).
 * «اسمع المقال» يحوّل الحبّة نفسها إلى مشغّل مضمّن (04ب) — والمشغّل لا يُنشأ قبل الطلب، فلا تحميل صوت لمن لا يسمع.
 */
export const ActionBar = memo(function ActionBar({ items, audio }: { items: ActionItem[]; audio?: { url: string; durationSeconds: number | null } | null }) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [listening, setListening] = useState(false);
  // مع الصوت: الحبّة الخضراء + حفظ وإعجاب فقط بلا أعداد (Screens A · 04) — كي يتّسع «اسمع المقال».
  const shown = audio ? (['save', 'like'].map((k) => items.find((a) => a.key === k)).filter(Boolean) as ActionItem[]) : items;
  return (
    <View style={[styles.zone, { paddingBottom: insets.bottom + 12 }]} pointerEvents="box-none">
      <LinearGradient pointerEvents="none" colors={[`${colors.page}00`, colors.page]} locations={[0, 0.4]} style={[styles.fade, { height: insets.bottom + 112 }]} />
      {audio && listening ? (
        // اللون على طبقة عادية داخل الطبقة المتحرّكة: أندرويد يُبقي لون الطبقة ذات حركة الدخول الأوّل
        // فلا يتبع تغيير خلفية القراءة (بلاغ خالد ١٠ أكتوبر).
        <Animated.View key="player" entering={FadeIn.duration(160)} exiting={FadeOut.duration(120)}>
          <View style={[styles.bar, { backgroundColor: colors.surface }]}>
            <InlinePlayer url={audio.url} durationSeconds={audio.durationSeconds} onClose={() => setListening(false)} />
          </View>
        </Animated.View>
      ) : (
        <Animated.View key="actions" entering={FadeIn.duration(160)}>
          <View style={[styles.bar, { backgroundColor: colors.surface }]}>
          {audio ? (
            <Tap label="اسمع المقال" scale={0.97} onPress={() => setListening(true)} style={[styles.listen, { backgroundColor: colors.actionListen }]}>
              <Icon name="listen" size={20} tone="onActionListen" monochrome />
              <Text style={[styles.listenText, { color: colors.onActionListen }]} maxFontSizeMultiplier={1.2}>
                اسمع المقال
              </Text>
              {audio.durationSeconds ? (
                <Text style={[styles.listenMeta, { color: colors.onActionListen }]} maxFontSizeMultiplier={1.2}>
                  {`${plainNumber(Math.max(1, Math.round(audio.durationSeconds / 60)))} د`}
                </Text>
              ) : null}
            </Tap>
          ) : null}
          {shown.map((a) => (
            <Tap
              key={a.key}
              label={a.active ? `${a.label} (مفعّل)` : a.label}
              accessibilityState={{ selected: a.active, busy: a.busy }}
              disabled={a.busy}
              scale={0.92}
              onPress={a.onPress}
              style={[styles.item, !audio && styles.itemFlex]}
            >
              {a.busy ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Icon name={a.icon} size={22} tone={a.active ? 'primaryText' : 'text'} monochrome={!a.active} knockout="surface" />
              )}
              {!audio && a.count != null && a.count > 0 ? (
                <Text style={[styles.count, { color: a.active ? colors.primaryText : colors.text }]} maxFontSizeMultiplier={1}>
                  {compactNumber(a.count)}
                </Text>
              ) : null}
            </Tap>
          ))}
          </View>
        </Animated.View>
      )}
    </View>
  );
});

/**
 * المشغّل المضمّن — Screens A · 04ب: زرّ Ø48 أخضر (إيقاف/تشغيل) · مسار ٤ بمقبض ١٤ (لمس أو سحب للتقديم)
 * · الزمن الحالي والكلّي · السرعة ١× → ١٫٢× → ١٫٥× → ٢× → ٠٫٨× · × يوقف ويعيد الأفعال.
 * `audioUrl` نفسه الذي يشغّله الويب؛ المدّة من الملفّ، وإلا من حقل المقال.
 */
function InlinePlayer({ url, durationSeconds, onClose }: { url: string; durationSeconds: number | null; onClose: () => void }) {
  const { colors } = useAppTheme();
  const player = useAudioPlayer(url);
  const status = useAudioPlayerStatus(player);
  const [rate, setRate] = useState<number>(1);
  const total = status.duration > 0 ? status.duration : (durationSeconds ?? 0);
  const progress = total > 0 ? Math.min(1, status.currentTime / total) : 0;

  useEffect(() => {
    player.play();
  }, [player]);

  const toggle = () => {
    if (status.playing) player.pause();
    else {
      if (status.didJustFinish || (total > 0 && status.currentTime >= total - 0.5)) void player.seekTo(0);
      player.play();
    }
  };
  const nextRate = () => {
    const i = RATES.findIndex((r) => r === rate);
    const r = RATES[(i + 1) % RATES.length] ?? 1;
    player.setPlaybackRate(r);
    setRate(r);
  };

  // المسار: لمس أو سحب يقدّم إلى الموضع. الإيماءة تُنشأ مرّة والقيم من مراجع (إعادة إنشائها تقطع السحب).
  const w = useRef(0);
  const totalRef = useRef(total);
  totalRef.current = total;
  const seek = useMemo(() => {
    const to = (x: number) => {
      if (w.current <= 0 || totalRef.current <= 0) return;
      const raw = Math.min(1, Math.max(0, x / w.current));
      void player.seekTo((I18nManager.isRTL ? 1 - raw : raw) * totalRef.current);
    };
    return Gesture.Pan()
      .runOnJS(true)
      .minDistance(0)
      .onBegin((e) => to(e.x))
      .onEnd((e) => to(e.x));
  }, [player]);

  const waiting = !status.playing && (!status.isLoaded || status.isBuffering);
  return (
    <View style={styles.player}>
      <Tap label={status.playing ? 'إيقاف مؤقّت' : 'تشغيل'} scale={0.94} onPress={toggle} style={[styles.playBtn, { backgroundColor: colors.actionListen }]}>
        {waiting ? (
          <ActivityIndicator size="small" color={colors.onActionListen} />
        ) : (
          <Icon name={status.playing ? 'pause' : 'play'} size={22} tone="onActionListen" monochrome />
        )}
      </Tap>
      <View style={styles.flex}>
        <GestureDetector gesture={seek}>
          <View
            style={styles.seek}
            onLayout={(e: LayoutChangeEvent) => (w.current = e.nativeEvent.layout.width)}
            accessible
            accessibilityRole="adjustable"
            accessibilityLabel="موضع الاستماع"
            accessibilityValue={{ text: `${clock(status.currentTime)} من ${clock(total)}` }}
            accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
            onAccessibilityAction={(e) => {
              const d = e.nativeEvent.actionName === 'increment' ? 15 : -15;
              void player.seekTo(Math.min(total, Math.max(0, status.currentTime + d)));
            }}
          >
            <View style={[styles.rail, { backgroundColor: colors.surfaceHigh }]} />
            <View style={[styles.rail, styles.railFill, { width: `${progress * 100}%`, backgroundColor: colors.actionListen }]} />
            <View style={[styles.knob, { start: `${progress * 100}%`, backgroundColor: colors.success }]} />
          </View>
        </GestureDetector>
        <View style={styles.times} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Text style={[styles.time, { color: colors.muted }]} maxFontSizeMultiplier={1.2}>
            {clock(status.currentTime)}
          </Text>
          <Text style={[styles.time, { color: colors.muted }]} maxFontSizeMultiplier={1.2}>
            {total > 0 ? clock(total) : ''}
          </Text>
        </View>
      </View>
      <Tap label={`سرعة التشغيل ${rateLabel(rate)}`} onPress={nextRate} style={[styles.rate, { backgroundColor: colors.sunken }]}>
        <Text style={[styles.rateText, { color: colors.text }]} maxFontSizeMultiplier={1.2}>
          {rateLabel(rate)}
        </Text>
      </Tap>
      <Tap label="إغلاق المشغّل" onPress={onClose} style={styles.closeBtn}>
        <Icon name="close" size={20} tone="text" monochrome />
      </Tap>
    </View>
  );
}

const styles = StyleSheet.create({
  zone: { position: 'absolute', start: 0, end: 0, bottom: 0, paddingHorizontal: ds.layout.navInset },
  fade: { position: 'absolute', start: 0, end: 0, bottom: 0 },
  bar: {
    minHeight: 64,
    padding: ds.space.s2,
    borderRadius: ds.radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.space.s1,
    shadowColor: '#0E065A',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: ds.elevation.floating,
  },
  listen: { flex: 1, height: 48, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: ds.space.s2 },
  listenText: { fontFamily: 'Tajawal_800ExtraBold', fontSize: 16, lineHeight: 24 },
  listenMeta: { fontFamily: 'Tajawal_500Medium', fontSize: 13, lineHeight: 20 },
  item: { minWidth: 48, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 6 },
  itemFlex: { flex: 1 },
  count: { fontFamily: 'Tajawal_700Bold', fontSize: 13, lineHeight: 18 },
  flex: { flex: 1 },
  player: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: ds.space.s2 },
  playBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  seek: { height: 24, justifyContent: 'center' },
  rail: { position: 'absolute', start: 0, end: 0, height: 4, borderRadius: 2 },
  railFill: { end: undefined },
  knob: { position: 'absolute', width: 14, height: 14, marginStart: -7, borderRadius: 7 },
  times: { flexDirection: 'row', justifyContent: 'space-between' },
  time: { fontFamily: 'Tajawal_500Medium', fontSize: 12, lineHeight: 18 },
  rate: { height: 48, minWidth: 48, paddingHorizontal: 10, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  rateText: { fontFamily: 'Tajawal_700Bold', fontSize: 13, lineHeight: 18 },
  closeBtn: { width: 40, height: 48, alignItems: 'center', justifyContent: 'center' },
});
