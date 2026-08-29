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
function initialOf(name: string | null, email: string | null): string | null {
  const source = (name ?? email ?? "").trim();
  return source.length === 0 ? null : source.slice(0, 1).toUpperCase();
}

export async function GET(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const clientId = session.clientId;
  const now = new Date();
  const [questionRows, commentRows] = await Promise.all([
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
  ]);

  const questions = questionRows.map((row) => ({
    id: row.id,
    name: row.submittedByName,
    initial: initialOf(row.submittedByName, row.submittedByEmail),
    email: row.submittedByEmail,
    timeLabel: arabicRelativeTime(row.createdAt, now),
    metaLine: arabicMetaLine([row.submittedByEmail, arabicRelativeTime(row.createdAt, now)]),
    question: row.question,
    articleLine: `على مقال: ${row.article.title}`,
  }));

  const comments = commentRows.map((row) => ({
    id: row.id,
    name: row.author?.name ?? null,
    initial: initialOf(row.author?.name ?? null, row.author?.email ?? null),
    email: row.author?.email ?? null,
    metaLine: arabicMetaLine([row.author?.email ?? null, arabicRelativeTime(row.createdAt, now)]),
    content: row.content,
    articleLine: `على مقال: ${row.article.title}`,
  }));

  const waiting = questions.length + comments.length;
  return ok({
    questions,
    comments,
    review: {
      title: "الجمهور",
      subtitle: waiting === 0 ? "ما في رسائل تنتظر ردك" : arabicCount(waiting, "رسالة تحتاج ردك", "رسالتان تحتاجان ردك", "رسائل تحتاج ردك"),
      questionsTabLabel: "الأسئلة",
      questionsTabCount: arabicNumber(questions.length),
      commentsTabLabel: "التعليقات",
      commentsTabCount: arabicNumber(comments.length),
      replyLinkLabel: "الرد على السؤال",
      openQuestionPrefix: "افتح سؤال",
      emptyQuestionsTitle: "ما في أسئلة تنتظر ردك",
      emptyQuestionsDescription: "الأسئلة توصلك هنا لما يسأل قارئ على أحد مقالاتك.",
      emptyCommentsTitle: "ما في تعليقات جديدة",
      emptyCommentsDescription: "التعليقات توصلك هنا لما يعلّق قارئ على أحد مقالاتك.",
      retryLabel: "إعادة المحاولة",
      errorTitle: "ما قدرنا نحمّل الجمهور",
      offlineTitle: "ما في اتصال",
      offlineDescription: "تأكد من الإنترنت وجرّب مرة ثانية.",
    },
  });
}
