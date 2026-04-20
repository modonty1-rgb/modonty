import { db } from "@/lib/db";

export interface ClientFAQWithArticle {
  id: string;
  question: string;
  answer: string | null;
  status: string;
  source: string | null;
  position: number;
  createdAt: Date;
  article: {
    id: string;
    title: string;
    slug: string;
  };
}

export async function getClientFaqs(clientId: string): Promise<ClientFAQWithArticle[]> {
  const faqs = await db.articleFAQ.findMany({
    where: {
      article: { clientId },
    },
    select: {
      id: true,
      question: true,
      answer: true,
      status: true,
      source: true,
      position: true,
      createdAt: true,
      article: {
        select: { id: true, title: true, slug: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return faqs;
}

export async function getFaqStats(clientId: string) {
  const [pending, published, rejected] = await Promise.all([
    db.articleFAQ.count({ where: { article: { clientId }, status: "PENDING" } }),
    db.articleFAQ.count({ where: { article: { clientId }, status: "PUBLISHED" } }),
    db.articleFAQ.count({ where: { article: { clientId }, status: "REJECTED" } }),
  ]);

  return { pending, published, rejected, total: pending + published + rejected };
}

export function formatFaqDate(date: Date): string {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
