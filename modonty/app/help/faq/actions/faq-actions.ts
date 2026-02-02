"use server";

import { db } from "@/lib/db";

export async function getActiveFAQs() {
  try {
    const faqs = await db.fAQ.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
      select: {
        id: true,
        question: true,
        answer: true,
        lastReviewed: true,
        updatedAt: true,
        upvoteCount: true,
        downvoteCount: true,
      },
    });

    if (faqs.length === 0) {
      return [];
    }

    const faqIds = faqs.map((faq) => faq.id);

    const feedbackCounts = await db.fAQFeedback.groupBy({
      by: ["faqId", "isHelpful"],
      where: {
        faqId: { in: faqIds },
      },
      _count: {
        id: true,
      },
    });

    const countsMap = new Map<string, { upvoteCount: number; downvoteCount: number }>();

    for (const count of feedbackCounts) {
      const existing = countsMap.get(count.faqId) || { upvoteCount: 0, downvoteCount: 0 };
      
      if (count.isHelpful) {
        existing.upvoteCount = count._count.id;
      } else {
        existing.downvoteCount = count._count.id;
      }
      
      countsMap.set(count.faqId, existing);
    }

    return faqs.map((faq) => {
      const calculatedCounts = countsMap.get(faq.id) || { upvoteCount: 0, downvoteCount: 0 };
      
      return {
        ...faq,
        upvoteCount: calculatedCounts.upvoteCount,
        downvoteCount: calculatedCounts.downvoteCount,
      };
    });
  } catch (error) {
    console.error("Error fetching active FAQs:", error);
    return [];
  }
}
