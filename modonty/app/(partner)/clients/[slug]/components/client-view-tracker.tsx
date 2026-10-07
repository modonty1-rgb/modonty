"use client";

import { useEffect } from "react";

import { claritySet } from "@/lib/analytics/clarity";
import { postClientView } from "../helpers/post-client-view";

interface ClientViewTrackerProps {
  clientSlug: string;
}

export function ClientViewTracker({ clientSlug }: ClientViewTrackerProps) {
  useEffect(() => {
    // Clarity tag (plan ج٦) on every visit, not only on a counted view.
    claritySet("client", clientSlug);
    postClientView(clientSlug);
  }, [clientSlug]);

  return null;
}
