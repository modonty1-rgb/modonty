import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { fonts, nabd, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/**
 * دائرة الحرف الأوّل على بطاقات الجمهور — «نبض» (‎.shape.c): ٤٠ على سطح `secondary`.
 *
 * كانت ثلاث درجات تُشتقّ من المعرّف؛ الموكب المعتمد يوحّدها بدرجة الشكل الواحدة، فالبطاقة
 * لا تحمل لوناً ثانياً ينافس شارة الحالة على الانتباه.
 */
export function AudienceAvatar({ initial }: { initial: string | null }) {
  const { theme } = useAppTheme();
  return <View style={[styles.circle, { backgroundColor: theme.colors.secondary }]}>
    {initial ? <Text maxFontSizeMultiplier={1} style={[styles.initial, { color: theme.colors.onSecondary }]}>{initial}</Text> : null}
  </View>;
}

const styles = StyleSheet.create({
  circle: { width: nabd.shapeSize, height: nabd.shapeSize, borderRadius: nabd.pill, alignItems: 'center', justifyContent: 'center' },
  initial: { fontFamily: fonts.bold, fontSize: typography.body, lineHeight: typography.lineHeightBody },
});
