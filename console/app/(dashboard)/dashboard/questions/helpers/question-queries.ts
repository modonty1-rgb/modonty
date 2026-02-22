import { db } from "@/lib/db";
import { ArticleFAQStatus } from "@prisma/client";

export interface VisitorQuestionWithDetails {
  id: string;
  question: string;
  answer: string | null;
  status: ArticleFAQStatus;
  submittedByName: string | null;
  submittedByEmail: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdAtFormatted?: string;
  article: {
    id: string;
    title: string;
    slug: string;
  };
}

export function formatQuestionDate(d: Date): string {
  const date = new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const h = date.getHours();
  const min = String(date.getMinutes()).padStart(2, "0");
  const sec = String(date.getSeconds()).padStart(2, "0");
  const hour12 = h % 12 || 12;
  const ampm = h < 12 ? "ص" : "م";
  return `${day}/${m}/${y} ${hour12}:${min}:${sec} ${ampm}`;
}

export async function getClientVisitorQuestions(
  clientId: string,
  status?: ArticleFAQStatus
): Promise<VisitorQuestionWithDetails[]> {
  const list = await db.articleFAQ.findMany({
    where: {
      article: { clientId },
      ...(status && { status }),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      question: true,
      answer: true,
      status: true,
      submittedByName: true,
      submittedByEmail: true,
      createdAt: true,
      updatedAt: true,
      article: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });
  return list as VisitorQuestionWithDetails[];
}

export async function getVisitorQuestionStats(clientId: string) {
  const [pending, answered, total] = await Promise.all([
    db.articleFAQ.count({
      where: {
        article: { clientId },
        status: ArticleFAQStatus.PENDING,
        answer: null,
      },
    }),
    db.articleFAQ.count({
      where: {
        article: { clientId },
        status: ArticleFAQStatus.PUBLISHED,
        answer: { not: null },
      },
    }),
    db.articleFAQ.count({
      where: {
        article: { clientId },
        submittedByEmail: { not: null },
      },
    }),
  ]);
  return { pending, answered, total };
}

export async function getPendingQuestionsCount(clientId: string): Promise<number> {
  return db.articleFAQ.count({
    where: {
      article: { clientId },
      status: ArticleFAQStatus.PENDING,
      answer: null,
    },
  });
}
