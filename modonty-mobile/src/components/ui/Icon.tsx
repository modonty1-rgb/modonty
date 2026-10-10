import { memo } from 'react';

import { ModontyIcon, type ModontyIconName } from '@/components/brand/ModontyIcon';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, type AppColors } from '@/theme/tokens';

type Props = {
  name: ModontyIconName;
  size?: number;
  tone?: keyof AppColors;
  /** الماسة بلون الجسم (للأسطح الممتلئة باللون البراندي). */
  monochrome?: boolean;
  /** لون حلقة الماسة في علامات Filled = لون السطح تحتها مباشرة. */
  knockout?: keyof AppColors;
};

/** ModontyIcon بألوان الثيم: الجسم هادئ والماسة أكسنت (UIUX §١٠). */
export const Icon = memo(function Icon({ name, size = control.icon, tone = 'text', monochrome, knockout = 'surface' }: Props) {
  const { colors } = useAppTheme();
  const color = colors[tone];
  return <ModontyIcon name={name} size={size} color={color} accent={monochrome ? color : colors.accent} knockout={colors[knockout]} />;
});
