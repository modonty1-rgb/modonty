import { memo } from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';
import { fontScale, typography, type AppColors, type TypeRole } from '@/theme/tokens';

type Props = TextProps & {
  variant?: TypeRole;
  tone?: keyof Pick<AppColors, 'text' | 'muted' | 'interactive' | 'danger' | 'onPrimary' | 'onReels' | 'onReelsMuted' | 'onPrimaryContainer' | 'onDangerContainer' | 'onPositiveContainer' | 'onBrandFill' | 'onWarningContainer'>;
  /** تسمية التاب والشارة لا تكبران مع إعداد النظام (UIUX §٤). */
  fixedSize?: boolean;
  align?: 'auto' | 'center';
};

/** كل نصّ في التطبيق — دور من جدول الخطوط، ولون من الرموز، واتجاه من I18nManager (textAlign: auto). */
export const AppText = memo(function AppText({ variant = 'body', tone = 'text', fixedSize, align = 'auto', style, ...rest }: Props) {
  const { colors } = useAppTheme();
  return (
    <Text
      maxFontSizeMultiplier={fixedSize ? 1 : fontScale.max}
      style={[typography[variant], { color: colors[tone] }, align === 'center' ? styles.center : styles.auto, style]}
      {...rest}
    />
  );
});

const styles = StyleSheet.create({
  auto: { textAlign: 'auto', writingDirection: 'auto' },
  center: { textAlign: 'center' },
});
