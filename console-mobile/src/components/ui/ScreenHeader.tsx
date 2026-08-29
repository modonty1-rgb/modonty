import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { SkeletonBar } from '@/src/components/ui/MobileUI';
import { control, darkColors, fonts, lightColors, skeleton, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/**
 * رأس **كل** شاشة مدفوعة — واحدٌ لا اثنان.
 *
 * كان في التطبيق رأسان متطابقا المهمّة بعُرفين **متعاكسين**:
 *  - `ReviewScreenHeader` (المقال · الأسئلة · الحجوزات) يضع الرجوع **يميناً**.
 *  - `BrandHeading` (حسابي · الدعم · رفع الفيديو) يضعه **يساراً**، فوق صفّ شعار منفصل.
 *
 * والاتجاه ليس ذوقاً: في RTL تبدأ القراءة من اليمين، فالرجوع — وهو الخروج — يسكن بداية
 * القراءة، وهذا ما يفعله أندرويد نفسه. فكان التطبيق يعلّم المستخدم عُرفاً في ثلاث شاشات
 * ثمّ ينقضه في ثلاث. ومكوّنان لمهمّة واحدة يتباعدان مع الوقت بالضرورة.
 *
 * وسقط صفّ الشعار: هو نفسه في رأس الشِيل فوق كل تاب، وتكراره في شاشة مدفوعة يأكل ≈٥٦dp
 * قبل أن يبدأ المحتوى ولا يضيف معلومة. الشاشة المدفوعة مكان مهمّة، لا ترويسة براندية.
 *
 * `title === null` = العنوان لم يصل من العقد بعد → شريط هيكل، والرجوع يبقى مضغوطاً:
 * التنقّل لا ينتظر البيانات.
 */
export function ScreenHeader({ title, backLabel, onBack }: { title: string | null; backLabel: string; onBack: () => void }) {
  const { mode } = useAppTheme();
  const styles = mode === 'dark' ? darkStyles : lightStyles;
  const palette = mode === 'dark' ? darkColors : lightColors;
  return <View style={styles.header}>
    <Pressable accessibilityRole="button" accessibilityLabel={backLabel} onPress={onBack} style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
      {/* السهم مرآةٌ في العربية: `arrow-left` يشير إلى بداية القراءة بعد القلب. */}
      <View style={styles.mirrored}><ModontyIcon name="arrow-left" size={control.headerIconSize} primary={palette.text} accent={palette.accent} /></View>
    </Pressable>
    {title === null
      ? <View style={styles.title}><SkeletonBar height={skeleton.titleHeight} width="55%" /></View>
      : <Text numberOfLines={1} style={styles.title}>{title}</Text>}
  </View>;
}

const shared = {
  pressed: { opacity: 0.72 },
  header: { alignItems: 'center' as const, flexDirection: 'row-reverse' as const, gap: spacing.sm, height: control.headerHeight, paddingHorizontal: spacing.screenHorizontal },
  back: { alignItems: 'center' as const, height: control.minTouchTarget, justifyContent: 'center' as const, width: control.minTouchTarget },
  mirrored: { transform: [{ scaleX: -1 }] },
  title: { flex: 1, fontFamily: fonts.medium, fontSize: typography.pageTitle, lineHeight: typography.lineHeightPageTitle, textAlign: 'right' as const, writingDirection: 'rtl' as const },
};

const darkStyles = StyleSheet.create({ ...shared, title: { ...shared.title, color: darkColors.text } });
const lightStyles = StyleSheet.create({ ...shared, title: { ...shared.title, color: lightColors.text } });
