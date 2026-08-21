import Link from "next/link";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { ModontyIndustriesMark } from "@/components/icons/modonty-industries-mark";
import { ModontyFeaturedMark } from "@/components/icons/modonty-featured-mark";
import { cn } from "@/lib/utils";
import { formatArticlesCount, formatClientsCount } from "@/app/(site)/industries/helpers/format-counts";
import { toneForSlug } from "@/app/(site)/industries/helpers/industry-tones";

export interface IndustryCardItem {
  name: string;
  slug: string;
  /** What the card counts — partners on `/clients`, articles on `/articles`. */
  count: number;
  image?: string | null;
  imageAlt?: string | null;
}

/** What the number under a field's name refers to on the calling page. */
export type IndustryCardCountKind = "partners" | "articles";

export interface FeaturedFilterCard {
  href: string;
  count: number;
  isActive: boolean;
}

interface IndustryCardsProps {
  items: IndustryCardItem[];
  /** "" highlights «الكل». */
  currentSlug: string;
  /** Where a field card leads — a route on `/industries`, a filtered URL on `/clients`. */
  buildHref: (slug: string) => string;
  /** Where «الكل» leads. */
  allHref: string;
  ariaLabel: string;
  /** Partners by default; `/articles` counts articles instead. */
  countKind?: IndustryCardCountKind;
  /**
   * `/clients` only: the «المميّزون» card, sitting with the other filters rather than in
   * the bottom bar (Khalid, 21 Aug — a filter belongs among filters, and «الكل» is how
   * the visitor comes back).
   */
  featured?: FeaturedFilterCard;
}

/**
 * The fields as VISUAL cards — Baymard: an intermediary category shows every category
 * with a thumbnail (the image bridges the naming gap when the visitor's word for their
 * field differs from ours); NN/g: subcategories highlighted above the listings, with a
 * popularity marker.
 *
 * Shared by `/industries` (where a card NAVIGATES to the field's page) and `/clients`
 * (where the same card FILTERS the directory) — one component, one visual language, the
 * caller only decides where a card leads (Khalid, 21 Aug: «use the same component»).
 * Fixed height + a two-line name box + the count pinned to the bottom, so one-line and
 * two-line names still produce identical cards. Callers hide it ≥1240px, where the rails
 * take over.
 */
export function IndustryCards({ items, currentSlug, buildHref, allHref, ariaLabel, countKind = "partners", featured }: IndustryCardsProps) {
  const busiest = items.reduce((top, item) => (item.count > top.count ? item : top), items[0] ?? { slug: "", count: 0 });
  const total = items.reduce((sum, item) => sum + item.count, 0);
  const formatCount = countKind === "articles" ? formatArticlesCount : formatClientsCount;

  return (
    <nav aria-label={ariaLabel} className="-mx-3 sm:-mx-4">
      <ul className="flex snap-x snap-proximity gap-2.5 overflow-x-auto px-3 pb-2 scrollbar-none sm:px-4">
        <li className="snap-start">
          <Link
            href={allHref}
            aria-current={currentSlug === "" ? "page" : undefined}
            className={cn(
              "flex h-[136px] w-[104px] flex-col items-center justify-center gap-1.5 rounded-xl bg-primary text-primary-foreground shadow-sm transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              currentSlug === "" && "shadow-md ring-2 ring-primary ring-offset-2",
            )}
          >
            <ModontyIndustriesMark className="size-8" aria-hidden />
            <span className="text-sm font-bold">الكل</span>
            <span className="text-[10px] opacity-80">{formatCount(total)}</span>
          </Link>
        </li>
        {featured && featured.count > 0 && (
          <li className="snap-start">
            <Link
              href={featured.href}
              aria-current={featured.isActive ? "page" : undefined}
              className={cn(
                "flex h-[136px] w-[104px] flex-col items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 text-amber-950 shadow-sm transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                featured.isActive && "shadow-md ring-2 ring-amber-500 ring-offset-2",
              )}
            >
              <ModontyFeaturedMark className="size-9" aria-hidden />
              <span className="text-sm font-black">المميّزون</span>
              <span className="text-[10px] font-bold opacity-80">{formatCount(featured.count)}</span>
            </Link>
          </li>
        )}
        {items.map((item, index) => {
          // Keyed by slug, not by position: the colour a field wears here is the same one
          // its partners' cards wear, and it survives a new field joining the list.
          const tone = toneForSlug(item.slug);
          const isActive = item.slug === currentSlug;
          return (
            <li key={item.slug} className="snap-start">
              <Link
                href={buildHref(item.slug)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex h-[136px] w-[118px] flex-col overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isActive && cn("shadow-md ring-2", tone.ring),
                )}
              >
                <span className={cn("block h-1 shrink-0", tone.bar)} aria-hidden />
                {/* The image is shown WHOLE with room to breathe — cover-cropping squeezed it. */}
                <span className="relative mt-2 block h-16 shrink-0 px-2">
                  {item.image ? (
                    <OptimizedImage
                      media={asMedia(item.image, item.imageAlt ?? item.name)}
                      alt=""
                      fill
                      sizes="118px"
                      className="object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span className="absolute inset-0 grid place-items-center text-muted-foreground/40">
                      <ModontyIndustriesMark className="size-8" aria-hidden />
                    </span>
                  )}
                  {item.slug === busiest.slug && item.count > 0 && (
                    <span className="absolute top-1.5 start-1.5 rounded-full bg-action-save px-1.5 py-0.5 text-[9px] font-black text-action-save-foreground shadow-sm">
                      الأنشط
                    </span>
                  )}
                </span>
                <span className="block min-h-8 px-2 pt-1.5 text-xs font-bold leading-4">
                  <span className="line-clamp-2">{item.name}</span>
                </span>
                <span className={cn("mt-auto block px-2 pb-2 text-[10px] leading-none", isActive ? "font-bold text-foreground" : "text-muted-foreground")}>
                  {formatCount(item.count)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
