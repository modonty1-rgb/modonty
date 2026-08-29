import { Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useEffect, useRef } from 'react';
import { AppText as Text } from '@/src/components/ui/AppText';
import type { ArticleReviewDetail } from '@/src/services/articles-api';
import { control, darkColors, fonts, lightColors, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type DecisionBarProps = {
  review: ArticleReviewDetail['review'];
  isSubmitting: boolean;
  changesOpen: boolean;
  feedback: string;
  onApprove: () => void;
  onOpenChanges: () => void;
  onCancelChanges: () => void;
  onFeedbackChange: (value: string) => void;
  onSubmitChanges: () => void;
};

/**
 * شريط القرار — «اعتماد» و«طلب تعديل»، مثبَّت أسفل الشاشة.
 *
 * كان مدفوناً داخل `ArticleSurface`، أي أنّ القرار لا يُتّخذ إلا بعد فتح نصّ المقال كاملاً.
 * فكانت شاشة «مراجعة المقال» — واسمها يَعِد بالقرار — **قائمةَ توجيهٍ بلا فعل**: أزرارها
 * الثلاثة «رجوع» و«المقال» و«الأسئلة» فقط. المسافة من الرئيسية إلى القرار أربع ضغطات.
 * استُخرج هنا ليُركَّب على السطحين معاً، فيبقى النصّ والسلوك مصدراً واحداً.
 *
 * **موضعه: آخر المحتوى داخل التمرير، لا شريطاً مثبَّتاً** — قرار خالد (٢٩ أغسطس):
 * «خلّي الاعتمادية تحت عشان تضمن إنه راجع المقال كامل». الشريط المثبَّت يتيح الاعتماد
 * والعميل لم ينزل سطراً واحداً؛ وضعه تحت النصّ يجعل التمرير شرطاً ماديّاً للوصول إليه.
 * فالاحتكاك هنا **مقصود**، وهو نفس مبدأ «مرِّر لتقرأ الشروط».
 *
 * ولأنه صار داخل `ScrollView`، لا `KeyboardAvoidingView` — فهي لا تعمل داخل تمرير.
 * أندرويد افتراضه `softwareKeyboardLayoutMode: resize`، فالتمرير ينكمش ويجرّ الحقل المركَّز
 * إلى العرض بنفسه؛ والحاوية تحمل `keyboardShouldPersistTaps` كي لا تبتلع أول ضغطة.
 * والاعتماد لا رجعة فيه فيمرّ بتأكيد يسمّي المقال، بينما «طلب تعديل» يفتح محرّراً.
 */
export function DecisionBar({ review, isSubmitting, changesOpen, feedback, onApprove, onOpenChanges, onCancelChanges, onFeedbackChange, onSubmitChanges }: DecisionBarProps) {
  const { mode } = useAppTheme();
  const styles = mode === 'dark' ? darkStyles : lightStyles;
  const palette = mode === 'dark' ? darkColors : lightColors;
  const feedbackInput = useRef<TextInput>(null);
  const canSubmitFeedback = feedback.trim().length > 0 && !isSubmitting;

  // فتح المحرّر يضع المؤشّر في الحقل مباشرةً — لا ضغطة ثانية على حقلٍ هو سبب فتح الشريط.
  useEffect(() => { if (changesOpen) feedbackInput.current?.focus(); }, [changesOpen]);

  return <View style={styles.bar}>
      {changesOpen ? <>
        <Text style={styles.inputLabel}>{review.changes.inputLabel}</Text>
        <TextInput
          accessibilityLabel={review.changes.inputLabel}
          editable={!isSubmitting}
          multiline
          onChangeText={onFeedbackChange}
          placeholder={review.changes.description}
          placeholderTextColor={palette.inputPlaceholder}
          ref={feedbackInput}
          style={styles.input}
          value={feedback}
        />
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: !canSubmitFeedback }} accessibilityLabel={review.changes.submitLabel} disabled={!canSubmitFeedback} onPress={onSubmitChanges} style={({ pressed }) => [canSubmitFeedback ? styles.primary : styles.primaryDisabled, pressed && styles.pressed]}>
            <Text style={styles.primaryText}>{isSubmitting ? review.changes.submittingLabel : review.changes.submitLabel}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: isSubmitting }} accessibilityLabel={review.changes.cancelLabel} disabled={isSubmitting} onPress={() => { Keyboard.dismiss(); onCancelChanges(); }} style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
            <Text style={styles.secondaryText}>{review.changes.cancelLabel}</Text>
          </Pressable>
        </View>
      </> : <View style={styles.actions}>
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: isSubmitting }} accessibilityLabel={review.approve.label} disabled={isSubmitting} onPress={onApprove} style={({ pressed }) => [isSubmitting ? styles.primaryDisabled : styles.primary, pressed && styles.pressed]}>
          <Text style={styles.primaryText}>{isSubmitting ? review.approve.loadingLabel : review.approve.label}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: isSubmitting }} accessibilityLabel={review.changes.title} disabled={isSubmitting} onPress={onOpenChanges} style={({ pressed }) => [styles.danger, pressed && styles.pressed]}>
          <Text style={styles.dangerText}>{review.changes.title}</Text>
        </Pressable>
      </View>}
  </View>;
}

const shared = {
  pressed: { opacity: 0.72 },
  // فاصل علويّ يقول «انتهى المقال، الآن القرار» — والحشو الجانبي صفر لأنه داخل تمرير محشوّ أصلاً.
  bar: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: spacing.xl, paddingTop: spacing.lg },
  actions: { flexDirection: 'row-reverse' as const, gap: spacing.sm, marginTop: spacing.sm },
  button: { alignItems: 'center' as const, borderRadius: radii.button, flex: 1, justifyContent: 'center' as const, minHeight: control.buttonHeight },
  buttonText: { fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, writingDirection: 'rtl' as const },
  inputLabel: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  input: { borderRadius: radii.field, borderWidth: control.inputBorderWidth, fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, marginTop: spacing.xs, minHeight: control.buttonHeight, padding: spacing.sm, textAlign: 'right' as const, textAlignVertical: 'top' as const, writingDirection: 'rtl' as const },
};

function stylesFor(palette: typeof darkColors) {
  const primary = { ...shared.button, backgroundColor: palette.brandFill };
  return StyleSheet.create({
    ...shared,
    bar: { ...shared.bar, borderTopColor: palette.border },
    primary,
    primaryDisabled: { ...primary, opacity: 0.6 },
    // كان `navy` في الوضعين: يعبر 9.91:1 داكناً ويسقط إلى **2.39:1** فاتحاً — أي أنّ نصّ
    // أهمّ زرّ في المنتج غير مقروء على نصف المستخدمين. `onBrandFill` يعبر في الاثنين (7.37).
    primaryText: { ...shared.buttonText, color: palette.onBrandFill },
    danger: { ...shared.button, borderColor: palette.danger, borderWidth: control.inputBorderWidth },
    dangerText: { ...shared.buttonText, color: palette.danger },
    secondary: { ...shared.button, borderColor: palette.border, borderWidth: control.inputBorderWidth },
    secondaryText: { ...shared.buttonText, color: palette.text },
    inputLabel: { ...shared.inputLabel, color: palette.text },
    input: { ...shared.input, backgroundColor: palette.inputSurface, borderColor: palette.inputBorder, color: palette.text },
  });
}

const darkStyles = stylesFor(darkColors);
const lightStyles = stylesFor(lightColors);
