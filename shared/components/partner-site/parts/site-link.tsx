import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";

type SiteLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href?: string };

/**
 * A link between the partner's own pages. They were plain <a> — every click reloaded the whole
 * document, platform bar and header included (4 Oct 2026). Internal paths now go through
 * `next/link` so only the page body changes; prefetch stays off until the visitor shows intent,
 * the same pattern modonty's own nav uses. Anything else (external · `#` in the console preview
 * · tel: · mailto:) stays a plain anchor.
 */
export function SiteLink({ href, children, ...rest }: SiteLinkProps) {
  if (!href || !href.startsWith("/")) return <a href={href} {...rest}>{children}</a>;
  return (
    <Link href={href} prefetch={false} {...rest}>
      {children}
    </Link>
  );
}
