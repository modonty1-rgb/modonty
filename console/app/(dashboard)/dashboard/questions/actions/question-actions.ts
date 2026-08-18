"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { ArticleFAQStatus } from "@prisma/client";
import { messages } from "@/lib/messages";
import { publishFaqAnswer } from "@/lib/faq/publish-faq-answer";

type Result = { success: true } | { success: false; error: string };

async function getClientId(): Promise<string | null> {
  const session = await auth();
  return (session as { clientId?: string })?.clientId ?? null;
}

/** The partner answers a visitor's question — one implementation, shared with /dashboard/faqs. */
export async function replyToQuestion(faqId: string, answer: string): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };
  return publishFaqAnswer(faqId, clientId, answer);
}

/** Reject a question (mark as not-going-to-be-answered). */
export async function rejectQuestion(faqId: string): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  try {
    const faq = await db.articleFAQ.findFirst({
      where: { id: faqId, article: { clientId } },
      select: { id: true },
    });
    if (!faq) return { success: false, error: messages.error.notFound };

    await db.articleFAQ.update({
      where: { id: faqId },
      data: { status: ArticleFAQStatus.REJECTED },
    });
    revalidatePath("/dashboard/questions");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

/** Restore a REJECTED or PUBLISHED question back to PENDING for re-handling. */
export async function restoreQuestion(faqId: string): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  try {
    const faq = await db.articleFAQ.findFirst({
      where: { id: faqId, article: { clientId } },
      select: { id: true },
    });
    if (!faq) return { success: false, error: messages.error.notFound };

    await db.articleFAQ.update({
      where: { id: faqId },
      data: { status: ArticleFAQStatus.PENDING },
    });
    revalidatePath("/dashboard/questions");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}
