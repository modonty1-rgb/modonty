import { db } from "@/lib/db";

export interface ClientFAQWithArticle {
  id: string;
  question: string;
  answer: string | null;
  status: string;
  source: string | null;
  position: number;
  submittedByName: string | null;
  submittedByEmail: string | null;
  createdAt: Date;
  updatedAt: Date;
  article: {
    id: string;
    title: string;
    slug: string;
    /** حالة المقال نفسه: سؤالٌ منشور تحت مقال غير منشور لا يصل الزائر. */
    status: string;
  };
}


const PAGE_LIMIT = 200;

/**
 * Fetches up to {@link PAGE_LIMIT} FAQs for the client. Sorted by status
 * priority (PENDING first), then position asc, then createdAt desc — so the
 * visible order matches what the user sees on the public article page.
 */
export async function getClientFaqs(
  clientId: string
): Promise<ClientFAQWithArticle[]> {
  const faqs = await db.articleFAQ.findMany({
    where: { article: { clientId } },
    select: {
      id: true,
      question: true,
      answer: true,
      status: true,
      source: true,
      position: true,
      submittedByName: true,
      submittedByEmail: true,
      createdAt: true,
      updatedAt: true,
      article: { select: { id: true, title: true, slug: true, status: true } },
    },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    take: PAGE_LIMIT,
  });
  return faqs;
}
