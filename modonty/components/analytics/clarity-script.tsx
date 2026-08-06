import "server-only";
import Script from "next/script";

/**
 * Microsoft Clarity — session replay + heatmaps for modonty.com visitors.
 *
 * `afterInteractive` is the strategy Next.js documents for analytics: it runs after
 * hydration starts, so it never touches the critical path or LCP. `lazyOnload` waits for
 * browser idle and would miss the visitor's first clicks — a session replay that starts
 * late is a broken recording, and performance is unaffected either way.
 *
 * Production only: local sessions stay out of the dashboard, and dev pays no script cost.
 * Project id comes from `NEXT_PUBLIC_CLARITY_PROJECT_ID`, which maps to the official tag
 * `https://www.clarity.ms/tag/<projectId>`.
 */
export function ClarityScript() {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  if (!projectId || process.env.NODE_ENV !== "production") return null;

  return (
    <Script
      id="ms-clarity"
      src={`https://www.clarity.ms/tag/${projectId}`}
      strategy="afterInteractive"
    />
  );
}
