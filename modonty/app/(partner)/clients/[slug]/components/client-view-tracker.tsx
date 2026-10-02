"use client";

import { useEffect } from "react";

import { pushGa4Event } from "@/lib/analytics/ga4-browser";
import { claritySet } from "@/lib/analytics/clarity";

interface ClientViewTrackerProps {
  clientSlug: string;
}

export function ClientViewTracker({ clientSlug }: ClientViewTrackerProps) {
  useEffect(() => {
    // Clarity tag (plan ج٦) on every visit, not only on a counted view.
    claritySet("client", clientSlug);
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
  }, [clientSlug]);

  return null;
}
