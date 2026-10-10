import { useMemo, useRef } from 'react';
import { I18nManager, Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ModontyIcon } from '@/components/brand/ModontyIcon';
import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { haptic } from '@/lib/haptics';
import { plainNumber } from '@/lib/format';
import { READING_SIZE, setReadingPrefs, type ReadingTone } from '@/lib/reading-prefs';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds, palettes } from '@/theme/tokens';

/** ألوان «ورقي» — Screens A · 04ب (نصّ ‎#3B2F1A على ‎#F7F1E3 ≈ ١١٫٩:١). */
export const SEPIA = { page: '#F7F1E3', text: '#3B2F1A' } as const;
/** أسطح «ورقي» الدافئة: صناديق المتن وحدوده بدرجات الورق لا رمادي الفاتح. */
export const SEPIA_COLORS = { ...SEPIA, surface: '#FCF8EE', surfaceRaised: '#EFE5CF', sunken: '#EFE5CF', border: '#E2D6BC', skeleton: '#EFE5CF' } as const;

const TONES: { key: ReadingTone; label: string; bg: string; fg: string }[] = [
  { key: 'light', label: 'فاتح', bg: palettes.light.page, fg: palettes.light.text },
  { key: 'sepia', label: 'ورقي', bg: SEPIA.page, fg: SEPIA.text },
  { key: 'dark', label: 'داكن', bg: palettes.dark.page, fg: palettes.dark.text },
];

/**
 * «إعدادات القراءة» — Screens A · 04ب: بطاقة بيضاء تحت الشريط (زاوية ٢٠، حشو ١٦)،
 * حجم الخطّ بمنزلق ١٦–٢٢ بين «أ» صغيرة وكبيرة، والخلفية فاتح · ورقي · داكن.
 * يُغلق بزرّ × أو بلمس خارجها. التغيير يسري فوراً ويُحفظ على الجهاز.
 */
