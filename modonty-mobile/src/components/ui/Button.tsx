import { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';

import type { ModontyIconName } from '@/components/brand/ModontyIcon';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, radius, typography } from '@/theme/tokens';
import { Icon } from './Icon';

type Props = {
  label: string;
  onPress: () => void;
  /** Filled لفعل أساسي واحد · Outlined للثانوي · Text للثالثي (BRANDING — أنماط M3). */
  kind?: 'filled' | 'outlined' | 'text';
  icon?: ModontyIconName;
  /** أثناء الإرسال: الزرّ يقول ما يحدث ويمنع الضغط المزدوج (UIUX §٨). */
  busyLabel?: string;
  busy?: boolean;
  disabled?: boolean;
  danger?: boolean;
  compact?: boolean;
};

export const Button = memo(function Button({ label, onPress, kind = 'filled', icon, busy, busyLabel, disabled, danger, compact }: Props) {
  const { colors } = useAppTheme();
  const mode = kind === 'filled' ? 'contained' : kind === 'outlined' ? 'outlined' : 'text';
  const fg = kind === 'filled' ? colors.onPrimary : danger ? colors.danger : colors.interactive;
  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      disabled={disabled || busy}
      loading={busy}
      buttonColor={kind === 'filled' ? (danger ? colors.danger : colors.primary) : undefined}
      textColor={fg}
      icon={icon && !busy ? ({ size }) => <Icon name={icon} size={size} tone={kind === 'filled' ? 'onPrimary' : 'interactive'} /> : undefined}
      style={[styles.button, kind === 'outlined' && { borderColor: colors.inputBorder }, !compact && styles.full]}
      contentStyle={styles.content}
      labelStyle={styles.label}
      accessibilityLabel={busy && busyLabel ? busyLabel : label}
      accessibilityState={{ busy, disabled: disabled || busy }}
    >
      {busy && busyLabel ? busyLabel : label}
    </PaperButton>
  );
});

const styles = StyleSheet.create({
  button: { borderRadius: radius.button },
  full: { alignSelf: 'stretch' },
  content: { minHeight: control.buttonHeight, flexDirection: 'row-reverse' },
  label: { ...typography.label, marginVertical: 0 },
});
