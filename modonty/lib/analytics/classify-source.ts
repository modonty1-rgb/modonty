import { TrafficSource } from "@prisma/client";

/**
 * Traffic-source classifier for view tracking (article + client pages).
 *
 * Inputs come from the CLIENT (document.referrer + location.href) because the
 * API request's own Referer header is always our page URL — the root cause of
 * the pre-2026-07-07 bug where every view classified as ORGANIC.
 *
 * Priority (GA-style): UTM params on the landing URL override the referrer.
 */

export interface SourceClassification {
  source: TrafficSource;
  referrerDomain: string | null;
  searchEngine: string | null;
}

const SEARCH_ENGINES: Array<{ match: string; name: string }> = [
  { match: "google.", name: "Google" },
  { match: "bing.com", name: "Bing" },
  { match: "search.yahoo.", name: "Yahoo" },
  { match: "duckduckgo.com", name: "DuckDuckGo" },
  { match: "yandex.", name: "Yandex" },
  { match: "baidu.com", name: "Baidu" },
  { match: "ecosia.org", name: "Ecosia" },
];

const SOCIAL_HOSTS = [
  "facebook.com",
  "fb.com",
  "m.facebook.com",
  "l.facebook.com",
  "instagram.com",
  "l.instagram.com",
  "twitter.com",
  "x.com",
  "t.co",
  "linkedin.com",
  "lnkd.in",
  "tiktok.com",
  "youtube.com",
  "youtu.be",
  "whatsapp.com",
  "wa.me",
  "telegram.org",
  "t.me",
  "web.telegram.org",
  "snapchat.com",
  "pinterest.com",
  "reddit.com",
  "threads.net",
];

const EMAIL_HOSTS = ["mail.google.com", "outlook.live.com", "outlook.office.com", "mail.yahoo.com"];

function hostMatches(host: string, patterns: string[]): boolean {
  return patterns.some((p) => host === p || host.endsWith(`.${p}`));
}

export function classifyTrafficSource(
  externalReferrer: string | null | undefined,
  pageUrl: string | null | undefined,
  siteHost: string | null | undefined
): SourceClassification {
  // 1) UTM overrides — explicit campaign tagging wins over the referrer.
  if (pageUrl) {
    try {
      const params = new URL(pageUrl).searchParams;
      const medium = (params.get("utm_medium") || "").toLowerCase();
      const utmSource = params.get("utm_source");
      if (medium) {
        const domain = utmSource ? utmSource.toLowerCase() : null;
        if (/^(cpc|ppc|paid|display|banner|ads?)$/.test(medium))
          return { source: TrafficSource.PAID, referrerDomain: domain, searchEngine: null };
        if (medium === "email" || medium === "newsletter")
          return { source: TrafficSource.EMAIL, referrerDomain: domain, searchEngine: null };
        if (medium === "social" || medium === "sm")
          return { source: TrafficSource.SOCIAL, referrerDomain: domain, searchEngine: null };
        if (medium === "referral")
          return { source: TrafficSource.REFERRAL, referrerDomain: domain, searchEngine: null };
        if (medium === "organic")
          return { source: TrafficSource.ORGANIC, referrerDomain: domain, searchEngine: null };
      }
    } catch {
      /* bad URL — fall through to referrer */
    }
  }

  // 2) Referrer-based
  if (!externalReferrer || !externalReferrer.startsWith("http")) {
    return { source: TrafficSource.DIRECT, referrerDomain: null, searchEngine: null };
  }
  try {
    const refHost = new URL(externalReferrer).hostname.toLowerCase();

    if (siteHost && refHost === siteHost.toLowerCase()) {
      return { source: TrafficSource.INTERNAL, referrerDomain: refHost, searchEngine: null };
    }

    const engine = SEARCH_ENGINES.find((e) => refHost.includes(e.match));
    if (engine) return { source: TrafficSource.ORGANIC, referrerDomain: refHost, searchEngine: engine.name };

    if (hostMatches(refHost, SOCIAL_HOSTS))
      return { source: TrafficSource.SOCIAL, referrerDomain: refHost, searchEngine: null };

    if (hostMatches(refHost, EMAIL_HOSTS))
      return { source: TrafficSource.EMAIL, referrerDomain: refHost, searchEngine: null };

    return { source: TrafficSource.REFERRAL, referrerDomain: refHost, searchEngine: null };
  } catch {
    return { source: TrafficSource.DIRECT, referrerDomain: null, searchEngine: null };
  }
}
