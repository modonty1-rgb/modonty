/**
 * Catalog of all 26 visitor-engagement events on modonty.com that a client
 * can opt into receiving on Telegram. Each event has:
 *  - key: stable id (used in DB JSON + as React key)
 *  - group: where it fires (article / clientPage / direct)
 *  - label: Arabic label shown in settings UI
 *  - emoji: shown at the start of the Telegram message
 */

export type TelegramEventKey =
  // ─── Article events (15)
  | "articleView"
  | "articleLike"
  | "articleDislike"
  | "articleFavorite"
  | "articleShare"
  | "articleCtaClick"
  | "articleLinkClick"
  | "commentNew"
  | "commentReply"
  | "commentLike"
  | "commentDislike"
  | "conversion"
  | "leadHigh"
  // ─── Client page events
  | "clientView"
  | "clientFollow"
  | "clientShare"
  | "clientFavorite"
  | "clientComment"
  | "clientSubscribe"
  // ─── Direct contact
  | "supportMessage"
  | "campaignInterest"
  | "askClientQuestion";

export type TelegramEventGroup = "article" | "clientPage" | "direct";

export interface TelegramEventDef {
  key: TelegramEventKey;
  group: TelegramEventGroup;
  label: string;
  emoji: string;
}

export const TELEGRAM_EVENTS: TelegramEventDef[] = [
  // Article (13)
  { key: "articleView", group: "article", label: "مشاهدة مقال", emoji: "👁" },
  { key: "articleLike", group: "article", label: "لايك على مقال", emoji: "👍" },
  { key: "articleDislike", group: "article", label: "ديسلايك على مقال", emoji: "👎" },
  { key: "articleFavorite", group: "article", label: "حفظ مقال في المفضلة", emoji: "⭐" },
  { key: "articleShare", group: "article", label: "مشاركة مقال", emoji: "↗" },
  { key: "articleCtaClick", group: "article", label: "ضغط على CTA داخل المقال", emoji: "🎯" },
  { key: "articleLinkClick", group: "article", label: "ضغط على رابط خارجي داخل المقال", emoji: "🔗" },
  { key: "commentNew", group: "article", label: "تعليق جديد", emoji: "💬" },
  { key: "commentReply", group: "article", label: "رد على تعليق", emoji: "↩" },
  { key: "commentLike", group: "article", label: "لايك على تعليق", emoji: "👍" },
  { key: "commentDislike", group: "article", label: "ديسلايك على تعليق", emoji: "👎" },
  { key: "conversion", group: "article", label: "تحويل (Conversion)", emoji: "🎉" },
  { key: "leadHigh", group: "article", label: "Lead باهتمام عالٍ", emoji: "🔥" },

  // Client Page (6)
  { key: "clientView", group: "clientPage", label: "زيارة صفحة الشركة", emoji: "👁" },
  { key: "clientFollow", group: "clientPage", label: "متابعة الشركة", emoji: "➕" },
  { key: "clientShare", group: "clientPage", label: "مشاركة صفحة الشركة", emoji: "↗" },
  { key: "clientFavorite", group: "clientPage", label: "حفظ صفحة الشركة", emoji: "⭐" },
  { key: "clientComment", group: "clientPage", label: "تعليق على صفحة الشركة", emoji: "💬" },
  { key: "clientSubscribe", group: "clientPage", label: "اشتراك مباشر بالشركة", emoji: "📧" },

  // Direct (3)
  { key: "supportMessage", group: "direct", label: "رسالة دعم جديدة", emoji: "📩" },
  { key: "campaignInterest", group: "direct", label: "تسجيل اهتمام بحملة", emoji: "📣" },
  { key: "askClientQuestion", group: "direct", label: "سؤال مباشر للشركة", emoji: "🙋" },
];

export const TELEGRAM_EVENT_GROUPS: Record<
  TelegramEventGroup,
  { label: string; description: string }
> = {
  article: {
    label: "أحداث المقال",
    description: "كل ما يحدث على مقالات شركتك في مدونتي.",
  },
  clientPage: {
    label: "أحداث صفحة الشركة",
    description: "كل ما يحدث على صفحة شركتك العامة.",
  },
  direct: {
    label: "تواصل مباشر",
    description: "رسائل وأسئلة موجّهة لك مباشرة.",
  },
};

export type TelegramEventPreferences = Partial<
  Record<TelegramEventKey, boolean>
>;

export function isTelegramEventEnabled(
  prefs: TelegramEventPreferences | null | undefined,
  key: TelegramEventKey
): boolean {
  if (!prefs) return false;
  return prefs[key] === true;
}
