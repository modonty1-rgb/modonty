"use server";

import { revalidatePath } from "next/cache";
import { ArticleStatus, ArticleFAQStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { askClientSchema, type AskClientFormData } from "./ask-client-schema";
import { notifyTelegram } from "@/lib/telegram/notify-telegram";
import { trackAskClientSubmit } from "@/lib/analytics/events-registry";

import { stripHtmlTags } from "@modonty/shared/lib/strip-html-tags";

/** A signed-in reader asks the article's client a question — lands PENDING in their console inbox. */
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
    select: {
      id: true,
      slug: true,
      title: true,
      clientId: true,
      client: { select: { slug: true, name: true } },
    },
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
      question: stripHtmlTags(parsed.data.question.trim()),
      answer: null,
      position,
      status: ArticleFAQStatus.PENDING,
      source: "user", // reader submission → routes to the console questions inbox (filters source user|chatbot)
      submittedByName,
      submittedByEmail,
    },
  });

  revalidatePath(`/articles/${article.slug}`);

  if (article.clientId) {
    notifyTelegram(article.clientId, "askClientQuestion", {
      title: article.title,
      body: `${submittedByName}: ${parsed.data.question.trim()}`,
      meta: { "البريد": submittedByEmail },
      link: {
        label: "الرد من اللوحة",
        url: "https://console.modonty.com/dashboard/questions",
      },
    }).catch(() => {});
  }

  void trackAskClientSubmit(
    {
      client_id: article.clientId ?? undefined,
      client_slug: article.client?.slug,
      client_name: article.client?.name,
      article_id: article.id,
      article_slug: article.slug,
      article_title: article.title.slice(0, 100),
    },
    { userId: session.user.id },
  );

  return { success: true };
}
