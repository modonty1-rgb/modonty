import "server-only";

import { db } from "@/lib/db";

function classifyPath(path: string): string {
  if (path === "/") return "home";
  if (path.startsWith("/categories")) return "categories";
  if (path.startsWith("/tags")) return "tags";
  if (path.startsWith("/authors")) return "authors";
  if (path.startsWith("/help")) return "help";
  if (path.startsWith("/search")) return "search";
  return "other";
}

type PageViewResult =
  | { recorded: false; reason: "invalid" }
  | { recorded: false; reason: "owned" | "bot" | "deduplicated" }
  | { recorded: true };

/**
 * One listing-page view — the body of `POST /api/track/pageview`, shared by the web route
 * (`modonty_view_sid` cookie, User-Agent bot filter) and the mobile API (X-Device-Id; the app's
 * fixed UA is not a bot signal, so the caller decides `isBot` from X-App-Version instead).
 */
export async function recordPageView(input: {
  rawPath: unknown;
  isBot: () => boolean;
  resolveSessionId: () => Promise<string>;
  resolveUserId: () => Promise<string | undefined>;
  userAgent: string | null;
  referrer: string | null;
}): Promise<PageViewResult> {
  let path = typeof input.rawPath === "string" ? input.rawPath : null;
  if (!path) return { recorded: false, reason: "invalid" };

  // Normalize: drop query/hash + trailing slash (keep root "/").
  path = path.split("?")[0].split("#")[0];
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);

  // Article + client pages own their dedicated trackers — never double-count here.
  if (path.startsWith("/articles/") || path.startsWith("/clients/")) {
    return { recorded: false, reason: "owned" };
  }

  if (input.isBot()) return { recorded: false, reason: "bot" };

  const sessionId = await input.resolveSessionId();
  const userId = await input.resolveUserId();

  // Honest count: suppress only a refresh-in-place — the session's most recent
  // page view is the SAME path. A genuine return after navigating elsewhere counts.
  const lastView = await db.pageView.findFirst({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
    select: { path: true },
  });
  if (lastView?.path === path) {
    return { recorded: false, reason: "deduplicated" };
  }

  await db.pageView.create({
    data: { path, pageType: classifyPath(path), userId, sessionId, userAgent: input.userAgent, referrer: input.referrer },
  });

  return { recorded: true };
}
