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
  /**
   * `filter` = شريحة فلتر الأرشيف في الموقع (`FiltersBar.tsx` — Chip): مستطيل بزوايا ٨ وارتفاع ٤٤، المختار
   * بخلفية رمادية وخطّ أثقل، والباقي بنصّ هادئ. الافتراضي `pill` كما كان.
   */
  shape?: 'pill' | 'filter';
};

/** صفّ اختيار أفقي (فلتر/ترتيب): المختار بتعبئة + حدّ، لا باللون وحده. */
function ChipRowInner<V extends string>({ options, value, onChange, label, shape = 'pill' }: Props<V>) {
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
              shape === 'filter'
                ? [styles.filter, { backgroundColor: active ? colors.surfaceHigh : colors.surface, borderColor: colors.border }]
                : {
                    backgroundColor: active ? colors.primaryContainer : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                  },
            ]}
          >
            <AppText
              variant="label"
              tone={shape === 'filter' ? (active ? 'text' : 'muted') : active ? 'onPrimaryContainer' : 'text'}
              style={shape === 'filter' && active ? styles.filterOn : undefined}
            >
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
  filter: { height: 44, borderRadius: 8, paddingHorizontal: space.sm },
  filterOn: { fontWeight: '700' },
});
