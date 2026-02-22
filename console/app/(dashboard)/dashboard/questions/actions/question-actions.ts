"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { ArticleFAQStatus } from "@prisma/client";

export async function replyToQuestion(
  faqId: string,
  clientId: string,
  answer: string
): Promise<{ success: boolean; error?: string }> {
  const trimmed = answer?.trim();
  if (!trimmed) {
    return { success: false, error: "أدخل نص الرد" };
  }

  const faq = await db.articleFAQ.findFirst({
    where: { id: faqId, article: { clientId } },
    select: { id: true, article: { select: { slug: true } } },
  });
  if (!faq) {
    return { success: false, error: "السؤال غير موجود أو لا يخصك" };
  }

  await db.articleFAQ.update({
    where: { id: faqId },
    data: {
      answer: trimmed,
      status: ArticleFAQStatus.PUBLISHED,
    },
  });

  revalidatePath(`/articles/${faq.article.slug}`);
  revalidatePath("/dashboard/questions");
  return { success: true };
}
