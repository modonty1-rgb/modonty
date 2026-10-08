import { memo, useState, type PropsWithChildren } from 'react';
import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { control, motion } from '@/theme/tokens';

type Props = PropsWithChildren<
  Omit<PressableProps, 'style' | 'children'> & {
    label: string;
    role?: 'button' | 'link' | 'tab' | 'imagebutton' | 'checkbox' | 'switch';
    style?: StyleProp<ViewStyle>;
    /** هدف لمس ٤٨×٤٨ على الأقلّ (UIUX §١). */
    minTarget?: boolean;
  }
>;

/**
 * كل عنصر قابل للضغط: تسمية عربية لقارئ الشاشة، أثر فوري (شفافية) خلال ١٠٠ms، وهدف ٤٨dp.
 *
 * الشكل يُمرَّر مصفوفةً ثابتة لا دالّة `({ pressed }) => …`: NativeWind (react-native-css-interop)
 * يغلّف Pressable ويُسقط الشكل الدالّي — فاختفت الأُطر والخلفيات واتجاه الصفوف من كل زرّ في التطبيق
 * (مقيس على المحاكي ٩ أكتوبر). حالة الضغط تُحفظ هنا بدل ذلك.
 */
export const Tap = memo(function Tap({ label, role = 'button', style, minTarget = true, children, onPressIn, onPressOut, ...rest }: Props) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityLabel={label}
      android_disableSound={false}
      onPressIn={(e) => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        onPressOut?.(e);
      }}
      style={[minTarget && styles.target, style, pressed && styles.pressed]}
      {...rest}
    >
      {children}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  target: { minWidth: control.touch, minHeight: control.touch },
  pressed: { opacity: motion.pressedOpacity },
});
