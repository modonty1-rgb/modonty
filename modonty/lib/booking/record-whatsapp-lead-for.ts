import "server-only";

import { db } from "@/lib/db";
import { trackBookingWhatsappClick } from "@/lib/analytics/events-registry";
import { resolveArticleFromRecentView } from "@/lib/analytics/resolve-article-from-recent-view";
import { getGeoFromHeaders } from "@/lib/analytics/geo-headers";
import { fireClientEvent } from "@modonty/shared/lib/mobile-push";
import type { BookingSource } from "@/components/shared/booking-form/booking-actions";

export type WhatsappLeadResult = "recorded" | "duplicate" | "failed";

/**
 * WhatsApp lead for a visit the caller has already identified — the body of `recordWhatsappLead`
 * with the visitor passed in. The web door names the visit by its cookies (`mdy_vid`/`mdy_sid`,
 * `modonty_view_sid`); the mobile API by `X-Device-Id`. Same rule for both: GA4 counts every tap,
 * the DB keeps ONE lead per (visitor × client × session), and only a stored lead alerts the
 * partner. Never throws — recording must never block the WhatsApp handoff.
 */
export async function recordWhatsappLeadFor(
  input: { clientId: string; source: BookingSource; articleId?: string | null },
  visit: {
    visitorId: string;
    sessionId: string;
    /** The session article views were recorded under; omitted = the web's view cookie. */
    viewSessionId?: string | null;
    headers: Headers;
  },
): Promise<WhatsappLeadResult> {
  // From the client page there is no article on the click — credit the one this visitor read
  // (resolve-article-from-recent-view.ts). An article on the click always wins.
  const ctx = {
    ...input,
    articleId: input.articleId ?? (await resolveArticleFromRecentView(input.clientId, visit.viewSessionId)),
  };
  // GA4 counts every click (analytics); the DB lead stays deduped (one source of truth).
  void trackBookingWhatsappClick({
    client_id: ctx.clientId,
    booking_source: ctx.source,
    ...(ctx.articleId ? { article_id: ctx.articleId } : {}),
  });

  try {
    const { visitorId, sessionId } = visit;

    // Dedup: same visitor + client + session → already recorded this visit.
    const existing = await db.bookingRequest.findFirst({
      where: { clientId: ctx.clientId, channel: "whatsapp", visitorId, sessionId },
      select: { id: true },
    });
    if (existing) return "duplicate";

    const h = visit.headers;
    const geo = getGeoFromHeaders(h);
    const ipAddress =
      h.get("x-forwarded-for")?.split(",")[0].trim() ||
      h.get("x-real-ip") ||
      h.get("cf-connecting-ip") ||
      null;

    await db.bookingRequest.create({
      data: {
        clientId: ctx.clientId,
        articleId: ctx.articleId ?? null,
        source: ctx.source,
        channel: "whatsapp",
        status: "new",
        visitorId,
        sessionId,
        country: geo.country,
        city: geo.city,
        ipAddress,
        userAgent: h.get("user-agent") || null,
      },
      select: { id: true },
    });
    // Only a stored, non-duplicate lead alerts the client. No visitor data leaves Modonty.
    fireClientEvent(ctx.clientId, { kind: "whatsapp_contact", articleId: ctx.articleId ?? null });
    return "recorded";
  } catch (error) {
    // Recording must never block the WhatsApp handoff — logged, not thrown.
    console.error("[recordWhatsappLeadFor]", error);
    return "failed";
  }
}
