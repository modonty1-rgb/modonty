"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ArticleStatus, ArticleFAQStatus } from "@prisma/client";
import { askClientSchema, type AskClientFormData } from "../helpers/schemas/ask-client-schema";

export async function submitAskClient(
  data: AskClientFormData,
  articleId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "يجب تسجيل الدخول لطرح سؤال" };
  }

  const parsed = askClientSchema.safeParse(data);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg = first.name?.[0] ?? first.email?.[0] ?? first.question?.[0] ?? "البيانات غير صالحة";
    return { success: false, error: msg };
  }

  const article = await db.article.findFirst({
    where: { id: articleId, status: ArticleStatus.PUBLISHED },
    select: { id: true, slug: true },
  });
  if (!article) {
    return { success: false, error: "المقال غير متاح أو غير منشور" };
  }

  const lastFaq = await db.articleFAQ.findFirst({
    where: { articleId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const position = (lastFaq?.position ?? -1) + 1;

  const submittedByName = (session.user.name ?? parsed.data.name).trim();
  const submittedByEmail = (session.user.email ?? parsed.data.email).trim();
  if (!submittedByName || !submittedByEmail) {
    return { success: false, error: "حسابك يفتقد الاسم أو البريد. حدّث الملف الشخصي ثم جرّب مرة أخرى." };
  }

  const pendingCount = await db.articleFAQ.count({
    where: {
      articleId,
      submittedByEmail,
      status: ArticleFAQStatus.PENDING,
      answer: null,
    },
  });
  if (pendingCount >= 5) {
    return { success: false, error: "الحد الأقصى 5 أسئلة معلقة. انتظر الرد على أسئلتك الحالية." };
  }

  await db.articleFAQ.create({
    data: {
      articleId,
      question: parsed.data.question.trim(),
      answer: null,
      position,
      status: ArticleFAQStatus.PENDING,
      submittedByName,
      submittedByEmail,
    },
  });

  revalidatePath(`/articles/${article.slug}`);

  return { success: true };
}

export async function getPendingFaqsForCurrentUser(
  articleId: string
): Promise<Array<{ id: string; question: string; createdAt: Date }>> {
  const session = await auth();
  if (!session?.user?.email) return [];

  const list = await db.articleFAQ.findMany({
    where: {
      articleId,
      submittedByEmail: session.user.email,
      status: ArticleFAQStatus.PENDING,
      answer: null,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, question: true, createdAt: true },
  });
  return list;
}

/** For lazy-load: fetch pending FAQs for the current user on this article. */
export async function fetchPendingFaqsForArticle(articleId: string) {
  return getPendingFaqsForCurrentUser(articleId);
}
