import { db } from "@/lib/db";
import { ArticleFAQStatus } from "@prisma/client";
import { readerSourceFilter } from "@/lib/questions/reader-source-filter";
import type { VisitorQuestionWithDetails } from "@/lib/questions/visitor-question-with-details";

export interface QuestionStats {
  pending: number;
  answered: number;
  rejected: number;
  total: number;
}

const PAGE_LIMIT = 200;


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
