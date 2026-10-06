import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies, headers } from "next/headers";
import { recordArticleView } from "@/lib/analytics/record-article-view";

const VIEW_SESSION_COOKIE = "modonty_view_sid";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

// Web door: the dedupe key is the `modonty_view_sid` cookie. The counting rule itself lives in
// lib/analytics/record-article-view.ts, shared with the mobile API (which keys on X-Device-Id).
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    // The truth comes from the browser: document.referrer (external source) +
    // location.href (UTM params). The request's own Referer header is always
    // our page URL — relying on it misclassified every view as ORGANIC (pre-2026-07-07).
    const body = (await request.json().catch(() => null)) as {
      referrer?: string | null;
      url?: string | null;
    } | null;

    const result = await recordArticleView({
      slug: decodedSlug,
      referrer: body?.referrer?.trim() || null,
      pageUrl: body?.url?.trim() || null,
      headers: await headers(),
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
    });

    if (!result.found) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }
    if (result.analyticsId === null) {
      return NextResponse.json({ ok: true, analyticsId: null, clarity: result.clarity });
    }
    return NextResponse.json({ ok: true, analyticsId: result.analyticsId, ga4: result.ga4, clarity: result.clarity });
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
