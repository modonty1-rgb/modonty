/**
 * Auto-detect Google Business Profile URL from a client's website HTML.
 * Zero external APIs, zero cost. Used by the intake page so the client
 * doesn't have to track down their own GBP listing URL.
 */

const FETCH_TIMEOUT_MS = 5000;

function detectGbpUrl(html: string): string | null {
  // Common GBP URL patterns: g.page/<slug>, maps.google.com/?cid=..., share-link with place_id
  const patterns = [
    /https:\/\/g\.page\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)?/i,
    /https:\/\/(?:www\.)?google\.com\/maps\/place\/[^"'\s<>]+/i,
    /https:\/\/maps\.google\.com\/(?:\?cid=\d+|maps\?cid=\d+)/i,
    /https:\/\/maps\.app\.goo\.gl\/[A-Za-z0-9]+/i,
  ];
  for (const rx of patterns) {
    const match = html.match(rx);
    if (match) return match[0];
  }
  return null;
}

export interface DetectedTech {
  gbpUrl: string | null;
}

export async function detectTech(url: string): Promise<DetectedTech> {
  if (!url || !url.trim()) return { gbpUrl: null };
  const target = url.startsWith("http") ? url : `https://${url}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(target, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ModontyBot/1.0; +https://modonty.com)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(timer);

    if (!res.ok) return { gbpUrl: null };
    const html = await res.text();

    return { gbpUrl: detectGbpUrl(html) };
  } catch {
    return { gbpUrl: null };
  }
}
