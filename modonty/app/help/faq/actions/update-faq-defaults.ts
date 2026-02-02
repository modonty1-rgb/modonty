"use server";

import { db } from "@/lib/db";

/**
 * Update existing FAQs to set upvoteCount and downvoteCount to 0 if they are null
 * Run this after pushing the schema changes to the database
 */
export async function updateFAQDefaults() {
  try {
    const result = await db.fAQ.updateMany({
      where: {
        OR: [
          { upvoteCount: null },
          { downvoteCount: null },
        ],
      },
      data: {
        upvoteCount: 0,
        downvoteCount: 0,
      },
    });

    console.log(`Updated ${result.count} FAQs with default counts`);
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Error updating FAQ defaults:", error);
    return { success: false, error: "Failed to update FAQ defaults" };
  }
}

/**
 * Recalculate all FAQ counts from the FAQFeedback table
 * Useful for one-time migration or fixing data inconsistencies
 */
export async function recalculateFAQCounts() {
  try {
    const allFAQs = await db.fAQ.findMany({
      select: { id: true },
    });

    if (allFAQs.length === 0) {
      return { success: true, count: 0, message: "No FAQs found" };
    }

    const faqIds = allFAQs.map((faq) => faq.id);

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

    let updatedCount = 0;

    for (const faq of allFAQs) {
      const calculatedCounts = countsMap.get(faq.id) || { upvoteCount: 0, downvoteCount: 0 };
      
      await db.fAQ.update({
        where: { id: faq.id },
        data: {
          upvoteCount: calculatedCounts.upvoteCount,
          downvoteCount: calculatedCounts.downvoteCount,
        },
      });
      
      updatedCount++;
    }

    console.log(`Recalculated counts for ${updatedCount} FAQs`);
    return { success: true, count: updatedCount };
  } catch (error) {
    console.error("Error recalculating FAQ counts:", error);
    return { success: false, error: "Failed to recalculate FAQ counts" };
  }
}
