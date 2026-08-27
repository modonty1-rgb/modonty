import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";

export async function GET(request: NextRequest, { params }: { params: Promise<{ articleId: string }> }) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const { articleId } = await params;
  const article = await db.article.findFirst({ where: { id: articleId, clientId: session.clientId }, select: { id: true, title: true, slug: true, content: true, excerpt: true, status: true, wordCount: true, scheduledAt: true, datePublished: true, lastReviewed: true, isClientSiteArticle: true, canonicalUrl: true, category: { select: { name: true } }, author: { select: { name: true, credentials: true } }, featuredImage: { select: { url: true, bunnyUrl: true, altText: true } }, faqs: { select: { id: true, question: true, answer: true, status: true, position: true }, orderBy: { position: "asc" } } } });
  if (!article) return fail("NOT_FOUND", "المقال غير موجود.");
  return ok({ article });
}
