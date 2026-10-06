import { SiteLink } from "../../../parts/site-link";
import type { FooterLink } from "../footer-data";

/** A titled column of links — 14px medium heading, 14px muted links 12px apart (template-library convention). */
/**
 * `limit` caps long lists (the services column). The pages column is passed whole: it was cut at 6
 * too, and with 8 pages «الأسئلة الشائعة» and «تواصل معنا» — always last — fell off (4 Oct 2026).
 */
export function LinkColumn({ title, links, limit }: { title: string; links: FooterLink[]; limit?: number }) {
  if (links.length === 0) return null;
  return (
    <div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
        {(limit ? links.slice(0, limit) : links).map((l) => (
          <li key={l.href + l.label}>
            {/* On a phone the row becomes the target, not the word: `flex` + `min-h-11` gives a
                44px tap area across the column instead of a 41×19 sliver. Desktop keeps the
                inline anchor exactly as it was. */}
            <SiteLink href={l.href} className="transition-colors hover:text-foreground max-md:flex max-md:min-h-11 max-md:items-center">
              {l.label}
            </SiteLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
