import { FlashList } from '@shopify/flash-list';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArticleCitationCard } from '@/src/components/articles/ArticleCitationCard';
import { ArticleQuestionCard } from '@/src/components/articles/ArticleQuestionCard';
import { ArticleSurface } from '@/src/components/articles/ArticleSurface';
import { ReviewHubCard } from '@/src/components/articles/ReviewHubCard';
import { ReviewHubSkeleton } from '@/src/components/articles/ReviewHubSkeleton';
import { useConfirm } from '@/src/components/ui/ConfirmProvider';
import { ErrorState, OfflineState } from '@/src/components/ui/MobileUI';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { approveArticleDecision, approveArticleQuestion, articleFallbackText, getArticleReview, rejectArticleQuestion, requestArticleRevision, type ArticleQuestion, type ArticleReviewDetail } from '@/src/services/articles-api';
import { MobileOfflineError } from '@/src/services/mobile-api';
import { darkColors, fonts, lightColors, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type Props = { accessToken: string; articleId: string; onDone: () => void };
type ReviewSection = 'hub' | 'article' | 'questions' | 'citations';

const questionKey = (question: ArticleQuestion) => question.id;
const citationKey = (url: string) => url;

export function ArticleReviewApiRoute({ accessToken, articleId, onDone }: Props) {
  const { mode } = useAppTheme();
  const confirm = useConfirm();
  const styles = mode === 'dark' ? darkStyles : lightStyles;
  const insets = useSafeAreaInsets();
  const [article, setArticle] = useState<ArticleReviewDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setOffline] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [questionSubmittingId, setQuestionSubmittingId] = useState<string | null>(null);
  const [changesOpen, setChangesOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [section, setSection] = useState<ReviewSection>('hub');
  const listContentStyle = useMemo(() => [styles.list, { paddingBottom: spacing.xxl + insets.bottom }], [insets.bottom, styles.list]);

  const load = useCallback(() => {
    setError(null);
    setOffline(false);
    setArticle(null);
    void getArticleReview(accessToken, articleId)
      .then(setArticle)
      .catch((reason: unknown) => {
        setOffline(reason instanceof MobileOfflineError);
        setError(reason instanceof Error ? reason.message : articleFallbackText.loadArticleFailed);
      });
  }, [accessToken, articleId]);
  useEffect(() => { load(); }, [load]);

  const backToHub = useCallback(() => { setSection('hub'); setChangesOpen(false); }, []);
  const openArticle = useCallback(() => setSection('article'), []);
  const openQuestions = useCallback(() => setSection('questions'), []);
  const openCitations = useCallback(() => setSection('citations'), []);
  const openChanges = useCallback(() => setChangesOpen(true), []);
  const cancelChanges = useCallback(() => setChangesOpen(false), []);

  /** التأكيدان يمرّان بنافذة التطبيق الواحدة لا بنافذة النظام — انظر تعليق `ConfirmProvider`. */
  const confirmApprove = useCallback(() => {
    if (!article) return;
    const labels = article.review.approve;
    void confirm({ title: labels.confirmationTitle, description: `${article.title}

${labels.confirmationDescription}`, confirmLabel: labels.label, cancelLabel: labels.cancelLabel, tone: 'brand' })
      .then((agreed) => {
        if (!agreed) return;
        setSubmitting(true);
        void approveArticleDecision(accessToken, articleId)
          .then(onDone)
          .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : articleFallbackText.approveFailed))
          .finally(() => setSubmitting(false));
      });
  }, [accessToken, article, articleId, confirm, onDone]);

  const submitChanges = useCallback(() => {
    setSubmitting(true);
    void requestArticleRevision(accessToken, articleId, feedback)
      .then(onDone)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : articleFallbackText.changesFailed))
      .finally(() => setSubmitting(false));
  }, [accessToken, articleId, feedback, onDone]);

  const applyQuestionStatus = useCallback((faqId: string, status: string) => setArticle((current) => current === null ? current : { ...current, faqs: current.faqs.map((faq) => faq.id === faqId ? { ...faq, status } : faq) }), []);

  const approveQuestion = useCallback((faqId: string) => {
    setQuestionSubmittingId(faqId);
    void approveArticleQuestion(accessToken, articleId, faqId)
      .then((payload) => applyQuestionStatus(faqId, payload.faq.status))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : articleFallbackText.questionApproveFailed))
      .finally(() => setQuestionSubmittingId(null));
  }, [accessToken, applyQuestionStatus, articleId]);

  const rejectQuestion = useCallback((faqId: string) => {
    const labels = article?.review.faqs;
    if (!labels) return;
    void confirm({ title: labels.rejectConfirmationTitle, description: labels.rejectConfirmationDescription, confirmLabel: labels.rejectLabel, cancelLabel: labels.cancelLabel })
      .then((agreed) => {
        if (!agreed) return;
        setQuestionSubmittingId(faqId);
        void rejectArticleQuestion(accessToken, articleId, faqId)
          .then((payload) => applyQuestionStatus(faqId, payload.faq.status))
          .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : articleFallbackText.questionRejectFailed))
          .finally(() => setQuestionSubmittingId(null));
      });
  }, [accessToken, applyQuestionStatus, article, articleId, confirm]);

  const questionLabels = article?.review.faqs ?? null;
  const renderQuestion = useCallback(({ item }: { item: ArticleQuestion }) => questionLabels === null ? null : <ArticleQuestionCard question={item} labels={questionLabels} isSubmitting={questionSubmittingId === item.id} onApprove={approveQuestion} onReject={rejectQuestion} />, [approveQuestion, questionLabels, questionSubmittingId, rejectQuestion]);
  const citationSourceLabel = article?.review.citations?.sourceLabel ?? '';
  const renderCitation = useCallback(({ item }: { item: string }) => <ArticleCitationCard url={item} sourceLabel={citationSourceLabel} />, [citationSourceLabel]);

  if (isOffline) return <ScrollView contentContainerStyle={styles.state}><OfflineState title={articleFallbackText.offlineTitle} description={articleFallbackText.offlineDescription} retryLabel={articleFallbackText.retryLabel} onRetry={load} /></ScrollView>;
  if (error !== null && article === null) return <ScrollView contentContainerStyle={styles.state}><ErrorState message={error} retryLabel={articleFallbackText.retryLabel} onRetry={load} /></ScrollView>;
  // الرأس يُرسم أثناء التحميل كي يبقى الرجوع متاحاً؛ وعنوانه محتوى يأتي من العقد فيأخذ مكانه شريط هيكل.
  if (article === null) return <View style={styles.screen}>
    <ScreenHeader title={null} backLabel={articleFallbackText.backLabel} onBack={onDone} />
    <View style={styles.state}><ReviewHubSkeleton /></View>
  </View>;

  const review = article.review;

  if (section === 'article') return <View style={styles.screen}>
    <ScreenHeader title={review.article.title} backLabel={review.backLabel} onBack={backToHub} />
    <ArticleSurface article={article} isSubmitting={isSubmitting} changesOpen={changesOpen} feedback={feedback} onApprove={confirmApprove} onOpenChanges={openChanges} onCancelChanges={cancelChanges} onFeedbackChange={setFeedback} onSubmitChanges={submitChanges} />
  </View>;

  if (section === 'questions' && review.faqs) return <View style={styles.screen}>
    <ScreenHeader title={review.faqs.title} backLabel={review.backLabel} onBack={backToHub} />
    <FlashList
      data={article.faqs}
      renderItem={renderQuestion}
      keyExtractor={questionKey}
      contentContainerStyle={listContentStyle}
      ListHeaderComponent={<View style={styles.contextCard}><Text style={styles.contextTitle}>{review.faqs.contextLabel}</Text></View>}
    />
  </View>;

  if (section === 'citations' && review.citations) return <View style={styles.screen}>
    <ScreenHeader title={review.citations.title} backLabel={review.backLabel} onBack={backToHub} />
    <FlashList
      data={article.citations}
      renderItem={renderCitation}
      keyExtractor={citationKey}
      contentContainerStyle={listContentStyle}
      ListHeaderComponent={<View style={styles.contextCard}><Text style={styles.contextTitle}>{review.citations.contextLabel}</Text></View>}
    />
  </View>;

  /**
   * اللوحة **بارات تنقّل لا شاشة قرار** — قرار خالد (٢٩ أغسطس).
   *
   * كنتُ أنزلتُ شريط «اعتماد · طلب تعديل» هنا، وهو تسطيحٌ لتدفّق مرحليّ: كل بار يفتح
   * شاشته الكاملة، والفعل في **قاع تلك الشاشة** بعد أن يقرأ العميل ما يقرّر بشأنه.
   * فالاعتماد يجلس تحت نصّ المقال، وقرار كل سؤال داخل بطاقته في صفحة الأسئلة.
   * إنزاله هنا يعني اعتماداً قبل القراءة — وهو عكس الغرض من الشاشة كلّها.
   */
  return <View style={styles.screen}>
    <ScreenHeader title={review.title} backLabel={review.backLabel} onBack={onDone} />
    <ScrollView contentContainerStyle={listContentStyle} keyboardShouldPersistTaps="handled">
      {error !== null ? <Text style={styles.inlineError}>{error}</Text> : null}
      <View style={styles.hubList}>
        {/**
          * البار **عنوانٌ يفتح** لا بطاقةَ تفاصيل — قرار خالد (٢٩ أغسطس).
          *
          * كان يحمل: عنواناً عامّاً «المقال» · نبذة ثلاثة أسطر · «٨٩٤ كلمة · مسودة للمراجعة»،
          * وفوقه بطاقة سياق مستقلّة تحمل عنوان المقال الحقيقي — أي أربع طبقات تصف شيئاً واحداً.
          * والنبذة والعدد يظهران داخل شاشة المقال نفسها بعد ضغطة واحدة، فذكرهما هنا تكرارٌ
          * يزاحم الشيء الوحيد الذي يميّز المقال عن غيره: عنوانه.
          */}
        <ReviewHubCard title={article.title} badgeLabel={review.article.badgeLabel} badgeTone={review.article.badgeTone} description={null} statusLabel={null} actionLabel={review.article.actionLabel} onPress={openArticle} />
        {review.faqs ? <ReviewHubCard title={review.faqs.title} badgeLabel={review.faqs.badgeLabel} badgeTone={review.faqs.badgeTone} description={review.faqs.description} statusLabel={review.faqs.statusLabel} actionLabel={review.faqs.actionLabel} onPress={openQuestions} /> : null}
        {review.citations ? <ReviewHubCard title={review.citations.title} badgeLabel={review.citations.badgeLabel} badgeTone={review.citations.badgeTone} description={review.citations.description} statusLabel={null} actionLabel={review.citations.actionLabel} onPress={openCitations} /> : null}
      </View>
    </ScrollView>
  </View>;
}

const shared = {
  screen: { flex: 1 },
  state: { flexGrow: 1, paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.md },
  list: { paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.md },
  contextCard: { borderRadius: radii.card, borderWidth: StyleSheet.hairlineWidth, marginBottom: spacing.md, padding: spacing.md },
  contextTitle: { fontFamily: fonts.regular, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, marginTop: spacing.xxs, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  hubList: { marginTop: spacing.xs },
  inlineError: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, marginBottom: spacing.sm, textAlign: 'right' as const, writingDirection: 'rtl' as const },
};

function stylesFor(palette: typeof darkColors) {
  return StyleSheet.create({
    ...shared,
    contextCard: { ...shared.contextCard, backgroundColor: palette.surface, borderColor: palette.border },
    contextTitle: { ...shared.contextTitle, color: palette.text },
    inlineError: { ...shared.inlineError, color: palette.errorText },
  });
}

const darkStyles = stylesFor(darkColors);
const lightStyles = stylesFor(lightColors);
