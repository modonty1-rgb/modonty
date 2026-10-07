import "server-only";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { CommentStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { notifyTelegram } from "@/lib/telegram/notify-telegram";
import { trackCommentReply } from "@/lib/analytics/events-registry";
import { isPublicArticle } from "@/lib/articles/is-public-article";
import { sanitizeComment, validateCommentContent } from "@/lib/comments/validate-comment";
import type { ReaderActor } from "@/lib/users/reader-actor";
import { notifyClientEvent } from "@modonty/shared/lib/mobile-push";

/**
 * ردّ على تعليق مقال (PENDING حتى يعتمده الشريك) باسم قارئ معروف — جسم `submitReply` (الويب) كما
 * هو بعد فصل الهويّة. يناديه الأكشن ونقطة التطبيق. ليس Server Action عن قصد.
 */
export async function submitReplyAs(
  actor: Pick<ReaderActor, "id">,
  articleId: string,
  articleSlug: string,
  parentCommentId: string,
  content: string
) {
  try {
    const userId = actor.id;

    // An article that belongs to a client's own website is not ours to collect
    // interactions for — see assert-public-article.ts.
    if (!(await isPublicArticle(articleId))) {
      return { success: false, error: "Article not found" };
    }

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

    after(async () => {
      try {
        const art = await db.article.findUnique({
          where: { id: articleId },
          select: {
            clientId: true,
            title: true,
            slug: true,
            client: { select: { slug: true, name: true, industry: { select: { name: true } } } },
            author: { select: { id: true, name: true } },
            category: { select: { slug: true, name: true } },
            tags: { select: { tag: { select: { name: true } } }, take: 1 },
          },
        });
        if (!art) return;
        if (art.clientId) {
          await notifyClientEvent(art.clientId, { kind: "article_comment", articleId, articleTitle: art.title, commentId: reply.id, isReply: true });
          notifyTelegram(art.clientId, "commentReply", {
            title: art.title,
            body: `${reply.author?.name ?? "زائر"}: ${content}`,
          }).catch((e: unknown) => console.error("[submitReplyAs] telegram", e));
        }
        await trackCommentReply(
          {
            article_id: articleId,
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
            comment_id: reply.id,
          },
          { userId },
        );
      } catch (e) {
        console.error("[submitReplyAs] after", e);
      }
    });

    return {
      success: true,
      data: reply,
    };
  } catch (error) {
    console.error("[submitReplyAs]", error);
    return { success: false, error: "Failed to submit reply" };
  }
}
