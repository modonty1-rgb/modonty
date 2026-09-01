"use server";

import { ArticleFAQStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

/** The questions this reader already asked on this article and hasn't been answered yet. */
export async function getPendingFaqsForCurrentUser(
  articleId: string
): Promise<Array<{ id: string; question: string; createdAt: Date }>> {
  // Guarded like the rest of the signed-in path (`helpers/get-viewer.ts` carries the full note):
  // this runs in THREE of the article's five reader islands, each inside a `<Suspense>` that
  // stops nothing — Suspense catches suspension, not errors, so a throw here reached
  // `articles/[slug]/error.tsx` and replaced a complete, cached article with «المقال ما فتحت».
  // An empty list is the same thing a reader with no pending questions sees.
  try {
    const session = await auth();
    if (!session?.user?.email) return [];

    return await db.articleFAQ.findMany({
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
  } catch (err) {
    console.error(`[article/${articleId}] pending questions unavailable:`, err);
    return [];
  }
}
