import { memo, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-paper';

import { Icon } from '@/components/ui/Icon';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds, space, typography } from '@/theme/tokens';

/** حقل بحث بتأخير ٤٠٠ms قبل الطلب — لا طلب لكل حرف. شكله: حبّة ٥٢ بحدّ خفيف (Screens A · 03). */
export const SearchField = memo(function SearchField({
  placeholder,
  onChange,
  autoFocus,
  initial = '',
}: {
  placeholder: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  initial?: string;
}) {
  const { colors } = useAppTheme();
  const [text, setText] = useState(initial);
  useEffect(() => {
    const t = setTimeout(() => onChange(text.trim()), 400);
    return () => clearTimeout(t);
  }, [text, onChange]);
  return (
    <View style={styles.wrap}>
      <TextInput
        mode="outlined"
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        autoFocus={autoFocus}
        returnKeyType="search"
        accessibilityLabel={placeholder}
        left={<TextInput.Icon icon={() => <Icon name="search" tone="muted" />} />}
        right={text ? <TextInput.Icon icon={() => <Icon name="close" tone="muted" size={16} />} onPress={() => setText('')} accessibilityLabel="مسح البحث" /> : undefined}
        outlineStyle={{ borderRadius: ds.radius.full, borderColor: colors.border }}
        activeOutlineColor={colors.primary}
        style={[styles.input, { backgroundColor: colors.surface }]}
        contentStyle={styles.content}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: ds.layout.gutter, paddingVertical: space.xs },
  input: { ...typography.body, height: 52 },
  content: { textAlign: 'right', writingDirection: 'rtl' },
});
