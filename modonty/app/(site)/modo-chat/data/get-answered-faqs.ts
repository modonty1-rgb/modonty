import "server-only";

import { ArticleStatus, ArticleFAQStatus, SubscriptionStatus } from "@prisma/client";

import { db } from "@/lib/db";

export interface AnsweredFaq {
  question: string;
  answer: string;
  articleId: string;
  articleTitle: string;
  partnerName: string;
}

const MAX_FAQS = 40;

/**
 * Questions real visitors asked, answered by the partner in their own words.
 *
 * This is the best material Modo has and it was sitting unused. An article is written once for
 * everyone; these are answers a licensed professional wrote for a specific person who asked —
 * exactly the phrasing the next person will use, and signed by someone accountable.
 *
 * It also closes the loop Khalid described (2026-08-18): visitor asks → partner answers → the
 * answer serves everyone who asks afterwards, instead of one inbox and one reader.
 *
 * Only PUBLISHED rows with a real answer, from active partners in this industry — the same bar
 * the public FAQ section on the article uses.
 */
export async function getAnsweredFaqs(industryId: string): Promise<AnsweredFaq[]> {
  const rows = await db.articleFAQ.findMany({
    where: {
      status: ArticleFAQStatus.PUBLISHED,
      AND: [{ answer: { not: null } }, { answer: { not: "" } }],
      article: {
        status: ArticleStatus.PUBLISHED,
        client: { industryId, subscriptionStatus: SubscriptionStatus.ACTIVE },
      },
    },
    select: {
      question: true,
      answer: true,
      articleId: true,
      article: { select: { title: true, client: { select: { name: true } } } },
    },
    orderBy: { updatedAt: "desc" },
    take: MAX_FAQS,
  });

  return rows.flatMap((r) =>
    r.answer
      ? [{
          question: r.question,
          answer: r.answer,
          articleId: r.articleId,
          articleTitle: r.article.title,
          partnerName: r.article.client.name,
        }]
      : []
  );
}
