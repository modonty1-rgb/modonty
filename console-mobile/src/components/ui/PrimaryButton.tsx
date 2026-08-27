import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, control, fonts, radii, typography } from '@/src/theme/tokens';

type PrimaryButtonProps = { label: string; onPress: () => void; icon?: string; style?: ViewStyle; disabled?: boolean };

export function PrimaryButton({ label, onPress, style, disabled = false }: PrimaryButtonProps) {
  return <Pressable disabled={disabled} onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} style={[styles.button, disabled && styles.buttonDisabled, style]}><Text style={styles.label}>{label}</Text></Pressable>;
}
const styles = StyleSheet.create({
  button: { height: control.buttonHeight, borderRadius: radii.button, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row-reverse' },
  buttonDisabled: { opacity: 0.6 },
  label: { color: colors.textOnPrimary, fontFamily: fonts.bold, fontSize: typography.body },
});
