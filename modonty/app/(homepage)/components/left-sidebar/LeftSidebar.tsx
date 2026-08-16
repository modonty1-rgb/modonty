import { Suspense } from "react";
import type { ReactNode } from "react";
import { CommerceActions } from "@/app/(homepage)/components/commerce-actions/CommerceActions";
import { LinkCard } from "@/components/shared/link-card/LinkCard";
import { ModontyTrustMark } from "@/components/icons/modonty-trust-mark";
import { StickyRail } from "@/app/(homepage)/components/shared/StickyRail";
import { cn } from "@/lib/utils";
import type { FeedPost } from "@/lib/types";

interface LeftSidebarProps {
  className?: string;
  /** Kept for the hidden ModontyCard (Khalid, 2026-08-16: hide, not delete). */
  articles: FeedPost[];
  brandLogoUrl: string | null;
  /** The session card, created outside the cached page and passed through untouched. */
  userCard: ReactNode;
}

// In RTL this is the visually right-hand rail — the first one the eye lands on. It holds
// «you and us»: the visitor's account, then booking / shop / modonty as link cards (LinkedIn keeps the
// profile card in the first rail too). Discovery lives in the far rail (Khalid, 2026-08-15).
export function LeftSidebar({ className, userCard }: LeftSidebarProps) {
  return (
    <StickyRail
      label="حسابك ومدونتي"
      className={cn("hidden w-[300px] shrink-0 self-start lg:sticky lg:block", className)}
    >
      <div className="space-y-4">
        {/* Reads the session, so it streams in. Fallback matches its height so the
            rail does not jump when the card lands. */}
        <Suspense fallback={<div className="h-[190px] rounded-lg bg-card ring-1 ring-primary/20 skeleton-shimmer" aria-hidden />}>
          {userCard}
        </Suspense>
        {/* Trust strip right under the account (Khalid, 2026-08-16); the full ClientsCard is hidden,
            not deleted. */}
        <LinkCard
          href="/trust"
          title="شركاء موثوقون"
          description="كل شريك مفحوص بأوراقه الرسمية"
          icon={ModontyTrustMark}
        />
        {/* Booking/shop right under the trust strip: the visitor's own actions, one rail
            (Khalid, 2026-08-16 — moved here from the partners rail). */}
        <CommerceActions />
      </div>
    </StickyRail>
  );
}
