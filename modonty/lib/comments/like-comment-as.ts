import "server-only";

import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { db } from "@/lib/db";
import { notifyTelegram } from "@/lib/telegram/notify-telegram";
import { trackCommentLike } from "@/lib/analytics/events-registry";
import type { ReaderActor } from "@/lib/users/reader-actor";

/**
 * إعجاب/إلغاء إعجاب تعليق مقال (toggle) باسم قارئ معروف — جسم `likeComment` (الويب) كما هو بعد
 * فصل الهويّة: يزيل «لا يعجبني» عند الإعجاب، يعيد تحميل مسار المقال، Telegram + GA4 على الإعجاب
 * الجديد بعد الردّ. ليس Server Action عن قصد.
 */
export async function likeCommentAs(actor: Pick<ReaderActor, "id">, commentId: string, articleSlug: string) {
  try {
    const userId = actor.id;

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
            notifyTelegram(art.clientId, "commentLike", { title: art.title }).catch((e: unknown) =>
              console.error("[likeCommentAs] telegram", e),
            );
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
        } catch (e) {
          console.error("[likeCommentAs] after", e);
        }
      });
    }

    return {
      success: true,
      data: { likes, dislikes, liked: !existingLike },
    };
  } catch (error) {
    console.error("[likeCommentAs]", error);
    return { success: false, error: "Failed to update like" };
  }
}
