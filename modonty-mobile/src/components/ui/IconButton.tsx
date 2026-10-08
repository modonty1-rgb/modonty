import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ModontyIconName } from '@/components/brand/ModontyIcon';
import { control, radius, type AppColors } from '@/theme/tokens';
import { Icon } from './Icon';
import { Tap } from './Tap';

type Props = {
  icon: ModontyIconName;
  label: string;
  onPress: () => void;
  tone?: keyof AppColors;
  disabled?: boolean;
  selected?: boolean;
};

/** زرّ أيقونة: الرمز ٢٤dp داخل هدف ٤٨×٤٨ (UIUX §١). */
export const IconButton = memo(function IconButton({ icon, label, onPress, tone = 'text', disabled, selected }: Props) {
  return (
    <Tap
      label={label}
      onPress={onPress}
      disabled={disabled}
      accessibilityState={{ disabled, selected }}
      style={styles.button}
      hitSlop={0}
    >
      <View style={disabled ? styles.disabled : undefined}>
        <Icon name={icon} tone={tone} />
      </View>
    </Tap>
  );
});

const styles = StyleSheet.create({
  button: {
    width: control.touch,
    height: control.touch,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.4 },
});
