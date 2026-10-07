import { db } from "@/lib/db";
import { notificationTargetKind } from "./notification-target-kind";

/** The selected notification and whatever it points at — comment, FAQ reply or contact message — plus the client behind it. */
export async function getNotificationDetail(userId: string, selectedId: string | undefined) {
  let selectedNotification = null;
  let contactMessage = null;
  let faqReply: { question: string; answer: string | null; article: { title: string; slug: string } } | null = null;
  // Written by the console when the partner approves a comment (QA finding #11, 29 Sep 2026):
  // `comment_*` points at an article Comment, `reel_comment_*` at a reel's MediaComment.
  let commentNotice: { content: string; href: string; where: string } | null = null;

  if (selectedId) {
    selectedNotification = await db.notification.findFirst({
      where: { id: selectedId, userId },
    });
    if (selectedNotification?.relatedId) {
      // One routing rule for the inbox and the mobile API (helpers/notification-target-kind.ts).
      const targetKind = notificationTargetKind(selectedNotification.type);
      if (targetKind === "article_comment") {
        const c = await db.comment.findUnique({
          where: { id: selectedNotification.relatedId },
          select: { id: true, content: true, article: { select: { title: true, slug: true } } },
        });
        if (c) commentNotice = { content: c.content, href: `/articles/${c.article.slug}#comment-${c.id}`, where: c.article.title };
      } else if (targetKind === "reel_comment") {
        const c = await db.mediaComment.findUnique({
          where: { id: selectedNotification.relatedId },
          select: { content: true, media: { select: { title: true, reelSlug: true } } },
        });
        if (c?.media.reelSlug) commentNotice = { content: c.content, href: `/reels/${c.media.reelSlug}`, where: c.media.title ?? "الريل" };
      } else if (targetKind === "faq_reply") {
        faqReply = await db.articleFAQ.findFirst({
          where: { id: selectedNotification.relatedId },
          select: {
            question: true,
            answer: true,
            article: { select: { title: true, slug: true } },
          },
        });
      } else {
        contactMessage = await db.contactMessage.findFirst({
          where: { id: selectedNotification.relatedId, userId },
        });
      }
    }
  }

  let client = null;
  if (selectedNotification) {
    const clientId = selectedNotification.clientId ?? contactMessage?.clientId ?? null;
    if (clientId) {
      client = await db.client.findUnique({
        where: { id: clientId },
        select: { id: true, name: true, email: true, slug: true },
      });
    }
  }

  return { selectedNotification, contactMessage, faqReply, commentNotice, client };
}
