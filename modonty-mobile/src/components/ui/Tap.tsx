import { memo, useRef, useState, type PropsWithChildren } from 'react';
import { Animated, Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { control, dsMotion, motion } from '@/theme/tokens';

/**
 * أثر الضغط بـAnimated الأصلي في React Native (useNativeDriver) لا بـReanimated: توثيق Reanimated الرسمي
 * (Performance › «Lower FPS while scrolling») — الإطارات تهبط أثناء التمرير حين تكثر المكوّنات المتحرّكة على
 * الشاشة، وحلّه يحتاج Reanimated ≥ 4.2 ونحن على 4.1.7. كل زرّ كان مكوّن Reanimated (١٤٠ استعمالاً)؛ قِيس على
 * جوال A21s (١٠ أكتوبر): مرحلة «animation» في الخيط الرئيسي ٣٫٨ ث من ١٤ أثناء تمرير دليل الشركاء.
 */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = PropsWithChildren<
  Omit<PressableProps, 'style' | 'children'> & {
    label: string;
    role?: 'button' | 'link' | 'tab' | 'imagebutton' | 'checkbox' | 'switch' | 'radio';
    style?: StyleProp<ViewStyle>;
    /** هدف لمس ٤٨×٤٨ على الأقلّ (UIUX §١). */
    minTarget?: boolean;
    /**
     * أثر الضغط بالتصغير (motion.press — Tokens §١٠): البطاقات والبلاطات ٠٫٩٧. بدونه: شفافية فقط.
     * مع تقليل الحركة يبقى أثر الشفافية وحده.
     */
    scale?: number;
  }
>;

/**
 * كل عنصر قابل للضغط: تسمية عربية لقارئ الشاشة، أثر فوري (شفافية) خلال ١٠٠ms، وهدف ٤٨dp.
 *
 * الشكل يُمرَّر مصفوفةً ثابتة لا دالّة `({ pressed }) => …`: NativeWind (react-native-css-interop)
 * يغلّف Pressable ويُسقط الشكل الدالّي — فاختفت الأُطر والخلفيات واتجاه الصفوف من كل زرّ في التطبيق
 * (مقيس على المحاكي ٩ أكتوبر). حالة الضغط تُحفظ هنا بدل ذلك.
 */
export const Tap = memo(function Tap({ label, role = 'button', style, minTarget = true, scale, children, onPressIn, onPressOut, ...rest }: Props) {
  const [pressed, setPressed] = useState(false);
  const reduced = useReducedMotion();
  const springy = scale != null && !reduced;
  const k = useRef<Animated.Value | null>(null);
  if (springy && !k.current) k.current = new Animated.Value(1);
  return (
    <AnimatedPressable
      accessibilityRole={role}
      accessibilityLabel={label}
      android_disableSound={false}
      onPressIn={(e) => {
        setPressed(true);
        if (springy && k.current) Animated.timing(k.current, { toValue: scale, duration: dsMotion.pressIn.duration, useNativeDriver: true }).start();
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        if (springy && k.current) Animated.spring(k.current, { toValue: 1, ...dsMotion.pressOut, useNativeDriver: true }).start();
        onPressOut?.(e);
      }}
      style={[minTarget && styles.target, style, pressed && (springy ? styles.pressedSoft : styles.pressed), springy && k.current ? { transform: [{ scale: k.current }] } : null]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  target: { minWidth: control.touch, minHeight: control.touch },
  pressed: { opacity: motion.pressedOpacity },
  pressedSoft: { opacity: 0.92 },
});
