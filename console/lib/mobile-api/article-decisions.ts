import { ArticleFAQStatus, ArticleStatus } from "@prisma/client";
import { db } from "@/lib/db";

const context = {
  client: { select: { name: true, editor: { select: { name: true, email: true } } } },
} as const;

export type ArticleDecisionResult =
  | { ok: true; articleId: string; articleTitle: string; clientName: string; editorName: string | null }
  | { ok: false; reason: "NOT_FOUND" | "FEEDBACK_REQUIRED" };

function editorName(editor: { name: string | null; email: string | null } | null) {
  return editor?.name?.trim() || editor?.email || null;
}

export async function approveAwaitingArticle(articleId: string, clientId: string): Promise<ArticleDecisionResult> {
  const article = await db.article.findFirst({
    where: { id: articleId, clientId, status: ArticleStatus.AWAITING_APPROVAL },
    include: context,
  });
  if (!article) return { ok: false, reason: "NOT_FOUND" };

  const now = new Date();
  await db.$transaction([
    db.article.update({
      where: { id: articleId },
      // APPROVED, not SCHEDULED (27 Sep 2026): the client's yes is not a date. The team
      // schedules it from the admin; the cron only publishes an article that has a date.
      data: { status: ArticleStatus.APPROVED, ogArticleModifiedTime: now, lastReviewed: now },
    }),
    // Approving the article approves the FAQs the Modonty team wrote for it (Khalid,
    // 15 Oct 2026) — one yes, not one per question. Reader/chatbot questions are left
    // out: they wait for the client's own answer. Old rows predate `source`, and a
    // missing field matches neither "manual" nor `null` on Mongo — hence `isSet: false`.
    db.articleFAQ.updateMany({
      where: {
        articleId,
        status: ArticleFAQStatus.PENDING,
        OR: [{ source: "manual" }, { source: null }, { source: { isSet: false } }],
        AND: [{ answer: { not: null } }, { answer: { not: "" } }],
      },
      data: { status: ArticleFAQStatus.PUBLISHED },
    }),
  ]);
  return { ok: true, articleId, articleTitle: article.title, clientName: article.client.name, editorName: editorName(article.client.editor) };
}

export async function requestAwaitingArticleChanges(articleId: string, clientId: string, feedback: string): Promise<ArticleDecisionResult> {
  const note = feedback.trim();
  if (!note) return { ok: false, reason: "FEEDBACK_REQUIRED" };
  const article = await db.article.findFirst({
    where: { id: articleId, clientId, status: ArticleStatus.AWAITING_APPROVAL },
    include: context,
  });
  if (!article) return { ok: false, reason: "NOT_FOUND" };

  await db.article.update({ where: { id: articleId }, data: { status: ArticleStatus.NEEDS_REVISION, revisionNotes: note } });
  return { ok: true, articleId, articleTitle: article.title, clientName: article.client.name, editorName: editorName(article.client.editor) };
}
