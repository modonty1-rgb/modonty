import { memo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';
import { control, radius, space } from '@/theme/tokens';
import { AppText } from './AppText';
import { Tap } from './Tap';

export type ChipOption<V extends string> = { value: V; label: string };

type Props<V extends string> = {
  options: readonly ChipOption<V>[];
  value: V;
  onChange: (value: V) => void;
  label: string;
};

/** صفّ اختيار أفقي (فلتر/ترتيب): المختار بتعبئة + حدّ، لا باللون وحده. */
function ChipRowInner<V extends string>({ options, value, onChange, label }: Props<V>) {
  const { colors } = useAppTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} accessibilityLabel={label}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Tap
            key={o.value}
            label={o.label}
            role="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            minTarget={false}
            hitSlop={6}
            style={[
              styles.chip,
              {
                backgroundColor: active ? colors.primaryContainer : colors.surface,
                borderColor: active ? colors.primary : colors.border,
              },
            ]}
          >
            <AppText variant="label" tone={active ? 'onPrimaryContainer' : 'text'}>
              {o.label}
            </AppText>
          </Tap>
        );
      })}
    </ScrollView>
  );
}

export const ChipRow = memo(ChipRowInner) as typeof ChipRowInner;

const styles = StyleSheet.create({
  row: { paddingHorizontal: space.screen, gap: space.xs, paddingVertical: 4 },
  chip: {
    // ٣٦ مثل فلاتر الموقع (h-9)؛ الهدف ٤٨ يكمله hitSlop.
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: space.sm,
    borderRadius: radius.pill,
    borderWidth: control.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
