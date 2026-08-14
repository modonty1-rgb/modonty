import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

const VIEW_SESSION_COOKIE = "modonty_view_sid";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await _request.json().catch(() => ({}));
    const { timeOnPage, scrollDepth, bounced, lcp, cls, inp } = body;

    const existing = await db.analytics.findUnique({
      where: { id },
      select: { id: true, sessionId: true },
    });
    if (!existing) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    const cookieStore = await cookies();
    const sessionId = cookieStore.get(VIEW_SESSION_COOKIE)?.value;
    if (sessionId && existing.sessionId && sessionId !== existing.sessionId) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    await db.analytics.update({
      where: { id },
      data: {
        ...(typeof timeOnPage === "number" && timeOnPage >= 0 && { timeOnPage }),
        ...(typeof scrollDepth === "number" && scrollDepth >= 0 && scrollDepth <= 100 && { scrollDepth }),
        ...(typeof bounced === "boolean" && { bounced }),
        ...(typeof lcp === "number" && lcp >= 0 && { lcp }),
        ...(typeof cls === "number" && cls >= 0 && { cls }),
        ...(typeof inp === "number" && inp >= 0 && { inp }),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
