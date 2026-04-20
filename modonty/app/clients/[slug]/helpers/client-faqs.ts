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
