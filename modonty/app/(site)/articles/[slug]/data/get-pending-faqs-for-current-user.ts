"use server";

import { ArticleFAQStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

/** The questions this reader already asked on this article and hasn't been answered yet. */
export async function getPendingFaqsForCurrentUser(
  articleId: string
): Promise<Array<{ id: string; question: string; createdAt: Date }>> {
  const session = await auth();
  if (!session?.user?.email) return [];

  return db.articleFAQ.findMany({
    where: {
      articleId,
      submittedByEmail: session.user.email,
      status: ArticleFAQStatus.PENDING,
      answer: null,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, question: true, createdAt: true },
  });
}
