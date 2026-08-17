// Fire-and-forget client helper for the login funnel (login_start on button click).
// Posts to /users/login/api/track which forwards to GA4 via Measurement Protocol —
// reliable without depending on any GTM tag configuration.

type LoginMethod = "google" | "email";

export function trackLoginClient(method: LoginMethod): void {
  try {
    fetch("/users/login/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // no-op
  }
}
