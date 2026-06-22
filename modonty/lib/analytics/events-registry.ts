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

interface ArticleContext {
  article_id?: string;
  article_slug?: string;
  article_title?: string;
  author_id?: string;
  author_name?: string;
  category_slug?: string;
  category_name?: string;
  tag_primary?: string;
}

// ─── Tier 2 — Article Events (9) ─────────────────────────────────────────────

export interface ArticleViewParams extends ArticleContext, ClientContext {}
export interface ArticleLikeParams extends ArticleContext, ClientContext {}
export interface ArticleDislikeParams extends ArticleContext, ClientContext {}
export interface ArticleFavoriteParams extends ArticleContext, ClientContext {}
export interface ArticleShareParams extends ArticleContext, ClientContext {
  share_platform: string;
}
export interface CommentSubmitParams extends ArticleContext, ClientContext {
  comment_id: string;
  comment_target_type: "article" | "client";
}
export interface CommentReplyParams extends ArticleContext, ClientContext {
  comment_id: string;
}
export interface CommentLikeParams extends ArticleContext, ClientContext {
  comment_id: string;
}
export interface CommentDislikeParams extends ArticleContext, ClientContext {
  comment_id: string;
}

// ─── Tier 2 — Client Page Events (5) ─────────────────────────────────────────

export interface ClientViewParams extends ClientContext {}
export interface ClientShareParams extends ClientContext {
  share_platform: string;
}
export interface ClientFavoriteParams extends ClientContext {}
export interface ClientCommentSubmitParams extends ClientContext {
  comment_id: string;
}
export interface NewsletterSubscribeParams extends ClientContext {}

// ─── Tier 2 — Engagement (2) ─────────────────────────────────────────────────

export interface FollowClientParams extends ClientContext {}
export interface OutboundClickParams {
  cta_label?: string;
  cta_target_url: string;
  cta_type?: string;
  cta_location?: string;
}

// ─── Tier 3 — Conversion Events (5) ⭐ ────────────────────────────────────────

export interface ContactSubmitParams extends ClientContext {
  contact_method: "whatsapp" | "email" | "phone" | "form";
}
export interface AskClientSubmitParams extends ClientContext, ArticleContext {}
export interface CampaignInterestParams extends ClientContext {
  campaign_reach: "own" | "industry" | "full";
}
/**
 * Generic lead-gen / conversion completion event (NOT GA4 reserved `purchase`).
 *
 * Per GA4 official docs: `purchase` is a reserved ecommerce event requiring
 * currency + value + transaction_id + items[]. Using it without those params
 * pollutes ecommerce reports with $0 fake transactions.
 *
 * `conversion_complete` is a custom name — safe for tracking subscriber/contact/
 * register completions. Mark as Key Event in GA4 Admin → Events.
 */
export interface ConversionCompleteParams extends ClientContext {
  conversion_type: string;
}
export interface FollowConversionParams extends ClientContext {}

// ─── Signup funnel (3) — visitor → registered user ───────────────────────────
type SignupSource = "header" | "banner" | "page";
type SignupMethod = "google" | "email";
export interface SignupViewParams {
  signup_source?: SignupSource;
}
export interface SignupStartParams {
  signup_method: SignupMethod;
  signup_source?: SignupSource;
}
export interface SignupCompleteParams {
  signup_method: SignupMethod;
  signup_source?: SignupSource;
}

// ─── Deferred (1) — wires when lead-scoring lands in modonty ─────────────────

export interface LeadQualifiedParams extends ClientContext {
  conversion_type: "lead_qualified";
}

// ─── Performance (1) — Core Web Vitals (RUM / field data) ────────────────────

export interface WebVitalsParams {
  metric_name: string; // LCP | INP | CLS | FCP | TTFB
  metric_value: number; // milliseconds (CLS ×1000 to keep an integer)
  metric_rating?: string; // good | needs-improvement | poor
  metric_id?: string; // unique per page load (for percentile / dedup)
  metric_delta?: number;
  metric_nav_type?: string;
  page_path?: string;
}

// ─── Event registry (single source of truth) ─────────────────────────────────

export const GA4_EVENTS = {
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
  signup_view: "signup_view",
  signup_start: "signup_start",
  signup_complete: "signup_complete",
  lead_qualified: "lead_qualified",
  web_vitals: "web_vitals",
} as const;

