"use client";

import Link from "next/link";
import { useState, type ComponentProps } from "react";

/**
 * `<Link>` that prefetches on intent — a finger, pointer or keyboard reaching the link — instead
 * of the moment it scrolls into view (Khalid, 3 Oct 2026, Techne day 1).
 *
 * Measured on www.modonty.com that day: a phone opening `/` fired 21 background prefetches (the
 * seven bottom-menu routes, each twice, plus every visible article card), `/modonty` 37. Chrome's
 * field data for phones put LCP at 4.9 s p75. On a weak exhibition network those prefetches
 * compete with the page the visitor actually asked for. The server was not the bottleneck: zero
 * 5xx in 18,723 requests, Egypt median 28–43 ms.
 *
 * The pattern is the one Next.js documents for this exact case
 * (node_modules/next/dist/docs/01-app/02-guides/prefetching.md — «Hover-triggered prefetch»):
 * `prefetch={false}` until intent, then `null` restores the default prefetch. `onTouchStart` is
 * added for phones, where there is no hover. A caller that passes `prefetch` explicitly keeps it.
 */
export function IntentLink({ prefetch, onMouseEnter, onTouchStart, onFocus, ...rest }: ComponentProps<typeof Link>) {
  const [intent, setIntent] = useState(false);

  return (
    <Link
      {...rest}
      prefetch={prefetch !== undefined ? prefetch : intent ? null : false}
      onMouseEnter={(e) => {
        setIntent(true);
        onMouseEnter?.(e);
      }}
      onTouchStart={(e) => {
        setIntent(true);
        onTouchStart?.(e);
      }}
      onFocus={(e) => {
        setIntent(true);
        onFocus?.(e);
      }}
    />
  );
}
