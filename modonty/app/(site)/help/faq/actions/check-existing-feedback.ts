"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getOrCreateSessionId } from "../helpers";

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
