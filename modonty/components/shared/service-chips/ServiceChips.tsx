import { cn } from "@/lib/utils";
import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

interface ServiceChipsProps {
  /** What the partner does, in his own words. */
  services: string[];
  /** Shown when he listed no services — his field is then the only honest answer. */
  fallback?: string | null;
  /** How many chips to draw before collapsing the rest into «+N». */
  max?: number;
  className?: string;
}

/**
 * The visitor's first question — «يخدم حاجتي؟» — answered before anything else on the
 * card. Services come from the partner's own list; when he has none we fall back to his
 * field, which is a category rather than an offer but still beats a blank row
 * (measured 2026-08-16: 7 partners of 30 have services).
 */
export function ServiceChips({ services, fallback, max = 3, className }: ServiceChipsProps) {
  const chips = services.length ? services.slice(0, max) : fallback ? [fallback] : [];
  if (chips.length === 0) return null;

  const hidden = services.length > max ? services.length - max : 0;

  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {chips.map((chip) => (
        <li key={chip} className="rounded-full bg-primary/[.07] px-2.5 py-1 text-xs font-medium text-link">
          {chip}
        </li>
      ))}
      {hidden > 0 && (
        <li className="rounded-full px-2.5 py-1 text-xs text-muted-foreground">+{hidden.toLocaleString(SITE_LOCALE)}</li>
      )}
    </ul>
  );
}
