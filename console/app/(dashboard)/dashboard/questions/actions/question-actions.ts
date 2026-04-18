"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { ArticleFAQStatus } from "@prisma/client";
import { messages } from "@/lib/messages";
import { sendEmail } from "@/lib/email/resend-client";
import { faqReplyEmail } from "@/lib/email/templates/faq-reply";

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
      submittedByName: true,
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
            relatedId: faq.id,
          },
        });
      }
    } catch {
      // Notification failure must not block the reply
    }
  }

  // Email notification to the question author (non-blocking)
  if (faq.submittedByEmail) {
    const articleUrl = `https://modonty.com/articles/${faq.article.slug}`;
    const emailPayload = faqReplyEmail({
      userName: faq.submittedByName ?? faq.submittedByEmail,
      question: faq.question,
      answer: trimmed,
      articleTitle: faq.article.title,
      articleUrl,
    });
    sendEmail({ to: faq.submittedByEmail, ...emailPayload }).catch((err) =>
      console.error("[replyToQuestion] FAQ reply email failed:", err)
    );
  }

  revalidatePath(`/articles/${faq.article.slug}`);
  revalidatePath("/dashboard/questions");
  return { success: true };
}