export type GA4EventName = (typeof GA4_EVENTS)[keyof typeof GA4_EVENTS];

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

// Article
export const trackArticleView = (p: ArticleViewParams, o?: TrackOptions) =>
  trackEvent(GA4_EVENTS.article_view, p, o);
export const trackArticleLike = (p: ArticleLikeParams, o?: TrackOptions) =>
  trackEvent(GA4_EVENTS.article_like, p, o);
export const trackArticleDislike = (p: ArticleDislikeParams, o?: TrackOptions) =>
  trackEvent(GA4_EVENTS.article_dislike, p, o);
export const trackArticleFavorite = (p: ArticleFavoriteParams, o?: TrackOptions) =>
  trackEvent(GA4_EVENTS.article_favorite, p, o);
export const trackArticleShare = (p: ArticleShareParams, o?: TrackOptions) =>
  trackEvent(GA4_EVENTS.article_share, p, o);
export const trackCommentSubmit = (p: CommentSubmitParams, o?: TrackOptions) =>
  trackEvent(GA4_EVENTS.comment_submit, p, o);
export const trackCommentReply = (p: CommentReplyParams, o?: TrackOptions) =>
  trackEvent(GA4_EVENTS.comment_reply, p, o);
export const trackCommentLike = (p: CommentLikeParams, o?: TrackOptions) =>
  trackEvent(GA4_EVENTS.comment_like, p, o);
export const trackCommentDislike = (p: CommentDislikeParams, o?: TrackOptions) =>
  trackEvent(GA4_EVENTS.comment_dislike, p, o);

// Client page
export const trackClientView = (p: ClientViewParams, o?: TrackOptions) =>
  trackEvent(GA4_EVENTS.client_view, p, o);
export const trackClientShare = (p: ClientShareParams, o?: TrackOptions) =>
  trackEvent(GA4_EVENTS.client_share, p, o);
export const trackClientFavorite = (p: ClientFavoriteParams, o?: TrackOptions) =>
  trackEvent(GA4_EVENTS.client_favorite, p, o);
export const trackClientCommentSubmit = (p: ClientCommentSubmitParams, o?: TrackOptions) =>
  trackEvent(GA4_EVENTS.client_comment_submit, p, o);
export const trackNewsletterSubscribe = (p: NewsletterSubscribeParams, o?: TrackOptions) =>
  trackEvent(GA4_EVENTS.newsletter_subscribe, p, o);

// Engagement
export const trackFollowClient = (p: FollowClientParams, o?: TrackOptions) =>
  trackEvent(GA4_EVENTS.follow_client, p, o);
export const trackOutboundClick = (p: OutboundClickParams, o?: TrackOptions) =>
  trackEvent(GA4_EVENTS.outbound_click, p, o);

// Conversion ⭐
export const trackContactSubmit = (p: ContactSubmitParams, o?: TrackOptions) =>
  trackEvent(GA4_EVENTS.contact_submit, p, o);
export const trackAskClientSubmit = (p: AskClientSubmitParams, o?: TrackOptions) =>
  trackEvent(GA4_EVENTS.ask_client_submit, p, o);
export const trackCampaignInterest = (p: CampaignInterestParams, o?: TrackOptions) =>
  trackEvent(GA4_EVENTS.campaign_interest, p, o);
export const trackConversionComplete = (p: ConversionCompleteParams, o?: TrackOptions) =>
  trackEvent(GA4_EVENTS.conversion_complete, p, o);

// Signup funnel
export const trackSignupView = (p: SignupViewParams, o?: TrackOptions) =>
  trackEvent(GA4_EVENTS.signup_view, p, o);
export const trackSignupStart = (p: SignupStartParams, o?: TrackOptions) =>
  trackEvent(GA4_EVENTS.signup_start, p, o);
export const trackSignupComplete = (p: SignupCompleteParams, o?: TrackOptions) =>
  trackEvent(GA4_EVENTS.signup_complete, p, o);

// Deferred
export const trackLeadQualified = (p: LeadQualifiedParams, o?: TrackOptions) =>
  trackEvent(GA4_EVENTS.lead_qualified, p, o);

// Performance — Core Web Vitals (RUM field data; same server-side MP path as all events)
export const trackWebVitals = (p: WebVitalsParams, o?: TrackOptions) =>
  trackEvent(GA4_EVENTS.web_vitals, p, o);
