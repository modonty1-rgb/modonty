"use server";

/**
 * Two questions about the CLIENT's own site, asked from their own console.
 *
 * We do not host their sitemap and never will — their articles live on their domain, so
 * the map to them belongs there too (board, scene 9). What we owe them is the warning:
 * an articles path blocked in `robots.txt`, or a sitemap that never mentions it, means
 * every article we write for them is invisible, and nothing in our own dashboards would
 * ever show it.
 */
import { checkRobots } from "@/lib/health/robots";
import { checkSitemap } from "@/lib/health/sitemap";

export interface ClientSiteSeoCheck {
  /** Mirrors the shared health checkers — «skip» is a real outcome there, not an error. */
  status: "pass" | "warn" | "fail" | "skip";
  message: string;
  recommendation?: string;
}

export interface ClientSiteSeoReport {
  checkedUrl: string;
  robots: ClientSiteSeoCheck[];
  sitemap: ClientSiteSeoCheck[];
  /** The one check that is specific to us: is OUR path allowed and mapped? */
  articlesPath: ClientSiteSeoCheck;
}

const TIMEOUT_MS = 8000;

/** Reads the path part of the articles base, e.g. https://x.com/sa/articles → /sa/articles */
function articlesPathOf(articlesBaseUrl: string): string | null {
  try {
    const path = new URL(articlesBaseUrl).pathname.replace(/\/+$/, "");
    return path || "/";
  } catch {
    return null;
  }
}

/**
 * `Disallow:` lines that would swallow the articles path.
 *
 * Deliberately literal — a full robots.txt grammar (wildcards, per-agent groups) is a
 * parser we would then have to trust. A prefix match catches the case that actually
 * happens: someone blocks `/sa/` or `/articles` wholesale.
 */
function findBlockingRule(robotsText: string, path: string): string | null {
  for (const raw of robotsText.split(/\r?\n/)) {
    const line = raw.trim();
    if (!/^disallow\s*:/i.test(line)) continue;
    const value = line.split(":").slice(1).join(":").trim();
    if (!value) continue; // `Disallow:` with nothing = allow all
    const rule = value.replace(/\*+$/, "");
    if (rule === "/" || path.startsWith(rule)) return line;
  }
  return null;
}

export async function checkClientSiteSeo(articlesBaseUrl: string): Promise<ClientSiteSeoReport> {
  const path = articlesPathOf(articlesBaseUrl);
  const origin = new URL(articlesBaseUrl).origin;

  const [robots, sitemap] = await Promise.all([
    checkRobots(articlesBaseUrl).catch(() => []),
    checkSitemap(articlesBaseUrl).catch(() => []),
  ]);

  let articlesPath: ClientSiteSeoCheck = {
    status: "warn",
    message: "ما قدرنا نقرأ robots.txt عندك، فما نقدر نتأكد أن مسار مقالاتك مسموح.",
  };

  if (path) {
    try {
      const res = await fetch(`${origin}/robots.txt`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (res.ok) {
        const text = await res.text();
        const blocking = findBlockingRule(text, path);
        articlesPath = blocking
          ? {
              status: "fail",
              message: `مسار مقالاتك ${path} محظور في robots.txt بالسطر: ${blocking}`,
              recommendation: "احذف هذا السطر أو استثنِ مسار المقالات — وإلا جوجل ما يقرأ ولا مقال.",
            }
          : {
              status: "pass",
              message: `مسار مقالاتك ${path} مسموح في robots.txt`,
            };
      } else if (res.status === 404) {
        articlesPath = {
          status: "pass",
          message: "ما فيه robots.txt — يعني ما فيه حظر على مسار مقالاتك.",
        };
      }
    } catch {
      // keep the warn above — an unreachable file is not a verdict.
    }
  }

  return {
    checkedUrl: articlesBaseUrl,
    robots: robots.map((r) => ({ status: r.status, message: r.message ?? "", recommendation: r.recommendation })),
    sitemap: sitemap.map((r) => ({ status: r.status, message: r.message ?? "", recommendation: r.recommendation })),
    articlesPath,
  };
}
