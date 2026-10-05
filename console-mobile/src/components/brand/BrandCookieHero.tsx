import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { Cookie } from '@/src/components/ui/Nabd';
import { nabd, spacing } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/** نسبة الشعار الأصلي (١٢٤×٤٣) — يُصغَّر داخل الكعكة ولا يُمطّ. */
const WORDMARK_WIDTH = 92;
const WORDMARK_HEIGHT = Math.round(WORDMARK_WIDTH * (43 / 124));
/** ظلّ الموكب (‎drop-shadow 0 14px 28px rgba(48,48,255,.45)) على دائرة أصغر قليلاً من الكعكة. */
const GLOW = '0px 14px 28px rgba(48,48,255,0.45)';
const GLOW_SIZE = 96;

/**
 * بطل شاشات ما قبل الجلسة (S01 الدخول · استعادة الجلسة) — «كعكة» بأزرق البطل ١٢٠ وفيها الشعار
 * الرسمي كما هو (حروف بيضاء وصندوق «m» كحلي — على الأزرق يقرأ في الوضعين بلا لوح).
 *
 * التوهّج الأزرق تحتها `boxShadow` على دائرة خلف الشكل — يعمل من أندرويد ٩ (التوثيق)، بينما
 * `filter: drop-shadow` الذي يتبع الموجات لا يعمل قبل أندرويد ١٢؛ وتحت الموجات لا يكاد يُفرَّق.
 */
export function BrandCookieHero({ label }: { label?: string }) {
  const { theme } = useAppTheme();
  return <View accessible={label !== undefined} accessibilityRole={label ? "image" : undefined} accessibilityLabel={label} style={styles.wrap}>
    <View style={styles.stage}>
      <View style={[styles.glow, { backgroundColor: theme.colors.hero, boxShadow: GLOW }]} />
      <Cookie size={nabd.loginCookieSize} color={theme.colors.hero}>
        <Image source={require('../../../assets/brand/modonty-wordmark-on-navy.png')} style={styles.mark} contentFit="contain" />
      </Cookie>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingBottom: spacing.xxs, paddingTop: spacing.xl },
  stage: { alignItems: 'center', height: nabd.loginCookieSize, justifyContent: 'center', width: nabd.loginCookieSize },
  glow: { borderRadius: GLOW_SIZE, height: GLOW_SIZE, position: 'absolute', width: GLOW_SIZE },
  mark: { height: WORDMARK_HEIGHT, width: WORDMARK_WIDTH },
});
