import type { NextRequest } from "next/server";
import { ArticleFAQStatus, ArticleStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";
import { arabicCount, arabicLongDate, arabicMetaLine, arabicNumber } from "@/lib/mobile-api/arabic-format";

const ALLOWED_STATUSES = new Set(Object.values(ArticleStatus));
const ARTICLE_SCOPE = ["published", "decision"] as const;
type ArticleScope = typeof ARTICLE_SCOPE[number];

export async function GET(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const requested = request.nextUrl.searchParams.get("status");
  const requestedScope = request.nextUrl.searchParams.get("scope") ?? "published";
  if (requested && !ALLOWED_STATUSES.has(requested as ArticleStatus)) return fail("VALIDATION_ERROR", "حالة المقال غير صالحة.");
  if (!ARTICLE_SCOPE.includes(requestedScope as ArticleScope)) return fail("VALIDATION_ERROR", "نوع قائمة المقالات غير صالح.");
  const scope = requestedScope as ArticleScope;
  const statusFilter = requested
    ? { status: requested as ArticleStatus }
    : scope === "decision"
      ? { status: ArticleStatus.AWAITING_APPROVAL }
      : { status: { in: [ArticleStatus.PUBLISHED, ArticleStatus.PUBLISHED_ON_CLIENT_SITE] } };
  const articles = await db.article.findMany({
    where: { clientId: session.clientId, ...statusFilter },
    select: { id: true, title: true, slug: true, excerpt: true, status: true, wordCount: true, scheduledAt: true, datePublished: true, updatedAt: true, createdAt: true, isClientSiteArticle: true, canonicalUrl: true, citations: true, client: { select: { articlesBaseUrl: true, isYmyl: true } }, featuredImage: { select: { url: true, bunnyUrl: true, altText: true } }, category: { select: { name: true } }, faqs: { where: { OR: [{ source: "manual" }, { source: null }, { source: { isSet: false } }] }, select: { id: true, status: true } } },
    orderBy: { updatedAt: "desc" }, take: 100,
  });
  const statusLabels: Record<string, string> = { AWAITING_APPROVAL: "بانتظار قرارك", PUBLISHED: "منشور", PUBLISHED_ON_CLIENT_SITE: "منشور على موقعك" };
  // يُعدّ في القاعدة لا من `articles`: تلك قُصَّت عند 100، فالعميل الذي ينتظره 120 مقالاً
  // كان يُقال له «100» — ويُطمأن إلى أنه أنهى العشرين الباقية وهي لم تظهر له أصلاً.
  const decisionCount =
    scope === "decision"
      ? await db.article.count({ where: { clientId: session.clientId, ...statusFilter } })
      : 0;
  const review = scope === "decision"
    ? {
      title: "مقالات بانتظار قرارك",
      subtitle: "راجِع المقال كاملاً، ثم اعتمده أو اطلب تعديله.",
      /**
       * `null` عند الصفر فيختفي الشريط.
       *
       * كان يُخرج «٠ مقالات تحتاج قرارك» داخل شريط بحدٍّ برتقاليّ — إنذارٌ عن لا شيء.
       * الشريط وُجد ليقول «عندك عمل»؛ فحين لا عمل، الصواب أن يصمت لا أن يعلن صفراً
       * بلون تحذير فوق رسالة تقول «كل المقالات اتُّخذ قرارها».
       *
       * وحالة الواحد مكتوبة هنا لا في `arabicCount` لأن هذا الموضع يمرّر **جملة** لا اسماً،
       * والعدد يتوسّطها («مقال واحد يحتاج قرارك») بينما الدالّة تُلحق «واحد» بالآخر.
       */
      countLabel: decisionCount === 0 ? null : decisionCount === 1 ? "مقال واحد يحتاج قرارك" : arabicCount(decisionCount, "مقال يحتاج قرارك", "مقالان يحتاجان قرارك", "مقالات تحتاج قرارك"),
      emptyTitle: "ما في مقال ينتظر قرارك",
      emptyDescription: "كل المقالات الجاهزة اتُّخذ قرارها.",
      errorTitle: "ما قدرنا نجيب المقالات",
      offlineTitle: "ما في اتصال",
      offlineDescription: "افحص الشبكة ثم أعد المحاولة.",
      retryLabel: "إعادة المحاولة",
      openLabelPrefix: "مراجعة واتخاذ قرار بشأن",
      reviewActionLabel: "مراجعة المقال",
    }
    : {
      /**
       * «على موقعك» كان **غير صحيح لأغلب العملاء**: من لا يملك `articlesBaseUrl` تُنشر مقالاته
       * على مدونتي لا على موقعه (مقيس: كيما زون `canPublishToOwnSite: false`). فالنصّ يقول
       * الآن ما هو صحيح للحالتين، والبطاقة نفسها تُظهر النطاق الفعلي لكل مقال.
       */
      title: "المقالات المنشورة",
      subtitle: "مقالاتك المنشورة — اضغط أيّها لتقرأه كما يراه الزائر.",
      emptyTitle: "ما نُشر لك مقال بعد",
      emptyDescription: "أول مقال تعتمده يظهر هنا بعد نشره.",
      errorTitle: "ما قدرنا نجيب المقالات",
      offlineTitle: "ما في اتصال",
      offlineDescription: "افحص الشبكة ثم أعد المحاولة.",
      retryLabel: "إعادة المحاولة",
      openLabelPrefix: "عرض",
      openSiteLabel: "اقرأه كما يراه الزائر",
      openSiteAccessibilityPrefix: "افتح المقال المنشور",
      openSiteError: "ما قدرنا نفتح الرابط. جرّب مرة ثانية.",
    };
  return ok({ articles: articles.map((article) => {
    const { client, citations, faqs, ...articleData } = article;
    const publishedDateLabel = article.datePublished ? arabicLongDate(article.datePublished) : null;
    const wordCountLabel = article.wordCount === null ? null : `${arabicNumber(article.wordCount)} كلمة`;
    const isPublishedArticle = article.status === ArticleStatus.PUBLISHED || article.status === ArticleStatus.PUBLISHED_ON_CLIENT_SITE;
    /**
     * رابط **المقال نفسه**، من `canonicalUrl` لا من `articlesBaseUrl`.
     *
     * كان يقرأ `client.articlesBaseUrl` — وهو عنوان **قاعدة** واحد للعميل كلّه، لا رابط مقال.
     * فينتج عنه أمران: كل البطاقات تفتح نفس الصفحة (لا فائدة لزائر ولا لسيو)، وهو `null`
     * لكل عميل ينشر على مدونتي لا على موقعه — وهم الأغلب — فتخرج البطاقة **جامدة بلا رابط**.
     * (مقيس على كيما زون: `articlesBaseUrl: null` والمقالات الثلاثة `siteUrl: null`.)
     *
     * و`canonicalUrl` محفوظ ومكتمل لكل مقال، ويُبنى أصلاً من `articlesBaseUrl` لمن ينشر على
     * موقعه ومن نطاق مدونتي لغيره — فهو المصدر الصحيح للحالتين معاً.
     */
    const siteUrl = scope === "published" && isPublishedArticle ? article.canonicalUrl : null;
    // النطاق الذي يُفتح فعلاً — يُعرض على البطاقة فيعرف العميل أين يذهب قبل أن يضغط.
    const siteHost = siteUrl === null ? null : (() => { try { return new URL(siteUrl).host.replace(/^www./, ""); } catch { return null; } })();
    const pendingFaqCount = faqs.filter((faq) => faq.status === ArticleFAQStatus.PENDING).length;
    const citationCount = client.isYmyl ? citations.length : null;
    const cardDateLabel = scope === "decision" ? arabicLongDate(article.updatedAt) : publishedDateLabel;
    return {
      ...articleData,
      contentFaqCount: faqs.length,
      pendingFaqCount,
      citationCount,
      categoryLabel: article.category?.name ?? null,
      metaLabel: arabicMetaLine([cardDateLabel, wordCountLabel]),
      questionsLabel: pendingFaqCount > 0 ? arabicCount(pendingFaqCount, "سؤال", "سؤالان", "أسئلة") : null,
      citationsLabel: citationCount !== null && citationCount > 0 ? arabicCount(citationCount, "استشهاد", "استشهادان", "استشهادات") : null,
      metadataLabel: arabicMetaLine([article.category?.name ?? null, publishedDateLabel, wordCountLabel]),
      publishedDateLabel,
      siteUrl,
      siteHost,
      statusLabel: statusLabels[article.status] ?? article.status,
      wordCountLabel,
    };
  }), review });
}
