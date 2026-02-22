import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { cookies, headers } from "next/headers";

const VIEW_SESSION_COOKIE = "modonty_view_sid";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    const client = await db.client.findFirst({
      where: { slug: decodedSlug },
      select: { id: true },
    });

    if (!client) {
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

    const headersList = await headers();
    const referrer = headersList.get("referer") || headersList.get("referrer") || null;
    const userAgent = headersList.get("user-agent") || null;
    const forwarded = headersList.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(",")[0].trim() : headersList.get("x-real-ip") || headersList.get("cf-connecting-ip") || null;

    const session = await auth();
    const userId = session?.user?.id ?? undefined;

    await db.clientView.create({
      data: {
        clientId: client.id,
        userId,
        sessionId,
        referrer,
        userAgent,
        ipAddress,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
