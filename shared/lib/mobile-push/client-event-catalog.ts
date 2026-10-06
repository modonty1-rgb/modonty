import type { ClientEvent } from "./client-events";
import type { NotificationGroupKey } from "./preference-groups";

export type ClientEventKind = ClientEvent["kind"];

/**
 * عناوين الشاشة — ثلاثة. `group` في كل سطر هو مفتاح المجموعة القديم الذي يُرجع إليه إن لم يُحفظ
 * للحدث مفتاحه، و`section` هو العنوان الذي يقع تحته في «حسابي». افترقا لأن «الزيارات» عنوان جديد
 * بلا مفتاح مجموعة: لو صار مجموعة لظهر للتطبيق الأقدم مفتاحٌ ثالث لا يحفظ شيئاً.
 */
export const CLIENT_EVENT_SECTIONS = [
  { key: "actionable", label: "ما يحتاج إجراء" },
  { key: "activity", label: "تفاعل القرّاء" },
  { key: "views", label: "القراءات والزيارات" },
] as const;

export type ClientEventSectionKey = (typeof CLIENT_EVENT_SECTIONS)[number]["key"];

/**
 * كل الأحداث كما يراها العميل في «حسابي» — مفتاح لكل حدث (خالد ٦ أكتوبر ٢٠٢٦:
 * «العميل عنده الصلاحية الكاملة… جميع الأحداث اللي بنتابعها تكون قدامه يحدد يس أو نو»).
 *
 * الترتيب هنا هو ترتيب الشاشة، والمجموعة عنوانها فوق المفاتيح. وأيّ حدث جديد في `ClientEvent`
 * بلا سطر هنا يفشل في الترجمة (`satisfies` على كل الأنواع) — فلا يضاف حدث لا يقدر العميل إيقافه.
 */
export const CLIENT_EVENT_CATALOG = [
  { kind: "article_awaiting_approval", group: "actionable", section: "actionable", label: "مقال جديد ينتظر قرارك" },
  { kind: "article_question", group: "actionable", section: "actionable", label: "سؤال من قارئ على مقال" },
  { kind: "article_comment", group: "actionable", section: "actionable", label: "تعليق على مقال" },
  { kind: "page_question", group: "actionable", section: "actionable", label: "سؤال على صفحتك" },
  { kind: "review", group: "actionable", section: "actionable", label: "تقييم جديد" },
  { kind: "media_comment", group: "actionable", section: "actionable", label: "تعليق على فيديو" },
  { kind: "booking", group: "actionable", section: "actionable", label: "طلب تواصل (حجز)" },
  { kind: "whatsapp_contact", group: "actionable", section: "actionable", label: "تواصل عبر واتساب" },
  { kind: "article_published", group: "activity", section: "activity", label: "نُشر مقالك" },
  { kind: "article_like", group: "activity", section: "activity", label: "إعجاب بمقال" },
  { kind: "article_favorite", group: "activity", section: "activity", label: "حفظ قارئ لمقالك" },
  { kind: "article_share", group: "activity", section: "activity", label: "مشاركة مقال" },
  { kind: "media_reaction", group: "activity", section: "activity", label: "تفاعل على فيديو" },
  { kind: "follow", group: "activity", section: "activity", label: "متابع جديد" },
  { kind: "favorite", group: "activity", section: "activity", label: "إضافة صفحتك للمفضّلة" },
  { kind: "page_share", group: "activity", section: "activity", label: "مشاركة صفحتك" },
  { kind: "subscriber", group: "activity", section: "activity", label: "مشترك جديد" },
  { kind: "article_view", group: "activity", section: "views", label: "قارئ يقرأ مقالك" },
  { kind: "page_view", group: "activity", section: "views", label: "زائر على صفحتك" },
  { kind: "reel_view", group: "activity", section: "views", label: "مشاهدة فيديو" },
] as const satisfies readonly { kind: ClientEventKind; group: NotificationGroupKey; section: ClientEventSectionKey; label: string }[];

/** حارس الترجمة: كل نوع في `ClientEvent` له سطر في الكتالوج. */
type CatalogKinds = (typeof CLIENT_EVENT_CATALOG)[number]["kind"];
type MissingFromCatalog = Exclude<ClientEventKind, CatalogKinds>;
const _everyEventHasASwitch: MissingFromCatalog extends never ? true : MissingFromCatalog = true;
void _everyEventHasASwitch;

export function isClientEventKind(value: string): value is ClientEventKind {
  return CLIENT_EVENT_CATALOG.some((entry) => entry.kind === value);
}
