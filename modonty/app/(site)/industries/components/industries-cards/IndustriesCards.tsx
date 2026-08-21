import { IndustryCards } from "@/components/shared/industry-cards/IndustryCards";
import type { IndustryListItem } from "@/lib/types";

interface IndustriesCardsProps {
  industries: IndustryListItem[];
  /** "" on the base `/industries` page — highlights «الكل». */
  currentSlug: string;
}

/**
 * This page's configuration of the shared field cards: here a card NAVIGATES to the
 * field's own page. `/clients` renders the same component with a filter href instead
 * (Khalid, 21 Aug: «use the same component»).
 */
export function IndustriesCards({ industries, currentSlug }: IndustriesCardsProps) {
  return (
    <IndustryCards
      ariaLabel="تصفّح المجالات"
      items={industries.map((industry) => ({
        name: industry.name,
        slug: industry.slug,
        count: industry.clientCount,
        image: industry.socialImage,
        imageAlt: industry.socialImageAlt,
      }))}
      currentSlug={currentSlug}
      allHref="/industries"
      buildHref={(slug) => `/industries/${encodeURIComponent(slug)}`}
    />
  );
}
