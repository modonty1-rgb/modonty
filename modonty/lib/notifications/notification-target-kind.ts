/**
 * What a reader notification points at, read from its `type` — the one routing rule the inbox
 * page (`/users/notifications`) and the mobile API both follow. The console writes `comment_*`
 * when a partner approves an article comment, `reel_comment_*` for a reel comment, `faq_reply`
 * when a question is answered; anything else is a reply to a contact message.
 */
export type NotificationTargetKind = "article_comment" | "reel_comment" | "faq_reply" | "contact";

export function notificationTargetKind(type: string): NotificationTargetKind {
  if (type.startsWith("comment_")) return "article_comment";
  if (type.startsWith("reel_comment_")) return "reel_comment";
  if (type === "faq_reply") return "faq_reply";
  return "contact";
}
