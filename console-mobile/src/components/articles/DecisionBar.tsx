import { Keyboard, StyleSheet, TextInput, View } from 'react-native';
import { useEffect, useRef } from 'react';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { AppText as Text } from '@/src/components/ui/AppText';
import { PillButton } from '@/src/components/ui/Nabd';
import type { ArticleReviewDetail } from '@/src/services/articles-api';
import { control, darkColors, fonts, lightColors, nabd, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type DecisionBarProps = {
  review: ArticleReviewDetail['review'];
  isSubmitting: boolean;
  /**
   * فشل الفعل — **هنا تحت إصبع العميل**. كان يُكتب في خطأ اللوحة فقط، فيضغط «اعتماد»
   * ويرجع الزرّ لحاله بلا كلمة، والرسالة (بالإنجليزي) تنتظره في شاشة أخرى.
   */
  errorMessage: string | null;
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
 * ولأنه صار داخل `ScrollView`، فالحاوية (`ArticleSurface`) هي من تحجز ارتفاع اللوحة عبر
 * `useKeyboardInset` وتنزل إلى المحرّر — افتراض `adjustResize` سقط مع edge-to-edge (قِيس:
 * اللوحة غطّت الحقل والزرّ). والحاوية تحمل `keyboardShouldPersistTaps` كي لا تبتلع أول ضغطة.
 * والاعتماد لا رجعة فيه فيمرّ بتأكيد يسمّي المقال، بينما «طلب تعديل» يفتح محرّراً.
 */
export function DecisionBar({ review, isSubmitting, errorMessage, changesOpen, feedback, onApprove, onOpenChanges, onCancelChanges, onFeedbackChange, onSubmitChanges }: DecisionBarProps) {
  const { mode } = useAppTheme();
  const styles = mode === 'dark' ? darkStyles : lightStyles;
  const palette = mode === 'dark' ? darkColors : lightColors;
  const feedbackInput = useRef<TextInput>(null);
  const canSubmitFeedback = feedback.trim().length > 0 && !isSubmitting;

  // فتح المحرّر يضع المؤشّر في الحقل مباشرةً — لا ضغطة ثانية على حقلٍ هو سبب فتح الشريط.
  useEffect(() => { if (changesOpen) feedbackInput.current?.focus(); }, [changesOpen]);

  return <View style={styles.bar}>
      {errorMessage ? <View accessibilityLiveRegion="assertive" style={styles.errorRow}>
        <ModontyIcon name="error" size={control.iconSize} primary={palette.danger} accent={palette.accent} />
        <Text style={styles.errorText}>{errorMessage}</Text>
      </View> : null}
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
          <PillButton label={isSubmitting ? review.changes.submittingLabel : review.changes.submitLabel} disabled={!canSubmitFeedback} onPress={onSubmitChanges} style={styles.action} />
          <PillButton label={review.changes.cancelLabel} tone="ghost" disabled={isSubmitting} onPress={() => { Keyboard.dismiss(); onCancelChanges(); }} style={styles.action} />
        </View>
      </> : <>
        <PillButton label={isSubmitting ? review.approve.loadingLabel : review.approve.label} icon="check" disabled={isSubmitting} onPress={onApprove} />
        <PillButton label={review.changes.title} tone="secondary" disabled={isSubmitting} onPress={onOpenChanges} />
      </>}
  </View>;
}

/**
 * «نبض»: لوح القرار سطح شبه معتم بزاوية ٢٨ (الموكب ‎.dock-glass) — الاعتماد كبسولة البطل
 * بظلّها واهتزاز متوسّط، و«طلب تعديل» كبسولة ثانوية نغمية. يبقى **داخل التمرير** تحت النصّ.
 */
function stylesFor(palette: typeof darkColors) {
  return StyleSheet.create({
    bar: { backgroundColor: palette.tabBar, borderRadius: nabd.bigCardRadius, boxShadow: `inset 0 1px 0 ${palette.edgeHighlight}, ${palette.liftShadow}`, gap: spacing.xs, marginTop: spacing.md, padding: spacing.sm },
    actions: { flexDirection: 'row-reverse', gap: spacing.xs },
    action: { flex: 1 },
    errorRow: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.xs },
    errorText: { color: palette.errorText, flex: 1, fontFamily: fonts.regular, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'right', writingDirection: 'rtl' },
    inputLabel: { color: palette.text, fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, textAlign: 'right', writingDirection: 'rtl' },
    input: { backgroundColor: palette.inputSurface, borderColor: palette.inputBorder, borderRadius: radii.field, borderWidth: control.inputBorderWidth, color: palette.text, fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, minHeight: control.buttonHeight, padding: spacing.sm, textAlign: 'right', textAlignVertical: 'top', writingDirection: 'rtl' },
  });
}

const darkStyles = stylesFor(darkColors);
const lightStyles = stylesFor(lightColors);
