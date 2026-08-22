import { getViewer } from "@/app/(site)/articles/[slug]/helpers/get-viewer";
import { getPendingFaqsForCurrentUser } from "@/app/(site)/articles/[slug]/data/get-pending-faqs-for-current-user";
import { ArticleFaq } from "./ArticleFaq";

interface ReaderFaqProps {
  articleId: string;
  faqsCount: number;
  faqs: Parameters<typeof ArticleFaq>[0]["faqs"];
}

/**
 * The FAQ section as an island — because of ONE list: the questions this reader has sent and
 * that are still awaiting the partner's answer. The published questions and answers themselves
 * come from the shell and stay in the prerendered HTML, where the FAQ schema needs them.
 */
export async function ReaderFaq({ articleId, faqsCount, faqs }: ReaderFaqProps) {
  const { userId } = await getViewer();
  const pendingFaqs = userId ? await getPendingFaqsForCurrentUser(articleId) : [];

  return <ArticleFaq articleId={articleId} faqsCount={faqsCount} faqs={faqs} pendingFaqs={pendingFaqs} />;
}
