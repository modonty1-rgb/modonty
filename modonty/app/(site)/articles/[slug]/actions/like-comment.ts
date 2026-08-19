"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { notifyTelegram } from "@/lib/telegram/notify-telegram";
import {
  trackCommentLike,
} from "@/lib/analytics/events-registry";

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
      after(async () => {
        try {
          const c = await db.comment.findUnique({
            where: { id: commentId },
            select: {
              article: {
                select: {
                  id: true,
                  clientId: true,
                  title: true,
                  slug: true,
                  client: { select: { slug: true, name: true, industry: { select: { name: true } } } },
                  author: { select: { id: true, name: true } },
                  category: { select: { slug: true, name: true } },
                  tags: { select: { tag: { select: { name: true } } }, take: 1 },
                },
              },
            },
          });
          if (!c?.article) return;
          const art = c.article;
          if (art.clientId) {
            notifyTelegram(art.clientId, "commentLike", { title: art.title }).catch(() => {});
          }
          await trackCommentLike(
            {
              article_id: art.id,
              article_slug: art.slug,
              article_title: art.title.slice(0, 100),
              author_id: art.author?.id,
              author_name: art.author?.name ?? undefined,
              category_slug: art.category?.slug,
              category_name: art.category?.name,
              tag_primary: art.tags[0]?.tag?.name,
              client_id: art.clientId ?? undefined,
              client_slug: art.client?.slug,
              client_name: art.client?.name,
              client_industry: art.client?.industry?.name,
              comment_id: commentId,
            },
            { userId },
          );
        } catch {}
      });
    }

    return {
      success: true,
      data: { likes, dislikes, liked: !existingLike },
    };
  } catch (error) {
    return { success: false, error: "Failed to update like" };
  }
}
