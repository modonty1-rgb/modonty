import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { control, space } from '@/theme/tokens';
import { Icon } from './Icon';

/** تقييم من ٥ بعلامة التقييم من الماركة — النجوم الممتلئة بلون النصّ والفارغة باهتة، مع نصّ لقارئ الشاشة. */
export const Stars = memo(function Stars({ value, size = control.iconInline }: { value: number; size?: number }) {
  const full = Math.round(value);
  return (
    <View style={styles.row} accessible accessibilityLabel={`التقييم ${full} من ٥`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Icon key={i} name="rating" size={size} tone={i < full ? 'text' : 'border'} monochrome={i >= full} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: space.xxs } });
