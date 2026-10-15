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
    /** حالة المقال نفسه: سؤالٌ منشور تحت مقال غير منشور لا يصل الزائر. */
    status: string;
  };
}

export interface FaqStats {
  pending: number;
  published: number;
  rejected: number;
  total: number;
  fromReaders: number;
}

/**
 * Fetches ALL of the client's FAQs — PENDING first (enum order), then position,
 * then newest. No row cap: the tab counts are computed from this list, and a
 * `take: 200` here hid 83 of 91 pending FAQs while the KPI card said 91
 * (مدونتي, 15 Oct 2026). The table already reveals rows page by page.
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
    orderBy: [{ status: "asc" }, { position: "asc" }, { createdAt: "desc" }],
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
