import { ArticleStatus, type Prisma } from "@prisma/client";

/**
 * Same contract as the client segments: every clickable number on the dashboard's
 * Articles section maps to a key here, and the key owns the exact `where` that
 * produced the count. One definition, used by both the card and the list — so the
 * number and the rows behind it can never disagree.
 */

// No "orphan" segment: Article.clientId is a required field, so an article without
// a client cannot exist. A card that can never fill is noise.
type ArticleSegmentKey =
  | "published"
  | "published-on-client-site"
  | "awaiting-approval"
  | "approved"
  | "scheduled"
  | "writing"
  | "draft"
  | "needs-revision"
  | "archived"
  | "ymyl-uncited"
  | "seo-imperfect"
  | "seo-perfect";

interface Segment {
  title: string;
  description: string;
  where: Prisma.ArticleWhereInput;
  // SEO score is COMPUTED (round((meta+jsonLd)/2)), not a Prisma column, so it can't
  // live in `where`. When set, the segment page keeps only rows on this side of 100
  // AFTER scoring — the exact split the dashboard count uses, so list === number.
  scoreFilter?: "perfect" | "imperfect";
}

const SEGMENTS: Record<ArticleSegmentKey, Segment> = {
  published: {
    title: "منشور على مدونتي",
    description: "ظاهر على modonty.com الآن.",
    where: { status: ArticleStatus.PUBLISHED },
  },
  // Live on the client's own site, never on modonty.com — counted in the SEO total, so the
  // dashboard shows it as its own stage (it was missing: «289 total» next to «313»).
  "published-on-client-site": {
    title: "منشور على موقع العميل",
    description: "ظاهر على موقع العميل نفسه، لا على modonty.com.",
    where: { status: ArticleStatus.PUBLISHED_ON_CLIENT_SITE },
  },
  "awaiting-approval": {
    title: "ينتظر موافقة العميل",
    description: "خلّصناه. الكرة عندهم — تابعهم.",
    where: { status: ArticleStatus.AWAITING_APPROVAL },
  },
  // The dashboard linked here before the key existed (30 Sep 2026) — the stage opened a 404.
  approved: {
    title: "معتمد بلا تاريخ",
    description: "العميل وافق. الفريق وحده يحدد تاريخ النشر.",
    where: { status: ArticleStatus.APPROVED },
  },
  scheduled: {
    title: "مجدول",
    description: "معتمد وفي الطابور — ينشر نفسه في تاريخه.",
    where: { status: ArticleStatus.SCHEDULED },
  },
  writing: {
    title: "يُكتب",
    description: "لسه على مكتبنا.",
    where: { status: ArticleStatus.WRITING },
  },
  draft: {
    title: "مسودات",
    description: "مكتوب، وما أُرسل للموافقة بعد.",
    where: { status: ArticleStatus.DRAFT },
  },
  "needs-revision": {
    title: "تحتاج تعديل",
    description: "العميل طلب تعديلات. اقرأ ملاحظاته وعدّل.",
    where: { status: ArticleStatus.NEEDS_REVISION },
  },
  archived: {
    title: "مؤرشف",
    description: "مسحوب من الموقع. يرجع 410 لجوجل.",
    where: { status: ArticleStatus.ARCHIVED },
  },
  // E-E-A-T risk: a YMYL article (any category — medical, legal, financial) with an
  // empty citations list. Google won't trust YMYL claims without authoritative sources.
  // Archived ones are off the site, so they don't count — live/upcoming liability only.
  "ymyl-uncited": {
    title: "مقالات YMYL بلا مصادر",
    description: "محتوى YMYL (طبي، قانوني، مالي) ما يثق فيه جوجل بلا مصادر. أضف مصادر موثوقة قبل ما يخسر ترتيبه.",
    where: {
      status: { not: ArticleStatus.ARCHIVED },
      citations: { isEmpty: true },
      client: { isYmyl: true },
    },
  },
  // SEO health of EVERY article, any status (Khalid 2026-07-23: an article is an article
  // — the only question is whether it has an SEO problem). A draft with no generated
  // metadata scores low and lands here ON PURPOSE — it's a real to-do to follow up.
  // No `where`: same all-status scope as the dashboard count, so list === number.
  "seo-imperfect": {
    title: "مقالات فيها نقص سيو",
    description: "أي مقال — مسودة أو منشور أو قيد التعديل — ما وصل 100 في مقياس السيو المشترك (ميتا + JSON-LD). افتح كل واحد تشوف الفحوص الناقصة.",
    where: {},
    scoreFilter: "imperfect",
  },
  "seo-perfect": {
    title: "مقالات سيوها كامل",
    description: "أي مقال يجتاز كل فحوص مقياس السيو المشترك — ما في شي يحتاج إصلاح.",
    where: {},
    scoreFilter: "perfect",
  },
};

export function getArticleSegment(key: string): Segment | null {
  return SEGMENTS[key as ArticleSegmentKey] ?? null;
}
