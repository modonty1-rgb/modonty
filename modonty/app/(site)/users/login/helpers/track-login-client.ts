// login_start (Google/email button on /users/login) — pushed to GTM from the browser. Until
// Oct 2026 it went through a server route on Measurement Protocol, and each one became a
// phantom GA4 session (see lib/analytics/ga4-browser.ts).

import { pushGa4Event } from "@/lib/analytics/ga4-browser";

type LoginMethod = "google" | "email";

export function trackLoginClient(method: LoginMethod): void {
  pushGa4Event("login_start", { login_method: method });
}
