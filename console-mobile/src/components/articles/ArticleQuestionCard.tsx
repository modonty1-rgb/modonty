import { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { PillButton, StatusBadge, TonalCard } from '@/src/components/ui/Nabd';
import type { ArticleQuestion, ArticleQuestionsReview } from '@/src/services/articles-api';
import { fonts, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type ArticleQuestionCardProps = {
  question: ArticleQuestion;
  labels: ArticleQuestionsReview;
  isSubmitting: boolean;
  /** فشل القبول أو الرفض على **هذا** السؤال — تحت زرّيه، لا في شاشة أخرى. */
  errorMessage: string | null;
  onApprove: (faqId: string) => void;
  onReject: (faqId: string) => void;
};

/**
 * سؤال من فريق مدونتي — «نبض»: بطاقة نغمية، والقرار زرّان كبسوليّان: «قبول» بأزرق البطل
 * (اهتزاز متوسّط) و«رفض» شبحيّ بحدّ ٣:١ (يمرّ بتأكيد يسمّي ما سيحدث). وبعد القرار شارة حالة.
 */
export const ArticleQuestionCard = memo(function ArticleQuestionCard({ question, labels, isSubmitting, errorMessage, onApprove, onReject }: ArticleQuestionCardProps) {
  const { theme } = useAppTheme();
  const handleApprove = useCallback(() => onApprove(question.id), [onApprove, question.id]);
  const handleReject = useCallback(() => onReject(question.id), [onReject, question.id]);
  const isPending = question.status === 'PENDING';
  const isApproved = question.status === 'PUBLISHED';
  return <TonalCard style={styles.card}>
    <View style={styles.head}>
      <Text style={[styles.secondary, styles.source, { color: theme.colors.muted }]}>{labels.sourceLabel}</Text>
      {isPending
        ? labels.pendingLabel ? <StatusBadge label={labels.pendingLabel} tone="warning" /> : null
        : <StatusBadge label={isApproved ? labels.approvedLabel : labels.rejectedLabel} tone={isApproved ? 'positive' : 'danger'} />}
    </View>
    <Text style={[styles.question, { color: theme.colors.text }]}>{question.question}</Text>
    {question.answer ? <Text style={[styles.answer, { color: theme.colors.muted }]}>{question.answer}</Text> : null}
    <Text style={[styles.secondary, { color: theme.colors.textInteractive }]}>{labels.seoLabel}</Text>
    {isPending ? <View style={styles.actions}>
      <PillButton label={isSubmitting ? labels.approvingLabel : labels.approveLabel} icon="check" size="medium" glow={false} disabled={isSubmitting} onPress={handleApprove} style={styles.action} />
      <PillButton label={isSubmitting ? labels.rejectingLabel : labels.rejectLabel} icon="close" size="medium" tone="ghost" disabled={isSubmitting} onPress={handleReject} style={styles.action} />
    </View> : null}
    {errorMessage ? <Text accessibilityLiveRegion="assertive" style={[styles.secondary, { color: theme.colors.errorText }]}>{errorMessage}</Text> : null}
  </TonalCard>;
});

const styles = StyleSheet.create({
  card: { gap: spacing.xs, marginBottom: spacing.sm },
  head: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.xs, justifyContent: 'space-between' },
  source: { flex: 1 },
  secondary: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl' },
  question: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right', writingDirection: 'rtl' },
  answer: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl' },
  actions: { flexDirection: 'row-reverse', gap: spacing.xs, marginTop: spacing.xs },
  action: { flex: 1 },
});
