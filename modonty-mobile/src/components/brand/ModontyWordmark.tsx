import { Image } from 'expo-image';
import { SvgXml } from 'react-native-svg';

import { useAppTheme } from '@/theme/ThemeProvider';
import { MODONTY_WORDMARK_LIGHT_SVG } from './modonty-wordmark-light-svg';

/**
 * الشعار الرسمي الكامل (BRANDING: الافتراضي في التطبيق) بنسختيه — كلٌّ على أرضيّته، كما في تطبيق
 * الكونسول: الداكن `modonty-wordmark-on-navy.png`، والفاتح `admin/public/brand-assets/logo-light.svg`
 * حرفياً. لا يُمدّ ولا يُعاد تلوينه.
 */
export function ModontyWordmark({ width, height }: { width: number; height: number }) {
  const { scheme } = useAppTheme();
  if (scheme === 'dark') {
    return (
      <Image
        source={require('../../../assets/brand/modonty-wordmark-on-navy.png')}
        style={{ width, height }}
        contentFit="contain"
        accessibilityLabel="مدونتي"
      />
    );
  }
  return <SvgXml xml={MODONTY_WORDMARK_LIGHT_SVG} width={width} height={height} accessibilityLabel="مدونتي" />;
}
