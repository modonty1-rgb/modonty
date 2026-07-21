"use client";

import { useEffect } from "react";

interface ClientViewTrackerProps {
  clientSlug: string;
}

export function ClientViewTracker({ clientSlug }: ClientViewTrackerProps) {
  useEffect(() => {
    const slug = encodeURIComponent(clientSlug);
    // document.referrer = the real external source; the fetch's Referer header is always this page.
    fetch(`/api/clients/${slug}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referrer: document.referrer || null }),
    }).catch(() => {});
  }, [clientSlug]);

  return null;
}
