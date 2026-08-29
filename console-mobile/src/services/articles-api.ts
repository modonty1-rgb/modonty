import { mobileRequest } from '@/src/services/mobile-api';

/**
 * Article-domain service module. Every screen label comes from the server — the types
 * below name what the endpoint promises, and anything optional is genuinely allowed to
 * be absent, in which case the screen drops that element instead of inventing a value.
 */

/**
 * Bootstrap copy. Every other Arabic string on these screens ships from the endpoint;
 * these appear only when the server never answered, so they cannot come from it. They
 * live in the service module — never inside a screen file.
 */
export const articleFallbackText = {
  offlineTitle: 'ما في اتصال',
  offlineDescription: 'افحص الشبكة ثم أعد المحاولة.',
  retryLabel: 'إعادة المحاولة',
  backLabel: 'رجوع',
  loadArticlesFailed: 'ما قدرنا نجيب المقالات.',
  loadArticleFailed: 'ما قدرنا نفتح المقال.',
  approveFailed: 'ما قدرنا نعتمد المقال.',
  changesFailed: 'ما قدرنا نرسل طلب التعديل.',
  questionApproveFailed: 'ما قدرنا نعتمد السؤال.',
  questionRejectFailed: 'ما قدرنا نرفض السؤال.',
} as const;

export type ArticleImage = { url: string; bunnyUrl: string | null; altText: string | null };

export type ArticleListItem = {
  /** نطاق الرابط الذي تفتحه البطاقة — يُعرض قبل الضغط فيعرف العميل أين يذهب. */
  siteHost: string | null;
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  statusLabel: string;
  wordCount: number | null;
  wordCountLabel: string | null;
  datePublished: string | null;
  publishedDateLabel: string | null;
  metadataLabel: string | null;
  siteUrl: string | null;
  featuredImage: ArticleImage | null;
  category: { name: string } | null;
  contentFaqCount: number;
  citationCount: number | null;
  updatedAt: string;
  /** Decision list only — the category on its own line, above the title. */
  categoryLabel?: string | null;
  /** Decision list only — «date · word count», precomputed so the cell never formats. */
  metaLabel?: string | null;
  pendingFaqCount?: number;
  questionsLabel?: string | null;
  citationsLabel?: string | null;
};

export type ArticleListReview = {
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  retryLabel: string;
  openLabelPrefix: string;
  subtitle?: string;
  countLabel?: string;
  errorTitle?: string;
  offlineTitle?: string;
  offlineDescription?: string;
  reviewActionLabel?: string;
  openSiteLabel?: string;
  openSiteAccessibilityPrefix?: string;
  openSiteError?: string;
};

export type ArticleListCollection = { articles: ArticleListItem[]; review: ArticleListReview };

export type ArticleQuestion = { id: string; question: string; answer: string | null; status: string; source: 'manual' | null; position: number };

export type ReviewBadgeTone = 'pending' | 'done' | 'neutral';

export type ArticleQuestionsReview = {
  title: string;
  badgeTone: ReviewBadgeTone;
  badgeLabel: string;
  description: string | null;
  statusLabel: string;
  actionLabel: string;
  contextLabel: string;
  sourceLabel: string;
  seoLabel: string;
  approveLabel: string;
  approvingLabel: string;
  rejectLabel: string;
  rejectingLabel: string;
  rejectConfirmationTitle: string;
  rejectConfirmationDescription: string;
  cancelLabel: string;
  approvedLabel: string;
  rejectedLabel: string;
};

/** Citations arrive as plain URLs — the schema stores `Article.citations String[]` and nothing more. */
export type ArticleCitationsReview = {
  title: string;
  badgeTone: ReviewBadgeTone;
  badgeLabel: string;
  description: string;
  actionLabel: string;
  contextLabel: string;
  sourceLabel: string;
};

export type ArticleReviewDetail = {
  id: string;
  title: string;
  status: string;
  content: string | null;
  featuredImage: ArticleImage | null;
  faqs: ArticleQuestion[];
  citations: string[];
  review: {
    title: string;
    backLabel: string;
    errorTitle: string;
    offlineTitle: string;
    offlineDescription: string;
    retryLabel: string;
    article: { title: string; badgeTone: ReviewBadgeTone; badgeLabel: string; heroBadgeLabel: string; description: string | null; metaLabel: string | null; headLabel: string | null; actionLabel: string; emptyContentLabel: string };
    faqs: ArticleQuestionsReview | null;
    citations: ArticleCitationsReview | null;
    changes: { title: string; description: string; inputLabel: string; submitLabel: string; submittingLabel: string; cancelLabel: string };
    approve: { label: string; loadingLabel: string; confirmationTitle: string; confirmationDescription: string; cancelLabel: string };
    ymyl: { title: string; description: string } | null;
  };
};

export function getDecisionArticles(accessToken: string): Promise<ArticleListCollection> {
  return mobileRequest<ArticleListCollection>('/articles?scope=decision', accessToken, articleFallbackText.loadArticlesFailed);
}

/** S11 «المقالات المنشورة» — same item shape as the decision list, its own review copy. */
export function getPublishedArticles(accessToken: string): Promise<ArticleListCollection> {
  return mobileRequest<ArticleListCollection>('/articles?scope=published', accessToken, articleFallbackText.loadArticlesFailed);
}

export function getArticleReview(accessToken: string, articleId: string): Promise<ArticleReviewDetail> {
  return mobileRequest<{ article: ArticleReviewDetail }>(`/articles/${articleId}`, accessToken, articleFallbackText.loadArticleFailed).then((payload) => payload.article);
}

export function approveArticleDecision(accessToken: string, articleId: string): Promise<{ status: string }> {
  return mobileRequest<{ status: string }>(`/articles/${articleId}/approve`, accessToken, articleFallbackText.approveFailed, { method: 'POST' });
}

export function requestArticleRevision(accessToken: string, articleId: string, feedback: string): Promise<{ status: string }> {
  return mobileRequest<{ status: string }>(`/articles/${articleId}/request-changes`, accessToken, articleFallbackText.changesFailed, { method: 'POST', body: { feedback } });
}

export function approveArticleQuestion(accessToken: string, articleId: string, faqId: string): Promise<{ faq: { id: string; status: string } }> {
  return mobileRequest<{ faq: { id: string; status: string } }>(`/articles/${articleId}/faqs/${faqId}/approve`, accessToken, articleFallbackText.questionApproveFailed, { method: 'POST' });
}

export function rejectArticleQuestion(accessToken: string, articleId: string, faqId: string): Promise<{ faq: { id: string; status: string } }> {
  return mobileRequest<{ faq: { id: string; status: string } }>(`/articles/${articleId}/faqs/${faqId}/reject`, accessToken, articleFallbackText.questionRejectFailed, { method: 'POST' });
}
