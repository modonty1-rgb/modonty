import { cn } from "@/lib/utils";
import { ClientsCard } from "@/app/(homepage)/components/clients-card/ClientsCard";
import { CommerceActions } from "@/app/(homepage)/components/commerce-actions/CommerceActions";
import { IndustriesCard } from "@/app/(homepage)/components/industries-card/IndustriesCard";
import { StickyRail } from "@/app/(homepage)/components/shared/StickyRail";

interface RightSidebarProps {
  className?: string;
  industries: Array<{ id: string; name: string; slug: string; clientCount: number; socialImage?: string | null; description?: string | null }>;
}

// In RTL this is the visually left-hand, far rail (from 1240px): «verified partners and
// their fields» — the trust strip, discovery by industry in two columns so every name
// reads whole, then the reels. No inner scrollbar: a rail taller than the viewport is
// revealed by scrolling the page and then sticks at its bottom (see StickyRail).
export function RightSidebar({ industries, className }: RightSidebarProps) {
  return (
    <StickyRail
      label="الشركاء والمجالات"
      className={cn("hidden w-[300px] shrink-0 self-start min-[1240px]:sticky min-[1240px]:block", className)}
    >
      <div className="space-y-4">
        {/* Trust strip sits right above discovery: no partner is listed before their official
            papers are verified — a business-model promise, so it stays in the visitor's eye. */}
        <ClientsCard />
        {/* Booking/shop above discovery (Khalid, 2026-08-15): the partner-facing promise
            (we bring you bookings and sales) sits with the partner-facing rail. */}
        <CommerceActions />
        <IndustriesCard industries={industries} layout="rail" />
      </div>
    </StickyRail>
  );
}
