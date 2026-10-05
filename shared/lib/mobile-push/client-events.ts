import type { NotificationGroupKey } from "./preference-groups";

/**
 * كل حدث يخصّ العميل ويجب أن يُسمَع في تطبيق الكونسول — من مدونتي ومن الأدمن.
 *
 * خالد ٥ أكتوبر ٢٠٢٦: «كل الإيفنت اللي بتحصل في مدونتي المفروض تسمع في الكونسل».
 * الكتالوج هنا وحده: النصّ والمجموعة ونوع الصفّ تُبنى من نوع الحدث، فلا يكتب كل مستدعٍ
 * عنوانه بنفسه وتفترق الصياغات.
 *
 * `type` يحمل بادئة يفهمها التطبيق (`tapTabOf` في `console-mobile/src/services/push-registration.ts`
 * و`targetOf` في نقطة التنبيهات): `article*` يفتح المقال · `faq*`/`comment*`/`*question*` الجمهور ·
 * `media*`/`reel*` الفيديوهات · `booking*` طلبات التواصل · وما عداها صندوق التنبيهات.
 */
export type ClientEvent =
  | { kind: "article_awaiting_approval"; articleId: string; articleTitle: string }
  | { kind: "article_published"; articleId: string; articleTitle: string }
  | { kind: "article_question"; articleId: string; articleTitle: string; faqId: string }
  | { kind: "article_comment"; articleId: string; articleTitle: string; commentId: string; isReply: boolean }
  | { kind: "article_like"; articleId: string; articleTitle: string }
  | { kind: "article_favorite"; articleId: string; articleTitle: string }
  | { kind: "article_share"; articleId: string; articleTitle: string }
  | { kind: "page_question"; faqId: string }
  | { kind: "review"; reviewId: string; rating: number }
  | { kind: "media_comment"; mediaId: string; commentId: string }
  | { kind: "media_reaction"; mediaId: string }
  | { kind: "follow" }
  | { kind: "favorite" }
  | { kind: "page_share" }
  | { kind: "subscriber" }
  | { kind: "booking"; bookingId: string; articleId: string | null }
  | { kind: "whatsapp_contact"; articleId: string | null };

export type ClientEventMessage = {
  /** يُكتب في `Notification.type` ويُرسل في `data.type`. */
  type: string;
  title: string;
  body: string;
  /** يُكتب في `Notification.relatedId` — المقال لأنواع `article*` لأنّ الصندوق يفتحه به. */
  relatedId: string | null;
  articleId: string | null;
  group: NotificationGroupKey;
};

/** عنوان المقال داخل نصّ قصير: علامتا تنصيص ولا يتجاوز سطراً في التنبيه. */
function quote(title: string): string {
  const clean = title.trim();
  return `«${clean.length > 60 ? `${clean.slice(0, 59)}…` : clean}»`;
}

export function describeClientEvent(event: ClientEvent): ClientEventMessage {
  switch (event.kind) {
    case "article_awaiting_approval":
      return { type: "article_awaiting_approval", title: "مقال جديد ينتظر قرارك", body: `${quote(event.articleTitle)} جاهز — راجعه واعتمده أو اطلب تعديلاً.`, relatedId: event.articleId, articleId: event.articleId, group: "actionable" };
    case "article_published":
      return { type: "article_published", title: "نُشر مقالك", body: `${quote(event.articleTitle)} صار منشوراً على مدونتي.`, relatedId: event.articleId, articleId: event.articleId, group: "activity" };
    case "article_question":
      return { type: "faq_question", title: "سؤال جديد من قارئ", body: `على مقال ${quote(event.articleTitle)} — ينتظر ردّك.`, relatedId: event.faqId, articleId: event.articleId, group: "actionable" };
    case "article_comment":
      return { type: "comment_new", title: event.isReply ? "ردّ جديد على تعليق" : "تعليق جديد من قارئ", body: `على مقال ${quote(event.articleTitle)}.`, relatedId: event.commentId, articleId: event.articleId, group: "actionable" };
    case "article_like":
      return { type: "article_like", title: "إعجاب جديد", body: `قارئ أعجبه مقال ${quote(event.articleTitle)}.`, relatedId: event.articleId, articleId: event.articleId, group: "activity" };
    case "article_favorite":
      return { type: "article_favorite", title: "حفظ قارئ مقالك", body: `${quote(event.articleTitle)} في محفوظات قارئ.`, relatedId: event.articleId, articleId: event.articleId, group: "activity" };
    case "article_share":
      return { type: "article_share", title: "مشاركة جديدة", body: `قارئ شارك مقال ${quote(event.articleTitle)}.`, relatedId: event.articleId, articleId: event.articleId, group: "activity" };
    case "page_question":
      return { type: "page_question", title: "سؤال جديد على صفحتك", body: "قارئ سأل على صفحتك في مدونتي — ينتظر ردّك.", relatedId: event.faqId, articleId: null, group: "actionable" };
    case "review":
      return { type: "review_new", title: "تقييم جديد", body: `قارئ قيّمك ${"★".repeat(Math.max(1, Math.min(5, Math.round(event.rating))))} على مدونتي.`, relatedId: event.reviewId, articleId: null, group: "actionable" };
    case "media_comment":
      return { type: "media_comment", title: "تعليق جديد على فيديو", body: "قارئ علّق على أحد مقاطعك.", relatedId: event.mediaId, articleId: null, group: "actionable" };
    case "media_reaction":
      return { type: "media_reaction", title: "تفاعل على فيديو", body: "قارئ تفاعل مع أحد مقاطعك.", relatedId: event.mediaId, articleId: null, group: "activity" };
    case "follow":
      return { type: "follow_new", title: "متابع جديد", body: "قارئ بدأ يتابعك على مدونتي.", relatedId: null, articleId: null, group: "activity" };
    case "favorite":
      return { type: "favorite_new", title: "أضافك قارئ للمفضّلة", body: "صفحتك صارت في مفضّلة قارئ على مدونتي.", relatedId: null, articleId: null, group: "activity" };
    case "page_share":
      return { type: "page_share", title: "مشاركة لصفحتك", body: "قارئ شارك صفحتك على مدونتي.", relatedId: null, articleId: null, group: "activity" };
    case "subscriber":
      return { type: "subscriber_new", title: "مشترك جديد", body: "قارئ اشترك في نشرتك على مدونتي.", relatedId: null, articleId: null, group: "activity" };
    case "booking":
      return { type: "booking_created", title: "طلب تواصل جديد", body: "لديك طلب تواصل جديد من مدونتي — تواصل معه بسرعة.", relatedId: event.bookingId, articleId: event.articleId, group: "actionable" };
    case "whatsapp_contact":
      return { type: "booking_whatsapp", title: "تواصل جديد عبر واتساب", body: "قارئ فتح واتساب للتواصل معك من مدونتي.", relatedId: event.articleId, articleId: event.articleId, group: "actionable" };
  }
}
