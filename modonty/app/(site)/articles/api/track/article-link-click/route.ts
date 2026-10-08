import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { recordArticleLinkClick } from "@/lib/analytics/record-article-link-click";

const VIEW_SESSION_COOKIE = "modonty_view_sid";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

/** Web door: the visit cookie names the session; the logic lives in `recordArticleLinkClick`. */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await recordArticleLinkClick({
      body: body && typeof body === "object" ? body : {},
      resolveSessionId: async () => {
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
        return sessionId;
      },
      resolveUserId: async () => (await auth())?.user?.id ?? undefined,
      headers: request.headers,
    });

    if (result === "invalid") return NextResponse.json({ ok: false }, { status: 400 });
    if (result === "not_found") return NextResponse.json({ ok: false }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[articles/api/track/article-link-click]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
