import { ArticleStatus } from "@prisma/client";
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
  await db.article.update({
    where: { id: articleId },
    data: { status: ArticleStatus.SCHEDULED, ogArticleModifiedTime: now, lastReviewed: now },
  });
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
