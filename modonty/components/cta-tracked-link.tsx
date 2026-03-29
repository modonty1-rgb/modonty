"use client";

import Link from "@/components/link";
import { trackCtaClick } from "@/lib/cta-tracking";
import type { CTAType } from "@/lib/cta-tracking";

interface CtaTrackedLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  label: string;
  type: CTAType;
  articleId?: string;
  clientId?: string;
  children: React.ReactNode;
}

export function CtaTrackedLink({
  href,
  label,
  type,
  articleId,
  clientId,
  className,
  target,
  rel,
  children,
  ...rest
}: CtaTrackedLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      target={target}
      rel={rel}
      onClick={(e) => {
        trackCtaClick({ type, label, targetUrl: href, articleId, clientId });
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
