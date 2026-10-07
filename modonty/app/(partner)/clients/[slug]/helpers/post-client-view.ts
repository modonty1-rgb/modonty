import { pushGa4Event } from "@/lib/analytics/ga4-browser";

/** Count this visit on the server, then mirror it to GA4 from the browser. */
export function postClientView(clientSlug: string) {
  const slug = encodeURIComponent(clientSlug);
  // document.referrer = the real external source; the fetch's Referer header is always this page.
  fetch(`/clients/${slug}/api/view`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ referrer: document.referrer || null }),
  })
    .then((res) => res.json())
    // Only a counted view carries `ga4` — a deduplicated one does not, so GA4 matches the DB.
    .then((data) => {
      if (data?.ga4) pushGa4Event("client_view", data.ga4);
    })
    .catch(() => {});
}
