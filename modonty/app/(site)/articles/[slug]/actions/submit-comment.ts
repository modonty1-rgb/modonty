"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { CommentStatus } from "@prisma/client";
import { notifyTelegram } from "@/lib/telegram/notify-telegram";
import {
  trackCommentSubmit,
} from "@/lib/analytics/events-registry";

import { isPublicArticle } from "../helpers/is-public-article";

import { sanitizeComment, validateCommentContent } from "@/lib/comments/validate-comment";

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

    // An article that belongs to a client's own website is not ours to collect
    // interactions for — see assert-public-article.ts.
    if (!(await isPublicArticle(articleId))) {
      return { success: false, error: "Article not found" };
    }

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

    // Telegram + GA4 wrapped in after() so Vercel keeps the lambda alive past response.
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
          notifyTelegram(art.clientId, "commentNew", {
            title: art.title,
            body: `${comment.author?.name ?? "زائر"}: ${content}`,
            link: {
              label: "مراجعة من اللوحة",
              url: `https://console.modonty.com/dashboard/comments`,
            },
          }).catch(() => {});
        }
        await trackCommentSubmit(
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
            comment_id: comment.id,
            comment_target_type: "article",
          },
          { userId },
        );
      } catch {}
    });

    return {
      success: true,
      data: comment,
    };
  } catch (error) {
    return { success: false, error: "Failed to submit comment" };
  }
}
