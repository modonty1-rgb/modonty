import "server-only";

import { revalidatePath } from "next/cache";
import { ArticleFAQStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { messages } from "@/lib/messages";
import { sendEmail } from "@/lib/email/resend-client";
import { faqReplyEmail } from "@/lib/email/templates/faq-reply";

export type PublishResult = { success: true } | { success: false; error: string };

/**
 * Publishing a partner's answer to a visitor's question — the ONE place it happens.
 *
 * There were two: `/dashboard/questions` sent the notification and the email, and
 * `/dashboard/faqs` only wrote the row. Same button to the partner, two different outcomes for
 * the person waiting — answer from the wrong screen and they were never told anyone replied.
 * Measured 2026-08-18; the second screen had a `mailto:` link and nothing else.
 *
 * Ownership is verified here rather than trusted from the caller, so neither screen can skip it.
 */
export async function publishFaqAnswer(
  faqId: string,
  clientId: string,
  answer: string
): Promise<PublishResult> {
  const trimmed = answer?.trim();
  if (!trimmed) return { success: false, error: messages.error.required };

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
  if (!faq) return { success: false, error: messages.error.notFound };

  try {
    await db.articleFAQ.update({
      where: { id: faqId },
      data: { answer: trimmed, status: ArticleFAQStatus.PUBLISHED },
    });

    // Both notices are best-effort: a person who asked deserves to hear back, but a mail
    // outage must not make the partner think their answer failed to save.
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
              body: faq.question.slice(0, 100),
              relatedId: faq.id,
              readAt: null,
            },
          });
        }
      } catch {
        // Notification failure must not block the reply.
      }

      const articleUrl = `https://modonty.com/articles/${faq.article.slug}`;
      sendEmail({
        to: faq.submittedByEmail,
        ...faqReplyEmail({
          userName: faq.submittedByName ?? faq.submittedByEmail,
          question: faq.question,
          answer: trimmed,
          articleTitle: faq.article.title,
          articleUrl,
        }),
      }).catch((err) => console.error("[publishFaqAnswer] reply email failed:", err));
    }

    revalidatePath(`/articles/${faq.article.slug}`);
    revalidatePath("/dashboard/questions");
    revalidatePath("/dashboard/faqs");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}
