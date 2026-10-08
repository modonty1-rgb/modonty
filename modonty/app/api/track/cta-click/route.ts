import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { recordCtaClick } from "@/lib/analytics/record-cta-click";

const VIEW_SESSION_COOKIE = "modonty_view_sid";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

/** Web door: the visit cookie names the session; the logic lives in `recordCtaClick`. */
export async function POST(request: Request) {
  try {
    const body = await request.json();

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

    const result = await recordCtaClick({
      body,
      sessionId,
      resolveUserId: async () => (await auth())?.user?.id ?? undefined,
      headers: request.headers,
    });

    if (result.kind === "invalid") {
      return NextResponse.json({ ok: false, fields: result.fields }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/track/cta-click]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
