// Fire-and-forget client helper for the signup funnel (view + start).
// Posts to /users/register/api/track which forwards to GA4 via Measurement Protocol —
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
    fetch("/users/register/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, method, source }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // no-op
  }
}
