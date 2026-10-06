import { SiteLink } from "../../../parts/site-link";
/**
 * «عرض الكل» under a home section that shows only part of a list. Services stopped at 6, reviews
 * at 3, the album at 5 and the questions at 6 with nothing to say more existed (4 Oct 2026) —
 * the rest were unreachable from the home page. Renders only when something is actually hidden
 * and there is a page to go to.
 */
export function ViewAllLink({ href, label, shown, total }: { href?: string; label: string; shown: number; total: number }) {
  if (!href || total <= shown) return null;
  return (
    <SiteLink
      href={href}
      className="mt-8 inline-flex min-h-11 items-center rounded-[var(--ps-radius-control,9999px)] border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
    >
      {label}
    </SiteLink>
  );
}
