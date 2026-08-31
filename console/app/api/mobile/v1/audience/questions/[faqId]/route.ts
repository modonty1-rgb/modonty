import type { NextRequest } from "next/server";
import { ArticleFAQStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { arabicMetaLine, arabicNumber, arabicRelativeTime } from "@/lib/mobile-api/arabic-format";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";

/**
 * S08-reply «الرد على سؤال» — the one question the client opened.
 *
 * It is its own endpoint rather than a value carried through navigation: the reply screen
 * is a detail screen, and detail screens fetch what they draw (mobile ENGINEERING-RULES §4.1).
 * It also means a cold open of the screen works, and the list can stay a lean projection.
 */

const ANSWER_MAX_LENGTH = 1000;

export async function GET(request: NextRequest, { params }: { params: Promise<{ faqId: string }> }) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const { faqId } = await params;
  const row = await db.articleFAQ.findFirst({
    where: { id: faqId, article: { clientId: session.clientId }, OR: [{ source: "user" }, { source: "chatbot" }] },
    select: { id: true, question: true, answer: true, status: true, submittedByName: true, submittedByEmail: true, createdAt: true, article: { select: { title: true } } },
  });
  if (!row) return fail("NOT_FOUND", "السؤال غير موجود.");
  return ok({
    question: {
      id: row.id,
      name: row.submittedByName,
      email: row.submittedByEmail,
      metaLine: arabicMetaLine([row.submittedByEmail, `من مقال: ${row.article.title}`]),
      question: row.question,
      answer: row.answer,
      isAnswerable: row.status === ArticleFAQStatus.PENDING,
      timeLabel: arabicRelativeTime(row.createdAt),
    },
    review: {
      title: "الرد على سؤال",
      backLabel: "رجوع",
      questionCardLabel: "سؤال القارئ",
      answerLabel: "ردك",
      answerPlaceholder: "اكتب ردك هنا",
      submitLabel: "إرسال الرد",
      /**
       * تأكيد قبل الإرسال — الردّ **علنيّ ودائم**.
       *
       * يظهر للزوّار تحت المقال باسم العميل، ولا مسار في المنتَج كلّه لتعديله أو حذفه
       * (`questions/[faqId]/reply` فعل واحد بلا نظير). وكان يُرسَل بضغطة واحدة ثم تُغلق
       * الشاشة بلا إشعار — فلا يعرف العميل أنّه خرج، ولا يستطيع سحبه لو تسرّع.
       * والتأكيد يسمّي ما لا رجعة فيه، لا يسأل «هل أنت متأكد؟» فحسب.
       */
      confirmTitle: "نرسل ردك؟",
      confirmBody: "الرد يظهر للزوّار تحت المقال باسمك، وما تقدر تعدّله من التطبيق بعدها.",
      confirmAction: "أرسل",
      confirmCancel: "رجوع للتعديل",
      sentToastLabel: "انرسل ردك",
      submittingLabel: "يُرسل الرد…",
      counterMaxLabel: arabicNumber(ANSWER_MAX_LENGTH),
      answerMaxLength: ANSWER_MAX_LENGTH,
      answeredLabel: "تم إرسال ردك على هذا السؤال",
      retryLabel: "إعادة المحاولة",
      errorTitle: "ما قدرنا نحمّل السؤال",
      offlineTitle: "ما في اتصال",
      offlineDescription: "تأكد من الإنترنت وجرّب مرة ثانية.",
    },
  });
}
