import { db } from "@/lib/db";
import { ArticleFAQStatus } from "@prisma/client";

export type QuestionSource = "chatbot" | "user";

export interface VisitorQuestionWithDetails {
  id: string;
  question: string;
  answer: string | null;
  status: ArticleFAQStatus;
  source: string | null;
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

export interface QuestionStats {
  pending: number;
  answered: number;
  rejected: number;
  total: number;
}

const PAGE_LIMIT = 200;

/**
 * Reader-submitted questions = articleFAQ rows whose source is `chatbot` or
 * `user`. Manual FAQs (created by the modonty team) live under /dashboard/faqs;
 * this page is the **inbox** for actual reader interactions.
 */
function readerSourceFilter() {
  return { OR: [{ source: "chatbot" }, { source: "user" }] };
}

export async function getClientVisitorQuestions(
  clientId: string,
  status?: ArticleFAQStatus
): Promise<VisitorQuestionWithDetails[]> {
  const list = await db.articleFAQ.findMany({
    where: {
      article: { clientId },
      ...readerSourceFilter(),
      ...(status && { status }),
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_LIMIT,
    select: {
      id: true,
      question: true,
      answer: true,
      status: true,
      source: true,
      submittedByName: true,
      submittedByEmail: true,
      createdAt: true,
      updatedAt: true,
      article: { select: { id: true, title: true, slug: true } },
    },
  });
  return list as VisitorQuestionWithDetails[];
}

export async function getVisitorQuestionStats(
  clientId: string
): Promise<QuestionStats> {
  const [pending, answered, rejected] = await Promise.all([
    db.articleFAQ.count({
      where: {
        article: { clientId },
        ...readerSourceFilter(),
        status: ArticleFAQStatus.PENDING,
      },
    }),
    db.articleFAQ.count({
      where: {
        article: { clientId },
        ...readerSourceFilter(),
        status: ArticleFAQStatus.PUBLISHED,
      },
    }),
    db.articleFAQ.count({
      where: {
        article: { clientId },
        ...readerSourceFilter(),
        status: ArticleFAQStatus.REJECTED,
      },
    }),
  ]);
  return {
    pending,
    answered,
    rejected,
    total: pending + answered + rejected,
  };
}

export async function getPendingQuestionsCount(
  clientId: string
): Promise<number> {
  return db.articleFAQ.count({
    where: {
      article: { clientId },
      ...readerSourceFilter(),
      status: ArticleFAQStatus.PENDING,
    },
  });
}
