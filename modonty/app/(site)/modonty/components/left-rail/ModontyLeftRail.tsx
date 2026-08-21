import { Suspense } from "react";
import { AccentHeading } from "@/components/shared/accent-heading/AccentHeading";
import { ModontyGallery, ModontyGallerySkeleton } from "@/app/(site)/modonty/components/gallery/ModontyGallery";
import { ReelsCard } from "@/components/shared/reels-card/ReelsCard";
import type { ReelItem } from "@/components/shared/reels-card/ReelsCard";
import { messages } from "@/lib/i18n/messages";
import type { ModontyGalleryImage } from "@/app/(site)/modonty/data/get-modonty-gallery";

interface ModontyLeftRailProps {
  gallery: ModontyGalleryImage[];
  /** modonty's own published reels — the card hides itself when there are none. */
  reels: ReelItem[];
}

/**
 * modonty's own reels first (Khalid, 2026-08-17: «كرت الريلز ارفعه فوق الصور بدل آراء
 * الشركاء» — the testimonials card went; partner reviews return as the trust system in
 * `documents/idea/trust-reviews-idea.html`), then the pinboard of our article covers.
 * Same `ReelsCard` as the homepage; the `/reels` page itself is still to be built (83d).
 * The board draws its eight prints per request, so it streams inside its own `<Suspense>`
 * and the rest of the rail stays in the static shell. About modonty itself → right rail.
 */
export function ModontyLeftRail({ gallery, reels }: ModontyLeftRailProps) {
  return (
    <div className="space-y-2">
      <AccentHeading size="eyebrow" className="mb-3">
        {messages.modonty.leftRailLabel}
      </AccentHeading>
      <ReelsCard items={reels} layout="sidebar" />
      {/* The pinboard is a desktop-rail piece only (Khalid, 21 Aug: «no need in mobile») —
          in the stacked phone view it added a screen of covers between the visitor and the
          end of the page. Hidden, not deleted: ≥1240px the rail shows it as before. */}
      <div className="hidden min-[1240px]:block">
        <Suspense fallback={<ModontyGallerySkeleton />}>
          <ModontyGallery pool={gallery} />
        </Suspense>
      </div>
    </div>
  );
}
