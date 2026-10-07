/** The page-view beacon: fetch + keepalive, fire-and-forget — a failed beacon must never surface. */
export function sendPageView(path: string): void {
  fetch("/api/track/pageview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
    keepalive: true,
  }).catch(() => {});
}
