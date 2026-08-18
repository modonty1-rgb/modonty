"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

/**
 * The visitor's verdict on one answer — the only human judgment Modo gets.
 *
 * Everything downstream depends on it: the five reranker thresholds are tuned against a set of
 * questions with known-good answers, and without ratings that set can only ever be written by
 * hand (measured 2026-08-18: 35 questions judged by me, which is guesswork at scale).
 *
 * Ownership is checked, not assumed — the id travels to the browser in the `done` frame, so
 * without this a visitor could rate anyone's conversation.
 */
export async function rateAnswer(
  messageId: string,
  isHelpful: boolean
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "سجّل دخولك عشان تقيّم" };
  }
  if (!/^[0-9a-f]{24}$/.test(messageId)) {
    return { success: false, error: "معرّف غير صالح" };
  }

  try {
    // updateMany, not update: it filters by owner in the same statement, so a wrong id simply
    // matches nothing instead of throwing and leaking that the row exists.
    const { count } = await db.chatbotMessage.updateMany({
      where: { id: messageId, userId: session.user.id },
      data: { wasHelpful: isHelpful },
    });

    if (count === 0) return { success: false, error: "الرسالة غير موجودة" };
    return { success: true };
  } catch (error) {
    console.error("[rateAnswer]", error);
    return { success: false, error: "تعذّر حفظ التقييم" };
  }
}
