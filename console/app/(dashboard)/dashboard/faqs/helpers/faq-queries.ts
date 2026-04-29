import { db } from "@/lib/db";

export type FaqSource = "manual" | "chatbot" | "user";

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
  };
}

export interface FaqStats {
  pending: number;
  published: number;
  rejected: number;
  total: number;
  fromReaders: number;
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
      article: { select: { id: true, title: true, slug: true } },
    },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    take: PAGE_LIMIT,
  });
  return faqs;
}

export async function getFaqStats(clientId: string): Promise<FaqStats> {
  const [pending, published, rejected, fromReaders] = await Promise.all([
    db.articleFAQ.count({ where: { article: { clientId }, status: "PENDING" } }),
    db.articleFAQ.count({
      where: { article: { clientId }, status: "PUBLISHED" },
    }),
    db.articleFAQ.count({
      where: { article: { clientId }, status: "REJECTED" },
    }),
    db.articleFAQ.count({
      where: {
        article: { clientId },
        OR: [{ source: "chatbot" }, { source: "user" }],
      },
    }),
  ]);
  return {
    pending,
    published,
    rejected,
    total: pending + published + rejected,
    fromReaders,
  };
}

/** Most-recent updatedAt across this client's FAQs — used for "آخر نشاط" badge */
export async function getFaqsLastActivity(
  clientId: string
): Promise<Date | null> {
  const top = await db.articleFAQ.findFirst({
    where: { article: { clientId } },
    orderBy: { updatedAt: "desc" },
    select: { updatedAt: true },
  });
  return top?.updatedAt ?? null;
}
