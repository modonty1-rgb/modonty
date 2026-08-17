import { AccentHeading } from "@/components/shared/accent-heading/AccentHeading";
import { StoryCard } from "@/app/modonty/components/story-card/StoryCard";
import { LegalCard } from "@/app/modonty/components/legal-card/LegalCard";
import { TeamGalleryCard } from "@/app/modonty/components/team-gallery/TeamGalleryCard";
import { messages } from "@/lib/i18n/messages";
import type { LegalEntityDisplay } from "@/lib/seo/to-legal-entity-display";

interface ModontyRightRailProps {
  legal: LegalEntityDisplay;
  clientId: string;
  clientName: string;
  whatsappPhone: string | null;
}

/**
 * About modonty itself: the story, the papers (legal card — same Settings source as
 * `/trust`), the people behind it, then the one door out — «صِر شريكاً» (the same invite card the `/clients` rail uses; before it this page had zero
 * calls to action). Everything navigates — nothing opens in place (Khalid, 2026-08-17:
 * no drawer, no popover). Our work lives in the left rail.
 */
export function ModontyRightRail({ legal, clientId, clientName, whatsappPhone }: ModontyRightRailProps) {
  return (
    <div className="space-y-2">
      <AccentHeading size="eyebrow" className="mb-3">
        {messages.modonty.rightRailLabel}
      </AccentHeading>
      <StoryCard />
      <LegalCard legal={legal} clientId={clientId} clientName={clientName} whatsappPhone={whatsappPhone} />
      <TeamGalleryCard />
    </div>
  );
}
