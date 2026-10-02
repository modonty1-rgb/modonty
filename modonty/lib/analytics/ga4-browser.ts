/**
 * GA4 events that START in the browser — sent from the browser, through GTM.
 *
 * Why not the server (ga4-server.ts): GA4 reported 13,317 of 14,663 sessions (91%, 30 days to
 * 1 Oct 2026) as «Unassigned» with 2 engaged — and 99.7% of the events inside them were the
 * eight below, sent via Measurement Protocol. Google: the protocol is meant to AUGMENT browser
 * collection, not replace it; an event with no matching browser session becomes its own
 * session with no source, country or device.
 *
 * GTM side (container GTM-MNRR2NS9): one Custom Event trigger on these names + one
 * «GA4 Event» tag whose name is {{Event}} and whose parameters read `ga4_params.*`.
 *
 * `ga4_params: null` before every push follows Google's own ecommerce pattern
 * (`dataLayer.push({ ecommerce: null })`): GTM merges each push into one data-layer model, so
 * without the reset a client_view would carry the previous article_view's article_title.
 *
 * Pushing before GTM has loaded is fine: GTM processes the queued array in order on load.
 *
 * `client_id` here is our partner's database id. The GTM tag sends it to GA4 as
 * `client_db_id` — a GA4 event parameter literally named `client_id` replaces the visitor's
 * GA client id (measured in GTM preview, 2 Oct 2026).
 *
 * Events that start on the SERVER (signup_complete, booking_submit, likes …) stay on
 * Measurement Protocol — they have no browser moment to fire from.
 */

export const GA4_BROWSER_EVENTS = [
  "article_view",
  "client_view",
  "reel_view",
  "outbound_click",
  "signup_view",
  "signup_start",
  "login_start",
  "web_vitals",
] as const;

export type Ga4BrowserEvent = (typeof GA4_BROWSER_EVENTS)[number];

type Ga4BrowserParams = Record<string, string | number | null | undefined>;

export function pushGa4Event(eventName: Ga4BrowserEvent, params: Ga4BrowserParams = {}): void {
  if (typeof window === "undefined") return;
  try {
    const clean: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === undefined || value === "") continue;
      // GA4 truncates event parameter values at 100 characters.
      clean[key] = typeof value === "string" ? value.slice(0, 100) : value;
    }
    const dataLayer = (window.dataLayer = window.dataLayer || []);
    dataLayer.push({ ga4_params: null });
    dataLayer.push({ event: eventName, ga4_params: clean });
  } catch {
    // Analytics must never break the page.
  }
}
