import { db } from "@/lib/db";

export interface ClientPublishedFAQ {
  id: string;
  question: string;
  answer: string;
  articleId: string;
  articleTitle: string;
  articleSlug: string;
}

export async function getClientPublishedFaqs(clientSlug: string): Promise<ClientPublishedFAQ[]> {
  const faqs = await db.articleFAQ.findMany({
    where: {
      status: "PUBLISHED",
      answer: { not: null },
      article: {
        client: { slug: clientSlug },
        status: "PUBLISHED",
      },
    },
    orderBy: { position: "asc" },
    take: 20,
    select: {
      id: true,
      question: true,
      answer: true,
      article: {
        select: { id: true, title: true, slug: true },
      },
    },
  });

  return faqs
    .filter((f) => f.answer && f.answer.trim())
    .map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer!,
      articleId: f.article.id,
      articleTitle: f.article.title,
      articleSlug: f.article.slug,
    }));
}

export interface ClientPageFAQ {
  id: string;
  question: string;
  answer: string;
}

/**
 * Page-level FAQ (ClientFAQ) shown on the client mini-site — distinct from the
 * article-aggregated FAQ above. PUBLISHED + answered only; powers the page FAQ
 * accordion and the FAQPage JSON-LD.
 */
export async function getClientPageFaqs(clientSlug: string): Promise<ClientPageFAQ[]> {
  const faqs = await db.clientFAQ.findMany({
    where: {
      status: "PUBLISHED",
      answer: { not: null },
      client: { slug: clientSlug },
    },
    orderBy: { position: "asc" },
    take: 30,
    select: { id: true, question: true, answer: true },
  });

  return faqs
    .filter((f) => f.answer && f.answer.trim())
    .map((f) => ({ id: f.id, question: f.question, answer: f.answer! }));
}
