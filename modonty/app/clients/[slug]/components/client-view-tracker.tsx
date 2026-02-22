"use client";

import { useEffect } from "react";

interface ClientViewTrackerProps {
  clientSlug: string;
}

export function ClientViewTracker({ clientSlug }: ClientViewTrackerProps) {
  useEffect(() => {
    const slug = encodeURIComponent(clientSlug);
    fetch(`/api/clients/${slug}/view`, { method: "POST" }).catch(() => {});
  }, [clientSlug]);

  return null;
}
