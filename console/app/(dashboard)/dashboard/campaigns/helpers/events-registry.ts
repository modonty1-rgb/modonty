/**
 * GA4 Events Registry — typed event catalog for Modonty.
 *
 * 21 events to wire (16 Tier 2 + 5 Tier 3) + 1 deferred.
 * Each event has a typed param shape. Use the exported `track*` helpers
 * from Server Actions / Route Handlers — they auto-resolve visitor + session ids.
 *
 * snake_case naming (GA4 standard), event names ≤ 40 chars,
 * param keys ≤ 40 chars, string values ≤ 500 chars.
 */

import { sendGA4Event } from "./ga4-server";
import { getVisitorContext } from "./visitor-cookie";

// ─── Common param types ──────────────────────────────────────────────────────

interface ClientContext {
  client_id?: string;
  client_slug?: string;
  client_name?: string;
  client_industry?: string;
}

// ─── Tier 3 — Conversion Events (5) ⭐ ────────────────────────────────────────

interface CampaignInterestParams extends ClientContext {
  campaign_reach: "own" | "industry" | "full";
}

// ─── Event registry (single source of truth) ─────────────────────────────────

const GA4_EVENTS = {
  article_view: "article_view",
  article_like: "article_like",
  article_dislike: "article_dislike",
  article_favorite: "article_favorite",
  article_share: "article_share",
  comment_submit: "comment_submit",
  comment_reply: "comment_reply",
  comment_like: "comment_like",
  comment_dislike: "comment_dislike",
  client_view: "client_view",
  client_share: "client_share",
  client_favorite: "client_favorite",
  client_comment_submit: "client_comment_submit",
  newsletter_subscribe: "newsletter_subscribe",
  follow_client: "follow_client",
  outbound_click: "outbound_click",
  contact_submit: "contact_submit",
  ask_client_submit: "ask_client_submit",
  campaign_interest: "campaign_interest",
  conversion_complete: "conversion_complete",
  lead_qualified: "lead_qualified",
} as const;

type GA4EventName = (typeof GA4_EVENTS)[keyof typeof GA4_EVENTS];

// ─── Typed track helpers ─────────────────────────────────────────────────────

interface TrackOptions {
  userId?: string;
}

async function trackEvent<T extends object>(
  eventName: GA4EventName,
  params: T,
  options: TrackOptions = {},
): Promise<void> {
  const { clientId, sessionId } = await getVisitorContext();
  sendGA4Event(
    eventName,
    clientId,
    sessionId,
    params as unknown as Record<string, string | number | boolean | null | undefined>,
    { userId: options.userId },
  );
}

// Conversion ⭐
export const trackCampaignInterest = (p: CampaignInterestParams, o?: TrackOptions) =>
  trackEvent(GA4_EVENTS.campaign_interest, p, o);
