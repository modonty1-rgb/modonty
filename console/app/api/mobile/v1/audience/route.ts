import type { NextRequest } from "next/server";
import { ArticleFAQStatus, CommentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { arabicCount, arabicMetaLine, arabicNumber, arabicRelativeTime } from "@/lib/mobile-api/arabic-format";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";

/**
 * S08 «الجمهور» — the two inboxes that are waiting on the client: reader questions and
 * article comments.
 *
 * Only PENDING rows are listed. The screen's own subtitle counts «رسائل تحتاج ردك», so a
 * list that also carried answered rows would contradict the number printed above it.
 *
 * Every visible string — names, counts, dates, the «على مقال:» line — is finished here.
 * The screen concatenates nothing.
 */

/** First letter for the avatar circle. Falls back to the email when a name is absent. */
/** عدّاد التبويب يختفي عند الصفر: «الأسئلة ٠» قُرئت «الأسئلة .» على الجوال (الصفر العربي نقطة). */
function tabCount(count: number): string {
  return count === 0 ? "" : arabicNumber(count);
}

function initialOf(name: string | null, email: string | null): string | null {
  const source = (name ?? email ?? "").trim();
  return source.length === 0 ? null : source.slice(0, 1).toUpperCase();
}

export async function GET(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const clientId = session.clientId;
  const now = new Date();
  const [questionRows, commentRows, reelCommentRows, reviewRows, pageQuestionRows] = await Promise.all([
    db.articleFAQ.findMany({
      where: { article: { clientId }, status: ArticleFAQStatus.PENDING, OR: [{ source: "chatbot" }, { source: "user" }] },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, question: true, source: true, submittedByName: true, submittedByEmail: true, createdAt: true, article: { select: { title: true } } },
    }),
    db.comment.findMany({
      where: { article: { clientId }, status: CommentStatus.PENDING },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, content: true, createdAt: true, author: { select: { name: true, email: true } }, article: { select: { title: true } } },
    }),
    // تعليقات الريلز تنتظر نفس القرار على الويب (`/dashboard/comments` يعرض النوعين) — والجرس
    // يصل عنها منذ ٥ أكتوبر، فلا بدّ أن تظهر هنا أيضاً وإلا رنّ الجوال على شيء لا يجده العميل.
    db.mediaComment.findMany({
      where: { media: { clientId, inReels: true }, status: CommentStatus.PENDING },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, content: true, createdAt: true, author: { select: { name: true, email: true } }, media: { select: { title: true } } },
    }),
    // تقييمات صفحة العميل المنتظرة — الجرس يصل عنها، والقرار نفسه في `comments/[id]` بنوع `review`.
    db.clientReview.findMany({
      where: { clientId, status: CommentStatus.PENDING },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, rating: true, comment: true, createdAt: true, reviewer: { select: { name: true, email: true } } },
    }),
    // أسئلة صفحة العميل — تُفتح وتُردّ بنفس شاشة سؤال المقال (المسارات تتعرّف على النوع).
    db.clientFAQ.findMany({
      where: { clientId, status: ArticleFAQStatus.PENDING, source: "user" },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, question: true, submittedByName: true, submittedByEmail: true, createdAt: true },
    }),
  ]);

  const pageQuestions = pageQuestionRows.map((row) => ({
    id: row.id,
    name: row.submittedByName,
    initial: initialOf(row.submittedByName, row.submittedByEmail),
    email: row.submittedByEmail,
    timeLabel: arabicRelativeTime(row.createdAt, now),
    metaLine: arabicMetaLine([row.submittedByEmail, arabicRelativeTime(row.createdAt, now)]),
    question: row.question,
    articleLine: "على صفحتك في مدونتي",
    createdAt: row.createdAt,
  }));
  const articleQuestions = questionRows.map((row) => ({
    id: row.id,
    name: row.submittedByName,
    initial: initialOf(row.submittedByName, row.submittedByEmail),
    email: row.submittedByEmail,
    timeLabel: arabicRelativeTime(row.createdAt, now),
    metaLine: arabicMetaLine([row.submittedByEmail, arabicRelativeTime(row.createdAt, now)]),
    question: row.question,
    articleLine: `على مقال: ${row.article.title}`,
    createdAt: row.createdAt,
  }));
  const questions = [...articleQuestions, ...pageQuestions]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map(({ createdAt: _createdAt, ...rest }) => rest);

  const comments = [
    ...commentRows.map((row) => ({ kind: "article" as const, createdAt: row.createdAt, row, line: `على مقال: ${row.article.title}` })),
    ...reelCommentRows.map((row) => ({ kind: "reel" as const, createdAt: row.createdAt, row, line: `على فيديو: ${row.media.title ?? "طلّة"}` })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map(({ kind, row, line }) => ({
      id: row.id,
      kind,
      name: row.author?.name ?? null,
      initial: initialOf(row.author?.name ?? null, row.author?.email ?? null),
      email: row.author?.email ?? null,
      metaLine: arabicMetaLine([row.author?.email ?? null, arabicRelativeTime(row.createdAt, now)]),
      content: row.content,
      articleLine: line,
    }));

  const reviews = reviewRows.map((row) => ({
    id: row.id,
    kind: "review" as const,
    name: row.reviewer?.name ?? null,
    initial: initialOf(row.reviewer?.name ?? null, row.reviewer?.email ?? null),
    email: row.reviewer?.email ?? null,
    metaLine: arabicMetaLine([row.reviewer?.email ?? null, arabicRelativeTime(row.createdAt, now)]),
    content: `${"★".repeat(Math.max(1, Math.min(5, row.rating)))}${"☆".repeat(5 - Math.max(1, Math.min(5, row.rating)))}  ${row.comment}`,
    articleLine: "تقييم على صفحتك في مدونتي",
  }));

  const waiting = questions.length + comments.length + reviews.length;
  return ok({
    questions,
    comments,
    reviews,
    review: {
      title: "الجمهور",
      subtitle: waiting === 0 ? "ما في رسائل تنتظر ردك" : arabicCount(waiting, "رسالة تحتاج ردك", "رسالتان تحتاجان ردك", "رسائل تحتاج ردك"),
      questionsTabLabel: "الأسئلة",
      questionsTabCount: tabCount(questions.length),
      commentsTabLabel: "التعليقات",
      commentsTabCount: tabCount(comments.length),
      reviewsTabLabel: "التقييمات",
      reviewsTabCount: tabCount(reviews.length),
      emptyReviewsTitle: "ما في تقييمات جديدة",
      emptyReviewsDescription: "التقييمات توصلك هنا لما يقيّمك قارئ على صفحتك في مدونتي.",
      replyLinkLabel: "الرد على السؤال",
      // «نبض»: شارة الحالة على بطاقة السؤال — القائمة لا تحمل إلا PENDING، فالكلمة صادقة على كل صفّ.
      questionBadgeLabel: "ينتظر ردك",
      openQuestionPrefix: "افتح سؤال",
      emptyQuestionsTitle: "ما في أسئلة تنتظر ردك",
      emptyQuestionsDescription: "الأسئلة توصلك هنا لما يسأل قارئ على أحد مقالاتك أو على صفحتك.",
      // قرار التعليق من التطبيق (٥ أكتوبر ٢٠٢٦) — نفس كلمتَي صفحة التعليقات على الويب.
      commentApproveLabel: "اعتماد",
      commentRejectLabel: "رفض",
      commentBadgeLabel: "ينتظر قرارك",
      emptyCommentsTitle: "ما في تعليقات جديدة",
      emptyCommentsDescription: "التعليقات توصلك هنا لما يعلّق قارئ على أحد مقالاتك أو فيديوهاتك.",
      retryLabel: "إعادة المحاولة",
      errorTitle: "ما قدرنا نحمّل الجمهور",
      offlineTitle: "ما في اتصال",
      offlineDescription: "تأكد من الإنترنت وجرّب مرة ثانية.",
    },
  });
}
