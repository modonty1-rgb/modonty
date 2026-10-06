import "server-only";

import { db } from "@/lib/db";
import { classifyTrafficSource } from "@/lib/analytics/classify-source";
import { getGeoFromHeaders } from "@/lib/analytics/geo-headers";
import { notifyTelegram } from "@/lib/telegram/notify-telegram";

export type ClientViewResult =
  | { found: false }
  | { found: true; deduplicated: true }
  | { found: true; deduplicated: false; ga4: Record<string, string | undefined> };

/**
 * One partner-page view — the body of `POST /clients/[slug]/api/view`, shared by the web route
 * (`modonty_view_sid` cookie) and the mobile API (X-Device-Id). Same rule: suppress only a
 * refresh-in-place (the most recent client view of this reader/session is the same client).
 */
export async function recordClientView(input: {
  slug: string;
  resolveSessionId: () => Promise<string>;
  resolveUserId: () => Promise<string | undefined>;
  referrer: string | null;
  headers: Headers;
}): Promise<ClientViewResult> {
  const client = await db.client.findFirst({
    where: { slug: input.slug },
    select: { id: true, slug: true, name: true, industry: { select: { name: true } } },
  });

  if (!client) return { found: false };

  const sessionId = await input.resolveSessionId();

  const { referrer } = input;
  const headersList = input.headers;
  const userAgent = headersList.get("user-agent") || null;
  const forwarded = headersList.get("x-forwarded-for");
  const ipAddress = forwarded ? forwarded.split(",")[0].trim() : headersList.get("x-real-ip") || headersList.get("cf-connecting-ip") || null;

  const userId = await input.resolveUserId();

  // Honest views: count every genuine entry; suppress only a refresh-in-place —
  // i.e. the session's most recent client view is the SAME client (consecutive
  // duplicate). Returning here after visiting another page counts again.
  const lastView = await db.clientView.findFirst({
    where: userId ? { userId } : { sessionId },
    orderBy: { createdAt: "desc" },
    select: { clientId: true },
  });
  if (lastView?.clientId === client.id) {
    return { found: true, deduplicated: true };
  }

  const host = headersList.get("host") || null;
  const { source, referrerDomain, searchEngine } = classifyTrafficSource(referrer, null, host);
  const { country, region, city } = getGeoFromHeaders(headersList);

  await db.clientView.create({
    data: {
      clientId: client.id,
      userId,
      sessionId,
      referrer,
      userAgent,
      ipAddress,
      source,
      referrerDomain,
      searchEngine,
      country,
      region,
      city,
    },
  });

  const formatReferrer = (r: string | null): string => {
    if (!r) return "مباشر";
    try {
      const u = new URL(r);
      return `${u.hostname}${decodeURIComponent(u.pathname)}`;
    } catch {
      try {
        return decodeURIComponent(r);
      } catch {
        return r;
      }
    }
  };
  notifyTelegram(client.id, "clientView", {
    meta: { المصدر: formatReferrer(referrer) },
    ipAddress,
    headers: headersList,
  }).catch(() => {});

  // GA4 client_view is sent by the CLIENT (browser: ClientViewTracker → GTM; app: its own SDK) —
  // a server-sent event became a phantom session (see lib/analytics/ga4-browser.ts).
  const ga4 = {
    client_id: client.id,
    client_slug: client.slug,
    client_name: client.name,
    client_industry: client.industry?.name,
  };

  return { found: true, deduplicated: false, ga4 };
}
