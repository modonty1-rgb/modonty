import { db } from "../db";
import { notificationTargetKind } from "./notification-target-kind";

export type NotificationTarget =
  | { kind: "article"; slug: string; title: string; href: string }
  | { kind: "reel"; slug: string; title: string | null; href: string }
  | { kind: "contact"; messageId: string }
  | null;

/**
 * Where each notification opens — the inbox page's routing rule (`notificationTargetKind`) with
 * the same hrefs it builds (`/articles/<slug>#comment-<id>`, `/reels/<slug>`), resolved for a
 * whole list in one query per kind instead of one per row.
 */
export async function resolveNotificationTargets(
  rows: { id: string; type: string; relatedId: string | null }[],
): Promise<Map<string, NotificationTarget>> {
  const ids = { article_comment: [] as string[], reel_comment: [] as string[], faq_reply: [] as string[] };
  for (const n of rows) {
    if (!n.relatedId) continue;
    const kind = notificationTargetKind(n.type);
    if (kind !== "contact") ids[kind].push(n.relatedId);
  }

  const [comments, reelComments, faqs] = await Promise.all([
    ids.article_comment.length
      ? db.comment.findMany({
          where: { id: { in: ids.article_comment } },
          select: { id: true, article: { select: { title: true, slug: true } } },
        })
      : [],
    ids.reel_comment.length
      ? db.mediaComment.findMany({
          where: { id: { in: ids.reel_comment } },
          select: { id: true, media: { select: { title: true, reelSlug: true } } },
        })
      : [],
    ids.faq_reply.length
      ? db.articleFAQ.findMany({
          where: { id: { in: ids.faq_reply } },
          select: { id: true, article: { select: { title: true, slug: true } } },
        })
      : [],
  ]);
  const commentById = new Map(comments.map((c) => [c.id, c]));
  const reelCommentById = new Map(reelComments.map((c) => [c.id, c]));
  const faqById = new Map(faqs.map((f) => [f.id, f]));

  const targets = new Map<string, NotificationTarget>();
  for (const n of rows) {
    if (!n.relatedId) {
      targets.set(n.id, null);
      continue;
    }
    switch (notificationTargetKind(n.type)) {
      case "article_comment": {
        const c = commentById.get(n.relatedId);
        targets.set(n.id, c ? { kind: "article", slug: c.article.slug, title: c.article.title, href: `/articles/${c.article.slug}#comment-${c.id}` } : null);
        break;
      }
      case "reel_comment": {
        const c = reelCommentById.get(n.relatedId);
        targets.set(n.id, c?.media.reelSlug ? { kind: "reel", slug: c.media.reelSlug, title: c.media.title, href: `/reels/${c.media.reelSlug}` } : null);
        break;
      }
      case "faq_reply": {
        const f = faqById.get(n.relatedId);
        targets.set(n.id, f ? { kind: "article", slug: f.article.slug, title: f.article.title, href: `/articles/${f.article.slug}` } : null);
        break;
      }
      case "contact":
        targets.set(n.id, { kind: "contact", messageId: n.relatedId });
        break;
    }
  }
  return targets;
}
