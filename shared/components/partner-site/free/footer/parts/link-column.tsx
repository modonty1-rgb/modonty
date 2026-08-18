import type { FooterLink } from "../footer-data";

/** A titled column of links — 14px medium heading, 14px muted links 12px apart (template-library convention). */
export function LinkColumn({ title, links }: { title: string; links: FooterLink[] }) {
  if (links.length === 0) return null;
  return (
    <div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
        {links.slice(0, 6).map((l) => (
          <li key={l.href + l.label}>
            <a href={l.href} className="transition-colors hover:text-foreground">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
