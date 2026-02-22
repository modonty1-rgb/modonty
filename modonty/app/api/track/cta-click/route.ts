import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { CTAType } from "@prisma/client";

const VIEW_SESSION_COOKIE = "modonty_view_sid";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

const VALID_TYPES: CTAType[] = ["BUTTON", "LINK", "FORM", "BANNER", "POPUP"];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type,
      label,
      targetUrl,
      articleId,
      clientId,
      timeOnPage,
      scrollDepth,
    } = body;

    if (!type || !VALID_TYPES.includes(type as CTAType)) {
      return NextResponse.json({ ok: false }, { status: 400 });
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

    await db.cTAClick.create({
      data: {
        type: type as CTAType,
        label: typeof label === "string" ? label : null,
        targetUrl: typeof targetUrl === "string" ? targetUrl : null,
        articleId: typeof articleId === "string" ? articleId : undefined,
        clientId: typeof clientId === "string" ? clientId : undefined,
        userId,
        sessionId,
        timeOnPage: typeof timeOnPage === "number" ? timeOnPage : undefined,
        scrollDepth: typeof scrollDepth === "number" ? scrollDepth : undefined,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
