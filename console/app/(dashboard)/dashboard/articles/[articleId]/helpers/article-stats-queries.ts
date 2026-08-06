import { db } from "@/lib/db";
import type { CommentWithDetails } from "../../../comments/helpers/comment-queries";
import type { VisitorQuestionWithDetails } from "../../../questions/helpers/question-queries";

export interface ArticleStats {
  viewsCount: number;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  questionsCount: number;
}

export async function getArticleStats(
  articleId: string,
  clientId: string
): Promise<ArticleStats | null> {
  // Verify article belongs to this client
  const article = await db.article.findFirst({
    where: { id: articleId, clientId },
    select: { id: true },
  });
  if (!article) return null;

  const [viewsCount, likesCount, dislikesCount, commentsCount, questionsCount] =
    await Promise.all([
      db.articleView.count({ where: { articleId } }),
      db.articleLike.count({ where: { articleId } }),
      db.articleDislike.count({ where: { articleId } }),
      db.comment.count({ where: { articleId } }),
      db.articleFAQ.count({ where: { articleId } }),
    ]);

  return { viewsCount, likesCount, dislikesCount, commentsCount, questionsCount };
}

export async function getArticleComments(
  articleId: string,
  clientId: string
): Promise<CommentWithDetails[]> {
  const comments = await db.comment.findMany({
    where: { articleId, article: { clientId } },
    include: {
      author: { select: { id: true, name: true, email: true } },
      article: { select: { id: true, title: true, slug: true } },
      parent: { select: { id: true, content: true } },
      _count: { select: { replies: true, likes: true, dislikes: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // One article's comments — always article-kind, mapped into the shared shape the
  // moderation table speaks now that it also carries reel comments.
  return comments.map((co) => ({
    id: co.id,
    kind: "article" as const,
    content: co.content,
    status: co.status,
    isEdited: co.isEdited,
    createdAt: co.createdAt,
    updatedAt: co.updatedAt,
    editedAt: co.editedAt,
    author: co.author,
    source: {
      id: co.article.id,
      title: co.article.title,
      href: `/dashboard/articles/${co.article.id}`,
    },
    parent: co.parent,
    _count: co._count,
  }));
}

export async function getArticleQuestions(
  articleId: string,
  clientId: string
): Promise<VisitorQuestionWithDetails[]> {
  const list = await db.articleFAQ.findMany({
    where: { articleId, article: { clientId } },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      question: true,
      answer: true,
      status: true,
      source: true,
      submittedByName: true,
      submittedByEmail: true,
      createdAt: true,
      updatedAt: true,
      article: { select: { id: true, title: true, slug: true } },
    },
  });
  return list as VisitorQuestionWithDetails[];
}
