"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { CommentStatus } from "@prisma/client";
import { notifyTelegram } from "@/lib/telegram/notify";

function sanitizeComment(content: string): string {
  const trimmed = content.trim();
  return trimmed
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

function validateCommentContent(content: string): { valid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: "Comment content is required" };
  }
  if (content.length > 1000) {
    return { valid: false, error: "Comment is too long (max 1000 characters)" };
  }
  return { valid: true };
}

export async function submitComment(
  articleId: string,
  articleSlug: string,
  content: string
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    const validation = validateCommentContent(content);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const sanitizedContent = sanitizeComment(content);

    const comment = await db.comment.create({
      data: {
        content: sanitizedContent,
        articleId,
        authorId: userId,
        status: CommentStatus.PENDING,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            dislikes: true,
          },
        },
      },
    });

    revalidatePath(`/articles/${articleSlug}`);

    // Telegram notification (non-blocking)
    db.article
      .findUnique({
        where: { id: articleId },
        select: { clientId: true, title: true },
      })
      .then((art) => {
        if (art?.clientId) {
          notifyTelegram(art.clientId, "commentNew", {
            title: art.title,
            body: `${comment.author?.name ?? "زائر"}: ${content}`,
            link: {
              label: "مراجعة من اللوحة",
              url: `https://console.modonty.com/dashboard/comments`,
            },
          });
        }
      })
      .catch(() => {});

    return {
      success: true,
      data: comment,
    };
  } catch (error) {
    return { success: false, error: "Failed to submit comment" };
  }
}

export async function submitReply(
  articleId: string,
  articleSlug: string,
  parentCommentId: string,
  content: string
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    const validation = validateCommentContent(content);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const parentComment = await db.comment.findUnique({
      where: { id: parentCommentId },
      select: { id: true, articleId: true },
    });

    if (!parentComment || parentComment.articleId !== articleId) {
      return { success: false, error: "Parent comment not found" };
    }

    const sanitizedContent = sanitizeComment(content);

    const reply = await db.comment.create({
      data: {
        content: sanitizedContent,
        articleId,
        authorId: userId,
        parentId: parentCommentId,
        status: CommentStatus.PENDING,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            dislikes: true,
          },
        },
      },
    });

    revalidatePath(`/articles/${articleSlug}`);

    db.article
      .findUnique({
        where: { id: articleId },
        select: { clientId: true, title: true },
      })
      .then((art) => {
        if (art?.clientId) {
          notifyTelegram(art.clientId, "commentReply", {
            title: art.title,
            body: `${reply.author?.name ?? "زائر"}: ${content}`,
          });
        }
      })
      .catch(() => {});

    return {
      success: true,
      data: reply,
    };
  } catch (error) {
    return { success: false, error: "Failed to submit reply" };
  }
}

export async function likeComment(commentId: string, articleSlug: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    const existingLike = await db.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId,
        },
      },
    });

    if (existingLike) {
      await db.commentLike.delete({
        where: {
          commentId_userId: {
            commentId,
            userId,
          },
        },
      });
    } else {
      await db.commentLike.create({
        data: {
          commentId,
          userId,
        },
      });

      await db.commentDislike.deleteMany({
        where: {
          commentId,
          userId,
        },
      });
    }

    const [likes, dislikes] = await Promise.all([
      db.commentLike.count({ where: { commentId } }),
      db.commentDislike.count({ where: { commentId } }),
    ]);

    revalidatePath(`/articles/${articleSlug}`);

    if (!existingLike) {
      db.comment
        .findUnique({
          where: { id: commentId },
          select: { article: { select: { clientId: true, title: true } } },
        })
        .then((c) => {
          if (c?.article?.clientId) {
            notifyTelegram(c.article.clientId, "commentLike", {
              title: c.article.title,
            });
          }
        })
        .catch(() => {});
    }

    return {
      success: true,
      data: { likes, dislikes, liked: !existingLike },
    };
  } catch (error) {
    return { success: false, error: "Failed to update like" };
  }
}

export async function dislikeComment(commentId: string, articleSlug: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    const existingDislike = await db.commentDislike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId,
        },
      },
    });

    if (existingDislike) {
      await db.commentDislike.delete({
        where: {
          commentId_userId: {
            commentId,
            userId,
          },
        },
      });
    } else {
      await db.commentDislike.create({
        data: {
          commentId,
          userId,
        },
      });

      await db.commentLike.deleteMany({
        where: {
          commentId,
          userId,
        },
      });
    }

    const [likes, dislikes] = await Promise.all([
      db.commentLike.count({ where: { commentId } }),
      db.commentDislike.count({ where: { commentId } }),
    ]);

    revalidatePath(`/articles/${articleSlug}`);

    if (!existingDislike) {
      db.comment
        .findUnique({
          where: { id: commentId },
          select: { article: { select: { clientId: true, title: true } } },
        })
        .then((c) => {
          if (c?.article?.clientId) {
            notifyTelegram(c.article.clientId, "commentDislike", {
              title: c.article.title,
            });
          }
        })
        .catch(() => {});
    }

    return {
      success: true,
      data: { likes, dislikes, disliked: !existingDislike },
    };
  } catch (error) {
    return { success: false, error: "Failed to update dislike" };
  }
}

export async function approveComment(commentId: string, articleSlug: string) {
  try {
    if (process.env.NODE_ENV !== "development") {
      return { success: false, error: "Only available in development" };
    }

    await db.comment.update({
      where: { id: commentId },
      data: { status: CommentStatus.APPROVED },
    });

    revalidatePath(`/articles/${articleSlug}`);

    return { success: true };
  } catch (error) {
    console.error("Error approving comment:", error);
    return { success: false, error: "Failed to approve comment" };
  }
}

export async function approveAllCommentsForArticle(articleId: string, articleSlug: string) {
  try {
    if (process.env.NODE_ENV !== "development") {
      return { success: false, error: "Only available in development" };
    }

    const result = await db.comment.updateMany({
      where: { articleId },
      data: { status: CommentStatus.APPROVED },
    });

    revalidatePath(`/articles/${articleSlug}`);

    return { success: true, count: result.count };
  } catch (error) {
    return { success: false, error: "Failed to approve all comments" };
  }
}
