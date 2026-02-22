"use client";

import Link from "@/components/link";
import { trackCtaClick } from "@/lib/cta-tracking";
import type { CTAType } from "@/lib/cta-tracking";

interface CtaTrackedLinkProps {
  href: string;
  label: string;
  type: CTAType;
  articleId?: string;
  clientId?: string;
  className?: string;
  children: React.ReactNode;
}

export function CtaTrackedLink({
  href,
  label,
  type,
  articleId,
  clientId,
  className,
  children,
}: CtaTrackedLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        trackCtaClick({ type, label, targetUrl: href, articleId, clientId });
      }}
    >
      {children}
    </Link>
  );
}
