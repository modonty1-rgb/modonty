import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { brandColors } from '@/theme/tokens';
import { MARK_DIAMOND, MARK_M_PATH, MARK_SQUARE, WORD_DIAMOND, WORD_PATHS, WORDMARK_VIEWBOX } from './wordmark-geometry';

/** نفس `imageWidth` لـ expo-splash-screen في app.json — البداية تطابق صورة النظام. */
const TILE = 120;
const BLUE = '#3030FF'; // أرضيّة assets/brand/modonty-mark.png (مقيسة: 48,48,255)
const LOCK_W = 252;
const K = LOCK_W / WORDMARK_VIEWBOX.width;
const SQ = MARK_SQUARE * K;
/** الكلمة تبدأ بعد المربّع (٢٠٫٢٢) — القصّ من ٢١ لا يلمس المربّع. */
const WORD_FROM = 21;
const WORD_W = (WORDMARK_VIEWBOX.width - WORD_FROM) * K;
const U = TILE / MARK_SQUARE;

/**
 * شاشة البداية المتحرّكة — تكمل صورة النظام بلا قفزة: المربّع الأزرق نفسه في نفس المكان والحجم، ثم
 * ينكمش وينزاح لمكانه في الشعار وأزرقه يذوب في الكحلي، و«odonty» تُكتب بعده (الشعار الرسمي لاتيني)، والنقطة تظهر،
 * ثم تتلاشى على التطبيق الجاهز تحتها. النهاية = النسخة الرسمية على الكحلي (`modonty-wordmark-on-navy.png`).
 * الحركة على خيط الواجهة (Reanimated) فلا يقطعها أوّل رسم للرئيسية. مع «تقليل الحركة»: الشعار ثابت ثم تلاشٍ.
 */
export function BrandSplash({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const move = useSharedValue(0);
  const write = useSharedValue(0);
  const dot = useSharedValue(0);
  const out = useSharedValue(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (!box) setBox({ w: width, h: height });
  };

  useEffect(() => {
    if (!box) return;
    // الإخفاء بعد أوّل رسم للنسخة المطابقة — لا وميض بين صورة النظام وهذه.
    const raf = requestAnimationFrame(() => {
      SplashScreen.hideAsync().catch((e: unknown) => console.warn('[splash] hide', e));
      const finish = (ok?: boolean) => {
        'worklet';
        if (ok) runOnJS(onDone)();
      };
      if (reduced) {
        move.value = 1;
        write.value = 1;
        dot.value = 1;
        out.value = withDelay(500, withTiming(1, { duration: 200 }, finish));
        return;
      }
      move.value = withTiming(1, { duration: 520, easing: Easing.bezier(0.65, 0, 0.35, 1) });
      write.value = withDelay(380, withTiming(1, { duration: 560, easing: Easing.out(Easing.cubic) }));
      dot.value = withDelay(900, withSpring(1, { damping: 9, stiffness: 220, mass: 0.6 }));
      out.value = withDelay(1250, withTiming(1, { duration: 320, easing: Easing.in(Easing.quad) }, finish));
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [box]);

  const cx = (box?.w ?? 0) / 2;
  const cy = (box?.h ?? 0) / 2;
  const lockLeft = cx - LOCK_W / 2;
  const dx = lockLeft + SQ / 2 - cx;

  const rootStyle = useAnimatedStyle(() => ({ opacity: 1 - out.value }));
  const lockStyle = useAnimatedStyle(() => ({ transform: [{ scale: interpolate(out.value, [0, 1], [1, 1.04]) }] }));
  const tileStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(move.value, [0, 0.85], [BLUE, brandColors.navy]),
    transform: [{ translateX: move.value * dx }, { scale: interpolate(move.value, [0, 1], [1, SQ / TILE]) }],
  }));
  const wordStyle = useAnimatedStyle(() => ({ width: write.value * WORD_W }));
  const dotStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, dot.value * 2), transform: [{ rotate: '45deg' }, { scale: dot.value }] }));

  const wordDot = WORD_DIAMOND.side * K;
  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, rootStyle]} onLayout={onLayout} needsOffscreenAlphaCompositing accessible accessibilityLabel="مدونتي">
      <StatusBar style="light" />
      {box ? (
        <Animated.View style={[StyleSheet.absoluteFill, lockStyle]}>
          <Animated.View style={[styles.tile, { left: cx - TILE / 2, top: cy - TILE / 2 }, tileStyle]}>
            <Svg width={TILE} height={TILE} viewBox={`0 0 ${MARK_SQUARE} ${MARK_SQUARE}`}>
              <Path fill="#FFFFFF" d={MARK_M_PATH} />
            </Svg>
            <View
              style={[
                styles.diamond,
                { width: MARK_DIAMOND.side * U, height: MARK_DIAMOND.side * U, left: (MARK_DIAMOND.cx - MARK_DIAMOND.side / 2) * U, top: (MARK_DIAMOND.cy - MARK_DIAMOND.side / 2) * U },
              ]}
            />
          </Animated.View>
          <Animated.View style={[styles.word, { left: lockLeft + WORD_FROM * K, top: cy - SQ / 2, height: SQ }, wordStyle]}>
            {/* الكلمة ثابتة في مكانها والقصّ يكبر من اليسار — «odonty» تُكمل حرف «m» الذي في المربّع. */}
            <Svg width={LOCK_W} height={SQ} viewBox={`0 0 ${WORDMARK_VIEWBOX.width} ${WORDMARK_VIEWBOX.height}`} style={[styles.wordSvg, { left: -WORD_FROM * K }]}>
              {WORD_PATHS.map((d) => (
                <Path key={d.slice(0, 12)} fill="#FFFFFF" d={d} />
              ))}
            </Svg>
          </Animated.View>
          <Animated.View
            style={[
              styles.diamond,
              { width: wordDot, height: wordDot, left: lockLeft + WORD_DIAMOND.cx * K - wordDot / 2, top: cy - SQ / 2 + WORD_DIAMOND.cy * K - wordDot / 2 },
              dotStyle,
            ]}
          />
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // الأبعاد هنا هندسة الشعار (يسار/يمين فعليّان) — أندرويد يقلب left/right في RTL.
  root: { backgroundColor: brandColors.navy, zIndex: 1000, elevation: 1000, direction: 'ltr' },
  tile: { position: 'absolute', width: TILE, height: TILE, borderRadius: TILE * 0.1 },
  diamond: { position: 'absolute', backgroundColor: '#FFFFFF', transform: [{ rotate: '45deg' }] },
  word: { position: 'absolute', overflow: 'hidden' },
  wordSvg: { position: 'absolute', top: 0 },
});
