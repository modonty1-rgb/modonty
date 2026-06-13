import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { cookies, headers } from "next/headers";

const VIEW_SESSION_COOKIE = "modonty_view_sid";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

// Crawlers + social link-preview fetchers — excluded so the views counter stays
// honest (real humans only, no bot inflation).
const BOT_UA =
  /bot|crawl|spider|slurp|mediapartners|facebookexternalhit|whatsapp|telegram|embedly|quora|pinterest|vkshare|bingpreview|lighthouse|headless|python-requests|axios|curl|wget|node-fetch|go-http|monitoring/i;

function classifyPath(path: string): string {
  if (path === "/") return "home";
  if (path.startsWith("/categories")) return "categories";
  if (path.startsWith("/tags")) return "tags";
  if (path.startsWith("/authors")) return "authors";
  if (path.startsWith("/help")) return "help";
  if (path.startsWith("/search")) return "search";
  return "other";
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    let path = typeof body?.path === "string" ? body.path : null;
    if (!path) return NextResponse.json({ ok: false }, { status: 400 });

    // Normalize: drop query/hash + trailing slash (keep root "/").
    path = path.split("?")[0].split("#")[0];
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);

    // Article + client pages own their dedicated trackers — never double-count here.
    if (path.startsWith("/articles/") || path.startsWith("/clients/")) {
      return NextResponse.json({ ok: true, skipped: "owned" });
    }

    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || null;
    if (userAgent && BOT_UA.test(userAgent)) {
      return NextResponse.json({ ok: true, skipped: "bot" });
    }

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

    const referrer = headersList.get("referer") || headersList.get("referrer") || null;
    const session = await auth();
    const userId = session?.user?.id ?? undefined;

    // Honest count: suppress only a refresh-in-place — the session's most recent
    // page view is the SAME path. A genuine return after navigating elsewhere counts.
    const lastView = await db.pageView.findFirst({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
      select: { path: true },
    });
    if (lastView?.path === path) {
      return NextResponse.json({ ok: true, deduplicated: true });
    }

    await db.pageView.create({
      data: { path, pageType: classifyPath(path), userId, sessionId, userAgent, referrer },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
