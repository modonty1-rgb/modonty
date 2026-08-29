import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import type { ArticleQuestion, ArticleQuestionsReview } from '@/src/services/articles-api';
import { control, darkColors, fonts, lightColors, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type ArticleQuestionCardProps = {
  question: ArticleQuestion;
  labels: ArticleQuestionsReview;
  isSubmitting: boolean;
  onApprove: (faqId: string) => void;
  onReject: (faqId: string) => void;
};

export const ArticleQuestionCard = memo(function ArticleQuestionCard({ question, labels, isSubmitting, onApprove, onReject }: ArticleQuestionCardProps) {
  const { mode } = useAppTheme();
  const styles = mode === 'dark' ? darkStyles : lightStyles;
  const handleApprove = useCallback(() => onApprove(question.id), [onApprove, question.id]);
  const handleReject = useCallback(() => onReject(question.id), [onReject, question.id]);
  const isPending = question.status === 'PENDING';
  const resolvedLabel = question.status === 'PUBLISHED' ? labels.approvedLabel : labels.rejectedLabel;
  return <View style={styles.card}>
    <Text style={styles.source}>{labels.sourceLabel}</Text>
    <Text style={styles.seo}>{labels.seoLabel}</Text>
    <Text style={styles.question}>{question.question}</Text>
    {question.answer ? <Text style={styles.answer}>{question.answer}</Text> : null}
    {isPending ? <View style={styles.actions}>
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: isSubmitting }} accessibilityLabel={labels.approveLabel} disabled={isSubmitting} onPress={handleApprove} style={isSubmitting ? styles.approveDisabled : styles.approve}>
        <Text style={styles.approveText}>{isSubmitting ? labels.approvingLabel : labels.approveLabel}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: isSubmitting }} accessibilityLabel={labels.rejectLabel} disabled={isSubmitting} onPress={handleReject} style={isSubmitting ? styles.rejectDisabled : styles.reject}>
        <Text style={styles.rejectText}>{isSubmitting ? labels.rejectingLabel : labels.rejectLabel}</Text>
      </Pressable>
    </View> : <View style={styles.resolved}><Text maxFontSizeMultiplier={1} style={styles.resolvedText}>{resolvedLabel}</Text></View>}
  </View>;
});

const shared = {
  card: { borderRadius: radii.card, borderWidth: StyleSheet.hairlineWidth, marginBottom: spacing.sm, padding: spacing.md },
  source: { fontFamily: fonts.medium, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  seo: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  question: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, marginTop: spacing.xs, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  answer: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, marginTop: spacing.xs, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  actions: { flexDirection: 'row-reverse' as const, gap: spacing.sm, marginTop: spacing.md },
  button: { alignItems: 'center' as const, borderRadius: radii.button, borderWidth: 1, flex: 1, justifyContent: 'center' as const, minHeight: control.buttonHeight },
  buttonText: { fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, writingDirection: 'rtl' as const },
  resolved: { alignSelf: 'flex-start' as const, borderRadius: radii.field, borderWidth: StyleSheet.hairlineWidth, marginTop: spacing.md, paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs },
  resolvedText: { fontFamily: fonts.medium, fontSize: typography.tabLabel, lineHeight: typography.lineHeightTabLabel, writingDirection: 'rtl' as const },
};

function stylesFor(palette: typeof darkColors) {
  const approve = { ...shared.button, borderColor: palette.textInteractive };
  const reject = { ...shared.button, borderColor: palette.danger };
  return StyleSheet.create({
    ...shared,
    card: { ...shared.card, backgroundColor: palette.surface, borderColor: palette.border },
    source: { ...shared.source, color: palette.textInteractive },
    seo: { ...shared.seo, color: palette.muted },
    question: { ...shared.question, color: palette.text },
    answer: { ...shared.answer, color: palette.muted },
    approve,
    approveDisabled: { ...approve, opacity: 0.6 },
    approveText: { ...shared.buttonText, color: palette.textInteractive },
    reject,
    rejectDisabled: { ...reject, opacity: 0.6 },
    rejectText: { ...shared.buttonText, color: palette.danger },
    resolved: { ...shared.resolved, borderColor: palette.border },
    resolvedText: { ...shared.resolvedText, color: palette.muted },
  });
}

const darkStyles = stylesFor(darkColors);
const lightStyles = stylesFor(lightColors);
