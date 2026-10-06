import { Image } from 'expo-image';
import { SvgXml } from 'react-native-svg';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { MODONTY_WORDMARK_LIGHT_SVG } from './modonty-wordmark-light-svg';

type ModontyWordmarkProps = { width?: number; height?: number };

/**
 * الشعار الرسمي بنسختيه — كلٌّ على الأرضية التي رُسم لها.
 *
 * الداكن: `modonty-wordmark-on-navy.png` حروفه بيضاء على خلفية شفّافة، فيجلس على الصفحة مباشرةً.
 * الفاتح: النسخة الرسمية للأرضيات الفاتحة (`admin/public/brand-assets/logo-light.svg` — حروف
 * زرقاء وصندوق «m» كحلي). كان الفاتح يعرض نسخة الداكن على لوحٍ كحلي، فيظهر مستطيلاً داكناً
 * نشازاً أعلى شاشة فاتحة (جوال خالد ٥ أكتوبر ٢٠٢٦) — والنسخة الصحيحة كانت موجودة في الأدمن.
 */
export function ModontyWordmark({ width = 140, height = 48 }: ModontyWordmarkProps) {
  const { mode } = useAppTheme();
  if (mode === 'dark') return <Image source={require('../../../assets/brand/modonty-wordmark-on-navy.png')} style={{ width, height }} contentFit="contain" />;
  return <SvgXml xml={MODONTY_WORDMARK_LIGHT_SVG} width={width} height={height} />;
}
