// Signup funnel events that start in the browser (view on register-page load, start on the
// Google/email button) — pushed to GTM from here. Until Oct 2026 they went through a server
// route on Measurement Protocol, and each one became a phantom GA4 session
// (see lib/analytics/ga4-browser.ts). signup_complete stays server-side (registerUser /
// events.createUser) — it has no browser moment.

import { pushGa4Event } from "@/lib/analytics/ga4-browser";

type SignupEvent = "view" | "start";
type SignupMethod = "google" | "email";
type SignupSource = "header" | "banner" | "page";

export function trackSignupClient(
  event: SignupEvent,
  method?: SignupMethod,
  source: SignupSource = "page",
): void {
  if (event === "view") {
    pushGa4Event("signup_view", { signup_source: source });
    return;
  }
  if (method) pushGa4Event("signup_start", { signup_method: method, signup_source: source });
}
