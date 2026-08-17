import { ModontyFeaturedMark } from "@/components/icons/modonty-featured-mark";
import { cn } from "@/lib/utils";
import { messages } from "@/lib/i18n/messages";

interface FeaturedBadgeProps {
  /**
   * `medal` — the mark alone at 48px, its readable size (measured 2026-08-16: below ~40px
   * the star and the M merge into one blob). `full` — a small mark plus the words, for
   * text rows where the words carry the meaning and the mark only decorates.
   */
  variant?: "medal" | "full";
  className?: string;
}

/**
 * «شريك مميّز» — the admin's `isFeatured` toggle. One component so the badge reads
 * identically on the directory card, the partner page and search results.
 *
 * The medal alone is enough beside a name (its meaning is spelled out for screen readers);
 * the `full` variant adds the words where there is room and no other context.
 */
export function FeaturedBadge({ variant = "full", className }: FeaturedBadgeProps) {
  if (variant === "medal") {
    return (
      <span className={cn("inline-flex shrink-0 drop-shadow-sm", className)} title={messages.shared.badges.featuredPartnerLabel}>
        <ModontyFeaturedMark className="size-12" />
        <span className="sr-only">{messages.shared.badges.featuredPartnerLabel}</span>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1 font-medium text-link-accent", className)}>
      <ModontyFeaturedMark className="h-3.5 w-3.5" />
      {messages.shared.badges.featuredPartnerLabel}
    </span>
  );
}
