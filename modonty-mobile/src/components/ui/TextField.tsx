import { forwardRef, memo } from 'react';
import { StyleSheet, View, type TextInput as RNTextInput } from 'react-native';
import { HelperText, TextInput, type TextInputProps } from 'react-native-paper';

import { useAppTheme } from '@/theme/ThemeProvider';
import { control, radius, space, typography } from '@/theme/tokens';

type Props = Omit<TextInputProps, 'mode' | 'error' | 'theme'> & {
  label: string;
  error?: string | null;
  hint?: string;
  /** البريد وكلمة المرور والهاتف: LTR داخل RTL (UIUX §٩). */
  ltr?: boolean;
};

/**
 * حقل إدخال: بئر أغمق من البطاقة + حدّ يعبر ٣:١ (درس الكونسول)، تسمية فوق الحقل، وخطأ نصّاً تحته.
 */
export const TextField = memo(
  forwardRef<RNTextInput, Props>(function TextField({ label, error, hint, ltr, style, multiline, ...rest }, ref) {
    const { colors } = useAppTheme();
    return (
      <View style={styles.wrap}>
        <TextInput
          ref={ref}
          mode="outlined"
          label={label}
          error={!!error}
          multiline={multiline}
          placeholderTextColor={colors.placeholder}
          outlineColor={colors.inputBorder}
          activeOutlineColor={colors.primary}
          outlineStyle={styles.outline}
          style={[styles.input, { backgroundColor: colors.inputSurface }, multiline && styles.multiline, style]}
          contentStyle={ltr ? styles.ltr : styles.rtl}
          accessibilityLabel={label}
          {...rest}
        />
        {error || hint ? (
          <HelperText type={error ? 'error' : 'info'} visible style={styles.helper}>
            {error ?? hint}
          </HelperText>
        ) : null}
      </View>
    );
  }),
);

const styles = StyleSheet.create({
  wrap: { gap: space.xxs },
  outline: { borderRadius: radius.field, borderWidth: control.border },
  input: { ...typography.body, minHeight: control.inputHeight },
  multiline: { minHeight: control.inputHeight * 3 },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  ltr: { textAlign: 'left', writingDirection: 'ltr' },
  helper: { ...typography.secondary, paddingHorizontal: 0 },
});
