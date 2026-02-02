"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getOrCreateSessionId, getClientIp, getUserAgent } from "../helpers/session-helper";

export async function submitFAQFeedback(faqId: string, isHelpful: boolean) {
  try {
    // Validate FAQ exists and fetch current counts
    const faq = await db.fAQ.findUnique({
      where: { id: faqId },
      select: { 
        id: true, 
        isActive: true,
        upvoteCount: true,
        downvoteCount: true,
      },
    });

    if (!faq) {
      return { success: false, error: "السؤال غير موجود" };
    }

    if (!faq.isActive) {
      return { success: false, error: "هذا السؤال غير متاح حالياً" };
    }

    // Get current user session
    const session = await auth();
    const userId = session?.user?.id || null;

    // Get or create session ID for anonymous users
    const sessionId = userId ? null : await getOrCreateSessionId();

    // Check for existing feedback
    const existingFeedback = await db.fAQFeedback.findFirst({
      where: {
        faqId,
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(sessionId ? [{ sessionId }] : []),
        ],
      },
    });

    // Get metadata
    const ipAddress = await getClientIp();
    const userAgent = await getUserAgent();

    // Handle feedback creation or update atomically using transaction
    await db.$transaction(async (tx) => {
      if (existingFeedback) {
        // If same value, no change needed
        if (existingFeedback.isHelpful === isHelpful) {
          return; // No-op, but still return success
        }

        // Update existing feedback
        await tx.fAQFeedback.update({
          where: { id: existingFeedback.id },
          data: {
            isHelpful,
            ipAddress,
            userAgent,
          },
        });

        // Adjust counts: decrement old, increment new - handle null values
        const updateData: {
          upvoteCount?: { increment: number } | { set: number };
          downvoteCount?: { increment: number } | { set: number };
        } = {};

        if (existingFeedback.isHelpful) {
          // Was helpful, now not helpful
          updateData.upvoteCount = faq.upvoteCount == null 
            ? { set: 0 } 
            : { increment: -1 };
          updateData.downvoteCount = faq.downvoteCount == null 
            ? { set: 1 } 
            : { increment: 1 };
        } else {
          // Was not helpful, now helpful
          updateData.upvoteCount = faq.upvoteCount == null 
            ? { set: 1 } 
            : { increment: 1 };
          updateData.downvoteCount = faq.downvoteCount == null 
            ? { set: 0 } 
            : { increment: -1 };
        }

        await tx.fAQ.update({
          where: { id: faqId },
          data: updateData,
        });
      } else {
        // Create new feedback record
        await tx.fAQFeedback.create({
          data: {
            faqId,
            userId,
            sessionId,
            isHelpful,
            ipAddress,
            userAgent,
          },
        });

        // Update FAQ counts - handle null values
        const updateData: {
          upvoteCount?: { increment: number } | { set: number };
          downvoteCount?: { increment: number } | { set: number };
        } = {};

        if (isHelpful) {
          updateData.upvoteCount = faq.upvoteCount == null 
            ? { set: 1 } 
            : { increment: 1 };
        } else {
          updateData.downvoteCount = faq.downvoteCount == null 
            ? { set: 1 } 
            : { increment: 1 };
        }

        await tx.fAQ.update({
          where: { id: faqId },
          data: updateData,
        });
      }
    });

    return { success: true, message: "شكراً لملاحظاتك" };
  } catch (error: any) {
    console.error("Error submitting FAQ feedback:", error);

    // Handle Prisma unique constraint violation (duplicate feedback)
    if (error.code === "P2002") {
      return { 
        success: false, 
        error: "لقد قمت بتقييم هذا السؤال مسبقاً",
        alreadySubmitted: true,
      };
    }

    // Handle other Prisma errors
    if (error.code?.startsWith("P")) {
      return { success: false, error: "حدث خطأ في قاعدة البيانات" };
    }

    return { success: false, error: "فشل إرسال الملاحظات. يرجى المحاولة مرة أخرى" };
  }
}

/**
 * Check if user has already submitted feedback for a FAQ
 */
export async function checkExistingFeedback(faqId: string): Promise<{
  hasFeedback: boolean;
  isHelpful?: boolean;
}> {
  try {
    const session = await auth();
    const userId = session?.user?.id || null;
    const sessionId = userId ? null : await getOrCreateSessionId();

    const existingFeedback = await db.fAQFeedback.findFirst({
      where: {
        faqId,
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(sessionId ? [{ sessionId }] : []),
        ],
      },
      select: { isHelpful: true },
    });

    if (existingFeedback) {
      return {
        hasFeedback: true,
        isHelpful: existingFeedback.isHelpful,
      };
    }

    return { hasFeedback: false };
  } catch (error) {
    console.error("Error checking existing feedback:", error);
    return { hasFeedback: false };
  }
}
