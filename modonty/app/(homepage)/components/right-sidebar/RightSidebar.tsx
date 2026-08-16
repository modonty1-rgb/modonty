import { cn } from "@/lib/utils";
import { LinkCard } from "@/components/shared/link-card/LinkCard";
import { AboutCard } from "@/app/(homepage)/components/about-card/AboutCard";
import { StickyRail } from "@/app/(homepage)/components/shared/StickyRail";
import { IconCompass, IconPlay, IconVolume2 } from "@/lib/icons";

interface RightSidebarProps {
  className?: string;
}

// Rendered FIRST in the row, so in RTL it is the visually RIGHT rail (from 1240px; swapped 2026-08-16): «verified partners and
// their fields» as the «مدونتي» intro card then three link cards (المجالات · الطلّات · استمع); the trust card sits in the account
// rail (Khalid, 2026-08-16). ClientsCard and
// the IndustriesCard rail are hidden, not deleted (Khalid, 2026-08-16: same treatment as
// ModontyCard) — components and data stay for a possible comeback.
// Booking/shop moved to the account rail. No inner scrollbar: a rail taller than the
// viewport is revealed by scrolling the page and then sticks at its bottom (StickyRail).
export function RightSidebar({ className }: RightSidebarProps) {
  return (
    <StickyRail
      label="الشركاء والمجالات"
      className={cn("hidden w-[300px] shrink-0 self-start min-[1240px]:sticky min-[1240px]:block", className)}
    >
      <div className="space-y-4">
        {/* Same skeleton and height as the account card across the page (Khalid, 2026-08-16). */}
        <AboutCard />
        <LinkCard href="/industries" title="استكشف المجالات" description="اختر المجال الأقرب لاحتياجك" icon={IconCompass} />
        <LinkCard href="/reels" title="الطلّات" description="مقاطع قصيرة من الشركاء" icon={IconPlay} />
        <LinkCard href="/audio" title="استمع" description="المقالات صوتاً وأنت ماشي" icon={IconVolume2} />
      </div>
    </StickyRail>
  );
}
