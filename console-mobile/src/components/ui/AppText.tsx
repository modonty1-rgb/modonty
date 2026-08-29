import { Text as NativeText, type TextProps } from 'react-native';
import { fontScale } from '@/src/theme/tokens';

/**
 * The only text primitive for Console Mobile UI.
 * It keeps Android font scaling consistent with the approved screen contracts.
 */
export function AppText({ maxFontSizeMultiplier = fontScale.uiMaxMultiplier, ...props }: TextProps) {
  return <NativeText maxFontSizeMultiplier={maxFontSizeMultiplier} {...props} />;
}
