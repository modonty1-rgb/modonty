import type { NextRequest } from "next/server";
import { CommentStatus } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";
import { rejectMalformedIds } from "@/lib/mobile-api/params";
import { setCommentStatusForClient } from "@/lib/comments/set-comment-status";
import { setClientReviewStatusForClient } from "@/lib/client-reviews/set-client-review-status";

/**
 * قرار العميل على تعليق قارئ من التطبيق: اعتماد أو رفض — تعليق مقال أو ريل، أو تقييم صفحته.
 *
 * نفس دالّة الويب (`setCommentStatusForClient`)، فالعدّاد على المقال/الريل ونشر التعليق
 * وإشعار كاتبه يحدث هنا كما يحدث من صفحة التعليقات. والقرار للتعليق المنتظر وحده:
 * تعليق حُسم من الويب قبل لحظة يرجع 409 بدل أن يقلب قرار العميل نفسه.
 */
const bodySchema = z.object({
  kind: z.enum(["article", "reel", "review"]),
  decision: z.enum(["approve", "reject"]),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const { commentId } = await params;
  const malformed = rejectMalformedIds([commentId], "التعليق غير موجود.");
  if (malformed) return malformed;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail("VALIDATION_ERROR", "طلب غير صالح.");
  const { kind, decision } = parsed.data;

  const pending = kind === "article"
    ? await db.comment.findFirst({ where: { id: commentId, article: { clientId: session.clientId } }, select: { status: true } })
    : kind === "reel"
      ? await db.mediaComment.findFirst({ where: { id: commentId, media: { clientId: session.clientId, inReels: true } }, select: { status: true } })
      : await db.clientReview.findFirst({ where: { id: commentId, clientId: session.clientId }, select: { status: true } });
  if (!pending) return fail("NOT_FOUND", "التعليق غير موجود.");
  if (pending.status !== CommentStatus.PENDING) return fail("CONFLICT", "هذا التعليق اتّخذ فيه قرار من قبل. حدّث الصفحة.");

  const next = decision === "approve" ? CommentStatus.APPROVED : CommentStatus.REJECTED;
  const result = kind === "review"
    ? await setClientReviewStatusForClient(session.clientId, commentId, next)
    : await setCommentStatusForClient(session.clientId, kind, commentId, next);
  if (!result.success) return fail("INTERNAL_ERROR", result.error);
  return ok({
    comment: { id: commentId, kind, status: next },
    message: decision === "approve" ? "اعتمدناه — صار ظاهراً للقرّاء." : "رفضناه — ما راح يظهر.",
  });
}
