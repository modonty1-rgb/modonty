// Fire-and-forget client helper for the signup funnel (view + start).
// Posts to /api/track/signup which forwards to GA4 via Measurement Protocol —
// reliable without depending on any GTM tag configuration.

type SignupEvent = "view" | "start";
type SignupMethod = "google" | "email";
type SignupSource = "header" | "banner" | "page";

export function trackSignupClient(
  event: SignupEvent,
  method?: SignupMethod,
  source: SignupSource = "page",
): void {
  try {
    fetch("/api/track/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, method, source }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // no-op
  }
}
