import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { fonts, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/**
 * رمز الشاشة (S05 · S11 …) — **مرجع بيننا في التطوير فقط**.
 *
 * خالد (٢٩ أغسطس): «في كل صفحة عند الرأس ضع مرجع الصفحة، يظهر في التطوير فقط».
 * ثلاثة قيود تجعله أداة لا عنصر واجهة:
 *  1. `__DEV__` — يختفي كلياً من حزمة الإنتاج، فلا يراه عميل أبداً.
 *  2. `pointerEvents="none"` — لا يبتلع لمسة، ولو جلس فوق زرّ.
 *  3. `accessibilityElementsHidden` + `importantForAccessibility` — لا يسمعه قارئ الشاشة،
 *     فلا يلوّث ترتيب القراءة أثناء اختبار الوصولية نفسه.
 * وهو مطلق الموضع فلا يزحزح أي تخطيط بكسلاً واحداً — إضافة لا تغيير.
 */
export function ScreenRef({ code }: { code: string }) {
  const { theme, mode } = useAppTheme();
  if (!__DEV__) return null;
  // أحمر صريح ليُرى في اللقطة، ونصّه يتبدّل بالوضع: الأحمر الفاتح في الداكن يحتاج كحلياً
  // (6.63:1) والأحمر الداكن في الفاتح يحتاج أبيض (4.83:1) — الأبيض عليه 2.66:1 لا يُقرأ.
  const codeColor = mode === 'dark' ? theme.colors.navy : theme.colors.textOnPrimary;
  return <View
    pointerEvents="none"
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
    style={[styles.badge, { backgroundColor: theme.colors.danger, borderColor: theme.colors.danger }]}
  >
    <Text maxFontSizeMultiplier={1} style={[styles.text, { color: codeColor }]}>{code}</Text>
  </View>;
}

const styles = StyleSheet.create({
  // أسفل البداية لا أعلاها: الرأس فيه عنوان كل شاشة، والشريط جلس فوق «مرحباً، كيما زون».
  // القاع مفرَّغ في كل الشاشات — القوائم تحجز أسفلها لشريط التابات أصلاً.
  badge: { borderRadius: radii.field, borderWidth: StyleSheet.hairlineWidth, bottom: spacing.xxs, paddingHorizontal: spacing.xs, paddingVertical: spacing.xxs, position: 'absolute', start: spacing.xxs, zIndex: 10 },
  text: { fontFamily: fonts.bold, fontSize: typography.tabLabel, letterSpacing: 1, lineHeight: typography.lineHeightTabLabel },
});
