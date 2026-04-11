"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { ArticleFAQStatus } from "@prisma/client";
import { messages } from "@/lib/messages";

export async function replyToQuestion(
  faqId: string,
  clientId: string,
  answer: string
): Promise<{ success: boolean; error?: string }> {
  const trimmed = answer?.trim();
  if (!trimmed) {
    return { success: false, error: messages.error.answer_required };
  }

  const faq = await db.articleFAQ.findFirst({
    where: { id: faqId, article: { clientId } },
    select: {
      id: true,
      question: true,
      submittedByEmail: true,
      article: { select: { slug: true, title: true, clientId: true } },
    },
  });
  if (!faq) {
    return { success: false, error: messages.error.notFound };
  }

  await db.articleFAQ.update({
    where: { id: faqId },
    data: {
      answer: trimmed,
      status: ArticleFAQStatus.PUBLISHED,
    },
  });

  // Notify the user who submitted the question
  if (faq.submittedByEmail) {
    try {
      const user = await db.user.findUnique({
        where: { email: faq.submittedByEmail },
        select: { id: true },
      });
      if (user) {
        await db.notification.create({
          data: {
            userId: user.id,
            clientId: faq.article.clientId ?? undefined,
            type: "faq_reply",
            title: "تم الرد على سؤالك",
            body: `${faq.question.slice(0, 100)}`,
          },
        });
      }
    } catch {
      // Notification failure must not block the reply
    }
  }

  revalidatePath(`/articles/${faq.article.slug}`);
  revalidatePath("/dashboard/questions");
  return { success: true };
}
