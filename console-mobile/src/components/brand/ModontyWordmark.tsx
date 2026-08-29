import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { radii, spacing } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type ModontyWordmarkProps = { width?: number; height?: number };

/**
 * الشعار الرسمي كما هو — على اللون الذي رُسم له.
 *
 * الأصل `modonty-wordmark-on-navy.png` حروفه **بيضاء على خلفية شفّافة**، أي أنّه مخبوز
 * لأرضية كحلية. في الوضع الداكن يجلس على الصفحة مباشرةً فيقرأ. وفي الفاتح كان يجلس على
 * رأسٍ شبه أبيض، فتختفي «odonty» كلياً — الشعار مكسور نصفه على نصف مستخدمينا.
 *
 * الحلّ **ليس** إعادة تلوين الماركة (لا نملك أصلاً فاتحاً، وتلوين شعار بالكود تزوير علامة)،
 * بل إعطاؤه لوحه الكحلي في الفاتح — «لوحة الشعار» القياسية في كل دليل ماركة. صندوق الـ«m»
 * الكحلي داخل الأصل يذوب في اللوح فيبدو لقباً واحداً، والماركة لم تُمسّ بكسلاً.
 */
export function ModontyWordmark({ width = 140, height = 48 }: ModontyWordmarkProps) {
  const { theme, mode } = useAppTheme();
  const mark = <Image source={require('../../../assets/brand/modonty-wordmark-on-navy.png')} style={{ width, height }} contentFit="contain" />;
  if (mode === 'dark') return mark;
  return <View style={[styles.plate, { backgroundColor: theme.colors.navy }]}>{mark}</View>;
}

const styles = StyleSheet.create({
  plate: { alignItems: 'center', borderRadius: radii.field, justifyContent: 'center', paddingHorizontal: spacing.xs, paddingVertical: spacing.xxs },
});
