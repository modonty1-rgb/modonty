import "server-only";

import { revalidatePath } from "next/cache";
import { ArticleStatus, ArticleFAQStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { askClientSchema } from "@/components/client/ask-client-schema";
import { notifyTelegram } from "@/lib/telegram/notify-telegram";
import { trackAskClientSubmit } from "@/lib/analytics/events-registry";
import type { ReaderActor } from "@/lib/users/reader-actor";
import { stripHtmlTags } from "@modonty/shared/lib/strip-html-tags";
import { fireClientEvent } from "@modonty/shared/lib/mobile-push";

/** Every refusal the web shows, plus which one it is — the mobile API maps it to a status code. */
export type AskClientResult =
  | { success: true }
  | { success: false; reason: "invalid" | "not_found" | "missing_identity" | "too_many_pending"; error: string };

/**
 * A signed-in reader asks the article's client a question — lands PENDING in their console inbox.
 * The body of `submitAskClient` with the identity passed in. Not a Server Action on purpose.
 */
export async function submitAskClientAs(
  actor: ReaderActor,
  data: unknown,
  articleId: string
): Promise<AskClientResult> {
  const parsed = askClientSchema.safeParse(data);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg = first.name?.[0] ?? first.email?.[0] ?? first.question?.[0] ?? "البيانات غير صالحة";
    return { success: false, reason: "invalid", error: msg };
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
    return { success: false, reason: "not_found", error: "المقال غير متاح أو غير منشور" };
  }

  const lastFaq = await db.articleFAQ.findFirst({
    where: { articleId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const position = (lastFaq?.position ?? -1) + 1;

  const submittedByName = (actor.name ?? parsed.data.name).trim();
  const submittedByEmail = (actor.email ?? parsed.data.email).trim();
  if (!submittedByName || !submittedByEmail) {
    return { success: false, reason: "missing_identity", error: "حسابك يفتقد الاسم أو البريد. حدّث الملف الشخصي ثم جرّب مرة أخرى." };
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
    return { success: false, reason: "too_many_pending", error: "الحد الأقصى 5 أسئلة معلقة. انتظر الرد على أسئلتك الحالية." };
  }

  const faq = await db.articleFAQ.create({
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
    select: { id: true },
  });

  revalidatePath(`/articles/${article.slug}`);

  fireClientEvent(article.clientId, { kind: "article_question", articleId: article.id, articleTitle: article.title, faqId: faq.id });

  if (article.clientId) {
    notifyTelegram(article.clientId, "askClientQuestion", {
      title: article.title,
      body: `${submittedByName}: ${parsed.data.question.trim()}`,
      meta: { "البريد": submittedByEmail },
      link: {
        label: "الرد من اللوحة",
        url: "https://console.modonty.com/dashboard/questions",
      },
    }).catch((e: unknown) => console.error("[submitAskClientAs] telegram", e));
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
    { userId: actor.id },
  );

  return { success: true };
}
