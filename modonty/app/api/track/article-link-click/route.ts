import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { ArticleStatus, LinkType } from "@prisma/client";

const VIEW_SESSION_COOKIE = "modonty_view_sid";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { articleId, linkUrl, linkText, isExternal } = body;

    if (typeof articleId !== "string" || typeof linkUrl !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const article = await db.article.findFirst({
      where: { id: articleId, status: ArticleStatus.PUBLISHED },
      select: { id: true },
    });
    if (!article) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    const cookieStore = await cookies();
    let sessionId = cookieStore.get(VIEW_SESSION_COOKIE)?.value;
    if (!sessionId) {
      sessionId = `view-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      cookieStore.set(VIEW_SESSION_COOKIE, sessionId, {
        maxAge: SESSION_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }

    const session = await auth();
    const userId = session?.user?.id ?? undefined;

    const linkType = isExternal === true ? LinkType.EXTERNAL : LinkType.INTERNAL;
    let linkDomain: string | undefined;
    try {
      linkDomain = new URL(linkUrl).hostname;
    } catch {
      linkDomain = undefined;
    }

    await db.articleLinkClick.create({
      data: {
        articleId: article.id,
        linkUrl,
        linkText: typeof linkText === "string" ? linkText.slice(0, 500) : null,
        linkType,
        isExternal: isExternal === true,
        linkDomain,
        sessionId,
        userId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
