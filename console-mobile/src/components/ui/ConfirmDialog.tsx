import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { control, fonts, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  /** فعل لا رجعة فيه (رفض · حذف) → الزرّ أحمر ممتلئ. غيره → أخضر الماركة. */
  tone?: 'danger' | 'brand';
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * نافذة تأكيد من داخل التطبيق — بديل `Alert.alert`، وسببان لا واحد:
 *
 * 1. **الشكل:** `Alert` نافذة النظام: رمادية على تطبيق كحليّ، بخطّها لا خطّنا، وزرّ الرفض
 *    بنفس وزن «إلغاء» بصرياً — و`style: 'destructive'` الذي يصبغه أحمر **لا يعمل على
 *    أندرويد أصلاً، إنما على iOS**. فالفعل الهدّام كان يبدو كالمحايد على منصّتنا الشاحنة.
 * 2. **الويب:** `react-native-web` يشحن `class Alert { static alert() {} }` — دالّة فارغة
 *    حرفياً. فكل تأكيد في التطبيق صامت على الديسك توب، أي أنّ زرّ «اعتماد المقال» لا يفعل
 *    شيئاً هناك ولا يمكن فحصه. و`Modal` يعمل على المنصّتين، فصار المسار قابلاً للاختبار.
 *
 * زرّ الإلغاء أولاً في ترتيب القراءة (يمين العربية) لأنه المخرج الآمن، والهدّام أبعد
 * عن الإبهام. والخلفية تُغلق بالضغط، و`onRequestClose` يجعل زرّ رجوع أندرويد إلغاءً.
 */
export function ConfirmDialog({ visible, title, description, confirmLabel, cancelLabel, tone = 'danger', onConfirm, onCancel }: ConfirmDialogProps) {
  const { theme } = useAppTheme();
  const confirmFill = tone === 'danger' ? theme.colors.danger : theme.colors.brandFill;
  const confirmInk = tone === 'danger' ? theme.colors.textOnPrimary : theme.colors.onBrandFill;
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
    {/**
      * الخلفية والبطاقة `accessible={false}` عمداً: كانتا ضاغطتين بدور `button`، فصار
      * زرّ داخل زرّ — HTML غير صالح على الويب، وقارئ الشاشة يعلن الخلفية كلها زرّاً
      * فيضيع «إلغاء» و«تأكيد» داخله. الضغط على الخلفية يبقى إلغاءً بالإصبع، والمخرج
      * المُعلَن لقارئ الشاشة هو زرّ «إلغاء» نفسه وزرّ رجوع أندرويد عبر `onRequestClose`.
      */}
    <Pressable accessible={false} onPress={onCancel} style={styles.backdrop}>
      <Pressable accessible={false} accessibilityViewIsModal onPress={() => undefined} style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.description, { color: theme.colors.muted }]}>{description}</Text>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" accessibilityLabel={cancelLabel} onPress={onCancel} style={({ pressed }) => [styles.button, { borderColor: theme.colors.border }, pressed && styles.pressed]}>
            <Text style={[styles.buttonText, { color: theme.colors.text }]}>{cancelLabel}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={confirmLabel} onPress={onConfirm} style={({ pressed }) => [styles.button, styles.confirm, { backgroundColor: confirmFill, borderColor: confirmFill }, pressed && styles.pressed]}>
            <Text style={[styles.buttonText, { color: confirmInk }]}>{confirmLabel}</Text>
          </Pressable>
        </View>
      </Pressable>
    </Pressable>
  </Modal>;
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.72 },
  backdrop: { alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.56)', flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl },
  card: { borderRadius: radii.card, borderWidth: StyleSheet.hairlineWidth, maxWidth: spacing.xxl * 12, padding: spacing.lg, width: '100%' },
  title: { fontFamily: fonts.bold, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right', writingDirection: 'rtl' },
  description: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, marginTop: spacing.xs, textAlign: 'right', writingDirection: 'rtl' },
  actions: { flexDirection: 'row-reverse', gap: spacing.sm, marginTop: spacing.lg },
  button: { alignItems: 'center', borderRadius: radii.button, borderWidth: control.inputBorderWidth, flex: 1, justifyContent: 'center', minHeight: control.buttonHeight },
  confirm: { borderWidth: 0 },
  buttonText: { fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, writingDirection: 'rtl' },
});