export function ReadingSheet({ size, tone, appTone, onClose }: { size: number; tone: ReadingTone; appTone: ReadingTone; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="إغلاق إعدادات القراءة" importantForAccessibility="no" />
      <Animated.View
        entering={FadeIn.duration(160)}
        exiting={FadeOut.duration(120)}
        accessibilityViewIsModal
        style={[styles.card, { top: insets.top + ds.layout.appbarCollapsed + 8, backgroundColor: colors.surface }]}
      >
        <View style={styles.head}>
          <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header" maxFontSizeMultiplier={1.2}>
            إعدادات القراءة
          </Text>
          <Tap label="إغلاق" onPress={onClose} style={styles.close}>
            <Icon name="close" size={20} tone="text" monochrome />
          </Tap>
        </View>

        <View style={styles.group}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
              حجم الخط
            </Text>
            <Text style={[styles.label, { color: colors.text }]} maxFontSizeMultiplier={1.2}>
              {plainNumber(size)}
            </Text>
          </View>
          <View style={styles.sliderRow}>
            <Text style={[styles.aSmall, { color: colors.text }]} maxFontSizeMultiplier={1}>
              أ
            </Text>
            <SizeSlider value={size} />
            <Text style={[styles.aBig, { color: colors.text }]} maxFontSizeMultiplier={1}>
              أ
            </Text>
          </View>
        </View>

        <View style={styles.group}>
          <Text style={[styles.label, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
            الخلفية
          </Text>
          <View style={styles.tones} accessibilityRole="radiogroup">
            {TONES.map((t) => {
              const on = t.key === tone;
              return (
                <Tap
                  key={t.key}
                  label={`خلفية ${t.label}`}
                  role="radio"
                  accessibilityState={{ checked: on }}
                  scale={0.97}
                  onPress={() => {
                    haptic.selection();
                    // اختيار خلفية التطبيق نفسها = لا تخصيص، فيتبع المقال ثيم الجوال إن تغيّر لاحقاً.
                    setReadingPrefs({ tone: t.key === appTone ? null : t.key });
                  }}
                  style={[styles.tone, { backgroundColor: t.bg }, on ? { borderWidth: 2, borderColor: colors.primary } : { borderWidth: 1, borderColor: t.key === 'dark' ? t.bg : colors.borderStrong }]}
                >
                  {on ? <ModontyIcon name="check" size={16} color={t.fg} accent={t.fg} knockout={t.bg} /> : null}
                  <Text style={[styles.toneText, { color: t.fg }]} maxFontSizeMultiplier={1.2}>
                    {t.label}
                  </Text>
                </Tap>
              );
            })}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const STEPS = READING_SIZE.max - READING_SIZE.min;

/** منزلق بخطوات صحيحة: سحب أو لمس على المسار، وزرّا رفع/خفض لقارئ الشاشة (adjustable). */
function SizeSlider({ value }: { value: number }) {
  const { colors } = useAppTheme();
  const w = useRef(0);
  const current = useRef(value);
  current.current = value;
  const frac = (value - READING_SIZE.min) / STEPS;

  // الإيماءة تُنشأ مرّة: إعادة إنشائها مع كل خطوة تقطع السحب في منتصفه (مقيس: توقّف عند ١٩ بدل ٢٢).
  const pan = useMemo(() => {
    const pick = (x: number) => {
      if (w.current <= 0) return;
      const raw = Math.min(1, Math.max(0, x / w.current));
      // المسار يبدأ من جهة البداية: يمين في العربية.
      const f = I18nManager.isRTL ? 1 - raw : raw;
      const next = READING_SIZE.min + Math.round(f * STEPS);
      if (next !== current.current) {
        current.current = next;
        haptic.selection();
        setReadingPrefs({ size: next });
      }
    };
    return Gesture.Pan()
      .runOnJS(true)
      .minDistance(0)
      .onBegin((e) => pick(e.x))
      .onUpdate((e) => pick(e.x));
  }, []);

  return (
    <GestureDetector gesture={pan}>
      <View
        style={styles.track}
        onLayout={(e: LayoutChangeEvent) => (w.current = e.nativeEvent.layout.width)}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="حجم الخط"
        accessibilityValue={{ min: READING_SIZE.min, max: READING_SIZE.max, now: value, text: plainNumber(value) }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => {
          const d = e.nativeEvent.actionName === 'increment' ? 1 : e.nativeEvent.actionName === 'decrement' ? -1 : 0;
          const next = Math.min(READING_SIZE.max, Math.max(READING_SIZE.min, value + d));
          if (next !== value) setReadingPrefs({ size: next });
        }}
      >
        <View style={[styles.rail, { backgroundColor: colors.border }]} />
        <View style={[styles.rail, styles.fill, { width: `${frac * 100}%`, backgroundColor: colors.primary }]} />
        <View style={[styles.thumb, { start: `${frac * 100}%`, borderColor: colors.primary, backgroundColor: colors.surface }]} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    start: 12,
    end: 12,
    zIndex: 26,
    borderRadius: 20,
    padding: 16,
    gap: 16,
    shadowColor: '#0E065A',
    shadowOpacity: 0.16,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: 'Tajawal_800ExtraBold', fontSize: 16, lineHeight: 24 },
  close: { width: 48, height: 48, margin: -8, alignItems: 'center', justifyContent: 'center' },
  group: { gap: 10 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontFamily: 'Tajawal_700Bold', fontSize: 14, lineHeight: 20 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  aSmall: { fontFamily: 'Tajawal_700Bold', fontSize: 14, lineHeight: 20 },
  aBig: { fontFamily: 'Tajawal_700Bold', fontSize: 22, lineHeight: 28 },
  track: { flex: 1, height: 48, justifyContent: 'center' },
  rail: { position: 'absolute', start: 0, end: 0, height: 4, borderRadius: 2 },
  fill: { end: undefined },
  thumb: { position: 'absolute', width: 24, height: 24, marginStart: -12, borderRadius: 12, borderWidth: 2, elevation: 1 },
  tones: { flexDirection: 'row', gap: 8 },
  tone: { flex: 1, height: 56, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  toneText: { fontFamily: 'Tajawal_700Bold', fontSize: 14, lineHeight: 20 },
});
