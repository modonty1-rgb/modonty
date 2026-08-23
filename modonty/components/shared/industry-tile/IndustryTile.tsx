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
}

/**
 * ONE field tile — the standard card for choosing a field anywhere on the site: the
 * field's tone circle (its real artwork when it has some), the name, the partner count.
 * Extracted from `IndustryGrid` when `/clients` asked for the same card in its swipe
 * strip (Khalid, 23 Aug: «use standard card in the industry page») — the grid and the
 * strip now differ only in how they lay the tiles out.
 *
 * A real field image sits on the field's soft tint; a field WITHOUT one gets the solid tone
 * circle with the mark in the tone's own foreground — measured live on 390 (22 Aug): every
 * field carried the platform's default logo, so the row showed the brand over and over and
 * said nothing about any field. The colour is what tells the tiles apart, and it is the
 * same colour the field wears everywhere else (`toneForSlug`).
 */
export function IndustryTile({ item, isActive, href }: IndustryTileProps) {
  // Keyed by slug, not by position: the colour a field wears here is the one its
  // partners' cards wear, and it survives a new field joining.
  const tone = toneForSlug(item.slug);

  return (
    <Link
      href={href}
      aria-current={isActive ? "true" : undefined}
      className={cn(
        "flex h-[108px] flex-col items-center gap-1.5 rounded-xl px-1 pb-1.5 pt-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98]",
        isActive ? cn("ring-2", tone.ring, tone.stripBg) : "ring-1 ring-border bg-card"
      )}
    >
      <span
        className={cn(
          "relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full",
          item.image ? tone.stripBg : tone.chip
        )}
      >
        {item.image ? (
          <OptimizedImage
            media={asMedia(item.image, item.imageAlt ?? item.name)}
            alt=""
            fill
            sizes="44px"
            className="object-contain p-1.5"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <ModontyIndustriesMark className="size-5" aria-hidden />
        )}
      </span>

      <span className="line-clamp-2 text-[11px] font-bold leading-[1.3] text-foreground">
        {item.name}
      </span>

      <span
        className={cn(
          "mt-auto text-[9px] leading-none",
          isActive ? "font-bold text-foreground" : "text-muted-foreground"
        )}
      >
        {formatClientsCount(item.count)}
      </span>
    </Link>
  );
}
