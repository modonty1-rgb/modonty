import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies, headers } from "next/headers";
import { recordPageView } from "./record-page-view";

const VIEW_SESSION_COOKIE = "modonty_view_sid";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

// Crawlers + social link-preview fetchers — excluded so the views counter stays
// honest (real humans only, no bot inflation).
const BOT_UA =
  /bot|crawl|spider|slurp|mediapartners|facebookexternalhit|whatsapp|telegram|embedly|quora|pinterest|vkshare|bingpreview|lighthouse|headless|python-requests|axios|curl|wget|node-fetch|go-http|monitoring/i;

// Web door: cookie session + User-Agent bot filter. The counting rule lives in
// ./record-page-view.ts, shared with the mobile API (keyed on X-Device-Id).
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || null;

    const result = await recordPageView({
      rawPath: body?.path,
      isBot: () => !!userAgent && BOT_UA.test(userAgent),
      userAgent,
      referrer: headersList.get("referer") || headersList.get("referrer") || null,
      resolveSessionId: async () => {
        const cookieStore = await cookies();
        let sessionId = cookieStore.get(VIEW_SESSION_COOKIE)?.value;
        if (!sessionId) {
          sessionId = crypto.randomUUID();
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

    if (result.recorded) return NextResponse.json({ ok: true });
    switch (result.reason) {
      case "invalid":
        return NextResponse.json({ ok: false }, { status: 400 });
      case "owned":
        return NextResponse.json({ ok: true, skipped: "owned" });
      case "bot":
        return NextResponse.json({ ok: true, skipped: "bot" });
      default:
        // "deduplicated" — the only reason left.
        return NextResponse.json({ ok: true, deduplicated: true });
    }
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
