import Link from "next/link";

import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { ModontyIndustriesMark } from "@/components/icons/modonty-industries-mark";
import { cn } from "@/lib/utils";

import { formatClientsCount } from "@/lib/format-counts";
import { toneForSlug } from "@/lib/industry-tones";

export interface IndustryTileItem {
  name: string;
  slug: string;
  /** Partners serving this field — what the visitor here is ultimately after. */
  count: number;
  image?: string | null;
  imageAlt?: string | null;
}

interface IndustryTileProps {
  item: IndustryTileItem;
  isActive: boolean;
  /** Where the tile leads — the lit tile's link is the way back. */
  href: string;
  /** Compact density for narrow desktop rails; the mobile grid keeps the standard size. */
  variant?: "default" | "compact";
}

/**
 * ONE field tile — the standard card for choosing a field anywhere on the site: the
 * field's square artwork (its real artwork when it has some), the name, the partner count.
 * Extracted from `IndustryGrid` when `/clients` asked for the same card in its swipe
 * strip (Khalid, 23 Aug: «use standard card in the industry page») — the grid and the
 * strip now differ only in how they lay the tiles out.
 *
 * A real field image gets the visual priority in a square frame; a field WITHOUT one gets the solid tone
 * with the mark in the tone's own foreground — measured live on 390 (22 Aug): every
 * field carried the platform's default logo, so the row showed the brand over and over and
 * said nothing about any field. The colour is what tells the tiles apart, and it is the
 * same colour the field wears everywhere else (`toneForSlug`).
 */
export function IndustryTile({ item, isActive, href, variant = "default" }: IndustryTileProps) {
  // Keyed by slug, not by position: the colour a field wears here is the one its
  // partners' cards wear, and it survives a new field joining.
  const tone = toneForSlug(item.slug);

  return (
    <Link
      href={href}
      aria-current={isActive ? "true" : undefined}
      aria-label={`${item.name}، ${formatClientsCount(item.count)}`}
      className={cn(
        "h-fit self-start flex flex-col gap-1.5 rounded-xl p-1.5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98]",
        variant === "compact" ? "min-h-[112px]" : "min-h-0 min-[1240px]:min-h-[128px]",
        isActive ? cn("ring-2", tone.ring, tone.stripBg) : "ring-1 ring-border bg-card sm:hover:bg-muted/50"
      )}
    >
      <span
        className={cn(
          "relative grid aspect-square shrink-0 place-items-center overflow-hidden rounded-lg",
          variant === "compact" ? "mx-auto size-16" : "w-full",
          item.image ? "bg-muted" : tone.chip
        )}
      >
        {item.image ? (
          <OptimizedImage
            media={asMedia(item.image, item.imageAlt ?? item.name)}
            alt=""
            fill
            sizes="(min-width: 1240px) 132px, 24vw"
            className="object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <ModontyIndustriesMark className="size-7" aria-hidden />
        )}
      </span>

      <span
        className={cn(
          "flex min-h-0 items-end justify-center gap-1 leading-[1.3] text-foreground min-[1240px]:min-h-[2.6em]",
          variant === "compact" ? "min-[1240px]:text-[10px]" : "min-[1240px]:text-[11px]"
        )}
      >
        <span className="truncate whitespace-nowrap text-[clamp(0.5625rem,2.4vw,0.75rem)] font-bold min-[1240px]:line-clamp-2 min-[1240px]:whitespace-normal min-[1240px]:[font-size:inherit]">
          {item.name}
        </span>
        <span className="mb-px hidden shrink-0 items-center rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-muted-foreground min-[1240px]:inline-flex">
          {item.count.toLocaleString("ar-SA")}
        </span>
      </span>
    </Link>
  );
}
