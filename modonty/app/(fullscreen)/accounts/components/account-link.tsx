"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { trackCtaClick } from "@/lib/analytics/cta-tracking";

/**
 * One tracked link on /accounts. Every tap is a `cta_click` (GTM → GA4, and our own
 * `/api/track/cta-click` record) labelled `accounts:<id>` — so the report says WHICH
 * button a visitor chose, while the visit's SOURCE stays whatever UTM brought them here.
 *
 * No UTM is added to internal links: GA4 attributes the session at `session_start`, and a
 * campaign tag on an internal link starts a fake new campaign interaction.
 */
export function AccountLink({
  id,
  href,
  external = false,
  rel,
  className,
  children,
}: {
  id: string;
  href: string;
  external?: boolean;
  rel?: string;
  className: string;
  children: ReactNode;
}) {
  const track = () => trackCtaClick({ type: "LINK", label: `accounts:${id}`, targetUrl: href });

  if (!external) {
    return (
      <Link href={href} onClick={track} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel={rel ?? "noopener noreferrer"} onClick={track} className={className}>
      {children}
    </a>
  );
}
