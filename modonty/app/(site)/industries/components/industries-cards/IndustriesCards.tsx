import { IndustryGrid } from "@/components/shared/industry-grid/IndustryGrid";
import { industryArtwork } from "@/lib/industry-artwork";
import type { IndustryListItem } from "@/lib/types";

interface IndustriesCardsProps {
  industries: IndustryListItem[];
  /** "" on the base `/industries` page — no tile lit. */
  currentSlug: string;
}

/**
 * This page's configuration of the field GRID: a tile NAVIGATES to the field's own page,
 * and the lit tile leads back to the base page. It rendered the shared horizontal strip
 * until 23 Aug, when Khalid moved the `/articles` grid treatment here («what we did in the
 * article, we make it there») — every sector visible at once, no swipe.
 */
export function IndustriesCards({ industries, currentSlug }: IndustriesCardsProps) {
  return (
    <IndustryGrid
      ariaLabel="تصفّح المجالات"
      items={industries.map((industry) => ({
        name: industry.name,
        slug: industry.slug,
        count: industry.clientCount,
        image: industryArtwork(industry.socialImage),
        imageAlt: industry.socialImageAlt,
      }))}
      currentSlug={currentSlug}
      clearHref="/industries"
      buildHref={(slug) => `/industries/${encodeURIComponent(slug)}`}
    />
  );
}
