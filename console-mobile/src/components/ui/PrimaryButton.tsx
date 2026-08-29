import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { control, fonts, radii, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type PrimaryButtonProps = { label: string; onPress: () => void; icon?: string; style?: ViewStyle; disabled?: boolean };

export function PrimaryButton({ label, onPress, style, disabled = false }: PrimaryButtonProps) {
  const { theme } = useAppTheme();
  return <Pressable disabled={disabled} onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} style={[styles.button, { backgroundColor: theme.colors.primary }, disabled && styles.buttonDisabled, style]}><Text style={[styles.label, { color: theme.colors.textOnPrimary }]}>{label}</Text></Pressable>;
}
const styles = StyleSheet.create({
  button: { height: control.buttonHeight, borderRadius: radii.button, alignItems: 'center', justifyContent: 'center', flexDirection: 'row-reverse' },
  buttonDisabled: { opacity: 0.6 },
  label: { fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody },
});
