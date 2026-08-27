import type { NextRequest } from "next/server";
import { ArticleFAQStatus, CommentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";

export async function GET(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const clientId = session.clientId;
  const [questions, comments] = await Promise.all([
    db.articleFAQ.findMany({
      where: { article: { clientId }, OR: [{ source: "chatbot" }, { source: "user" }] },
      orderBy: { createdAt: "desc" }, take: 100,
      select: { id: true, question: true, answer: true, status: true, source: true, submittedByName: true, createdAt: true, article: { select: { id: true, title: true, slug: true } } },
    }),
    db.comment.findMany({
      where: { article: { clientId } }, orderBy: { createdAt: "desc" }, take: 100,
      select: { id: true, content: true, status: true, createdAt: true, author: { select: { name: true, email: true } }, article: { select: { id: true, title: true, slug: true } } },
    }),
  ]);
  return ok({ questions, comments, summary: { pendingQuestions: questions.filter((item) => item.status === ArticleFAQStatus.PENDING).length, pendingComments: comments.filter((item) => item.status === CommentStatus.PENDING).length } });
}
