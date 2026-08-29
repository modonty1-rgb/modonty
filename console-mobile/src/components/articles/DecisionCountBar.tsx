import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { control, darkColors, fonts, lightColors, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/**
 * The count strip above the decision list. It reports, it does not act — so it is not a
 * touch target and carries no navigation.
 *
 * كان يحمل `arrow-left` مُداراً ٩٠° فيظهر سهماً لأسفل داخل شريط محدَّد الحواف — وهي حرفياً
 * هيئة القائمة المنسدلة المطويّة في Material 3 وHIG. الشريط لا ينفتح ولا يُضغط، فالسهم
 * **وعدٌ كاذب**: المستخدم يضغط، فلا شيء يحدث، فيقرأ الشاشة معطّلة. المارك الآن `info` —
 * غير اتّجاهي، يقول «هذه حقيقة» لا «اضغطني».
 */
export function DecisionCountBar({ label }: { label: string }) {
  const { mode } = useAppTheme();
  const styles = mode === 'dark' ? darkStyles : lightStyles;
  const palette = mode === 'dark' ? darkColors : lightColors;
  return <View accessibilityRole="summary" accessibilityLabel={label} style={styles.bar}>
    <ModontyIcon name="info" size={control.iconSize} primary={palette.warning} accent={palette.warning} />
    <Text style={styles.label}>{label}</Text>
  </View>;
}

const shared = {
  bar: { alignItems: 'center' as const, borderRadius: radii.button, borderWidth: control.inputBorderWidth, flexDirection: 'row-reverse' as const, gap: spacing.sm, minHeight: control.minTouchTarget, paddingHorizontal: spacing.md },
  label: { flex: 1, fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'right' as const, writingDirection: 'rtl' as const },
};

const darkStyles = StyleSheet.create({ ...shared, bar: { ...shared.bar, borderColor: darkColors.warning }, label: { ...shared.label, color: darkColors.warning } });
const lightStyles = StyleSheet.create({ ...shared, bar: { ...shared.bar, borderColor: lightColors.warning }, label: { ...shared.label, color: lightColors.warning } });
