import { IconFeatured } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { messages } from "@/lib/i18n/messages";
import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

interface RatingStarsProps {
  /** Average of APPROVED reviews only. */
  average: number;
  count: number;
  className?: string;
}

/**
 * «★ ٤٫٥ (١٢)» — one star and the number, not five drawn stars: at 12px the five-star row
 * is unreadable and doubles the DOM on a list of 30 cards. Nothing renders when there are
 * no reviews (the caller passes null), so a young partner shows no empty rating.
 */
export function RatingStars({ average, count, className }: RatingStarsProps) {
  return (
    <span className={cn("inline-flex items-center gap-1 font-medium text-foreground", className)}>
      <IconFeatured className="h-3.5 w-3.5 fill-current text-amber-500" aria-hidden />
      {average.toLocaleString(SITE_LOCALE, { maximumFractionDigits: 1 })}
      <span className="font-normal text-muted-foreground">({count.toLocaleString(SITE_LOCALE)})</span>
      <span className="sr-only">{messages.shared.badges.ratingScreenReaderLabel}</span>
    </span>
  );
}
