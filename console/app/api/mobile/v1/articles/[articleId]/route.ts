import type { NextRequest } from "next/server";
import { ArticleFAQStatus, ArticleStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";
import { arabicCount, arabicMetaLine, arabicNumber } from "@/lib/mobile-api/arabic-format";

const statusLabels: Record<string, string> = { AWAITING_APPROVAL: "بانتظار قرارك", NEEDS_REVISION: "طلبت تعديله", SCHEDULED: "مجدول للنشر", PUBLISHED: "منشور", PUBLISHED_ON_CLIENT_SITE: "منشور على موقعك" };

export async function GET(request: NextRequest, { params }: { params: Promise<{ articleId: string }> }) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const { articleId } = await params;
  const article = await db.article.findFirst({
    where: { id: articleId, clientId: session.clientId },
    select: { id: true, title: true, excerpt: true, content: true, status: true, wordCount: true, citations: true, client: { select: { isYmyl: true } }, featuredImage: { select: { url: true, bunnyUrl: true, altText: true } }, faqs: { where: { OR: [{ source: "manual" }, { source: null }, { source: { isSet: false } }] }, select: { id: true, question: true, answer: true, status: true, source: true, position: true }, orderBy: { position: "asc" } } },
  });
  if (!article) return fail("NOT_FOUND", "المقال غير موجود.");

  const isAwaiting = article.status === ArticleStatus.AWAITING_APPROVAL;
  const citations = article.client.isYmyl ? article.citations : [];
  const pendingFaqs = article.faqs.filter((faq) => faq.status === ArticleFAQStatus.PENDING).length;
  const wordCountLabel = article.wordCount === null ? null : `${arabicNumber(article.wordCount)} كلمة`;
  const draftLabel = isAwaiting ? "مسودة للمراجعة" : null;
  const statusLabel = statusLabels[article.status] ?? article.status;

  return ok({ article: {
    id: article.id,
    title: article.title,
    status: article.status,
    content: article.content,
    featuredImage: article.featuredImage,
    faqs: article.faqs,
    citations,
    review: {
      title: "مراجعة المقال",
      backLabel: "رجوع",
      errorTitle: "ما قدرنا نفتح المقال",
      offlineTitle: "ما في اتصال",
      offlineDescription: "افحص الشبكة ثم أعد المحاولة.",
      retryLabel: "إعادة المحاولة",
      /**
       * `badgeTone` يرمز **للحالة** لا للنوع — والفرق ليس تجميلياً.
       *
       * كانت الشاشة تثبّت اللون بحسب البار: المقال برتقاليّ دائماً والأسئلة تركوازية دائماً.
       * فظهر بارَان كلاهما «ينتظر قرارك» بلونين مختلفين — أي أنّ اللون لا يقول شيئاً، بل
       * يوهم بفرقٍ ليس موجوداً. الآن: برتقاليّ = يحتاج قرارك · تركوازيّ = خلصت · رماديّ = عدد
       * للعلم فقط. فيمسح العميل الشاشة بلمحة ويعرف أين بقي عمله.
       */
      article: {
        title: "المقال",
        badgeTone: isAwaiting ? "pending" : "done",
        badgeLabel: isAwaiting ? "بانتظارك" : statusLabel,
        heroBadgeLabel: isAwaiting ? "بانتظار قرارك" : statusLabel,
        description: article.excerpt ? `نبذة: ${article.excerpt}` : null,
        metaLabel: arabicMetaLine([wordCountLabel, draftLabel]),
        headLabel: arabicMetaLine([draftLabel, wordCountLabel]),
        // كان «مراجعة المقال» — وهو **نفس عنوان الشاشة** حرفياً، فلا يعرف العميل أين هو
        // من أين سيذهب. والفعل يقول الآن ما يحدث فعلاً: تقرأ، وفي آخر النصّ تقرّر.
        actionLabel: "اقرأ المقال وقرّر",
        emptyContentLabel: "ما في نصّ للمقال بعد.",
      },
      /**
       * نصوص الأسئلة — أُعيدت صياغتها كاملةً (٢٩ أغسطس)، ثلاثة أعطال لا واحد:
       *
       * 1. **الإملاء:** كانت «مدونتي» بالتشكيل. التشكيل **للصوت وحده** — أُقرّ بعد اختبار
       *    نطق على ست صيغ — والواجهة تكتب «مدونتي» مجرّدة. والكود كان يناقض نفسه: الرئيسية
       *    والإحالة تكتبانها صحيحة، وهذه الشاشة وحدها تحمل إملاء الصوت.
       * 2. **«مرتبطة بـSEO المقال»:** لاتينيّ داخل جملة عربية يكسر العين، والأهمّ أنّ العميل
       *    لا يشتري «SEO» بل يشتري أن يجده الناس. فصارت تقول الأثر لا الآلة.
       * 3. **المبني للمجهول:** «اتُّخذ قرار كل الأسئلة» · «لم يُعتمد أي سؤال بعد» — لغة تقارير
       *    لا لغة بشر. الفاعل هو العميل نفسه، فليُخاطَب: «قرّرت» · «ما قرّرت».
       *
       * والوصف العامّ حُذف من البار: يتكرّر مع كل مقال فيصير ضجيجاً، ومكانه الطبيعي رأس
       * صفحة الأسئلة حيث يُقرأ مرّة واحدة عند لحظة القرار.
       */
      faqs: article.faqs.length > 0 ? {
        title: "أسئلة تظهر مع المقال",
        badgeTone: pendingFaqs > 0 ? "pending" : "done",
        badgeLabel: pendingFaqs > 0 ? arabicCount(pendingFaqs, "متبقٍ", "متبقيان", "متبقية") : "اكتملت",
        description: null,
        statusLabel: pendingFaqs === 0 ? "قرّرت في كل الأسئلة." : pendingFaqs === article.faqs.length ? "ما قرّرت في أي سؤال بعد." : "باقي أسئلة تنتظر قرارك.",
        actionLabel: "راجع الأسئلة",
        // كتبتُ هنا «أسئلة يسألها قرّاؤك» — وهي **ليست** أسئلة قرّاء. مصدرها `source: "manual"`
        // أي فريق مدونتي، وأسئلة الشات بوت مستبعَدة أصلاً من الاستعلام. تغيير الصياغة لا يجوز
        // أن يغيّر الواقع؛ النصّ يقول الآن من كتبها ولماذا وأين تذهب، بلا ادّعاء.
        contextLabel: "أسئلة كتبها فريق مدونتي مع إجاباتها ليجدها الباحث. اللي تقبله يظهر أسفل المقال.",
        sourceLabel: "سؤال من فريق مدونتي",
        seoLabel: "يساعد المقال يظهر في البحث",
        approveLabel: "قبول السؤال",
        approvingLabel: "نقبل السؤال…",
        rejectLabel: "رفض السؤال",
        rejectingLabel: "نرفض السؤال…",
        rejectConfirmationTitle: "تأكيد رفض السؤال",
        rejectConfirmationDescription: "السؤال بيختفي من المقال المنشور وما بيشوفه القارئ.",
        cancelLabel: "إلغاء",
        approvedLabel: "مقبول",
        rejectedLabel: "مرفوض",
      } : null,
      citations: citations.length > 0 ? {
        title: "استشهادات المقال",
        badgeTone: "neutral",
        badgeLabel: arabicCount(citations.length, "استشهاد", "استشهادان", "استشهادات"),
        description: "مصادر خارجية يستند إليها المقال.",
        actionLabel: "راجع الاستشهادات",
        contextLabel: `مرتبطة بالمقال: ${article.title}`,
        sourceLabel: "استشهاد من المقال",
      } : null,
      changes: {
        title: "طلب تعديل المقال",
        description: "اكتب الملاحظة لفريق المحتوى.",
        inputLabel: "ملاحظتك",
        submitLabel: "إرسال طلب التعديل",
        submittingLabel: "نرسل طلبك…",
        cancelLabel: "إلغاء",
      },
      approve: {
        label: "اعتماد المقال",
        loadingLabel: "نعتمد المقال…",
        confirmationTitle: "تأكيد اعتماد المقال",
        confirmationDescription: "بعد الاعتماد يحدّد فريق مدونتي موعد النشر، وما تقدر ترجع.",
        cancelLabel: "إلغاء",
      },
      ymyl: article.client.isYmyl ? { title: "تنبيه لمحتوى YMYL", description: "قبل الاعتماد، راجع دقة المعلومات وملاءمتها لعملك." } : null,
    },
  } });
}
