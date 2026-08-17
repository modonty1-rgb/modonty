import { Suspense } from "react";
import type { ReactNode } from "react";
import { CommerceActions } from "@/components/shared/commerce-actions/CommerceActions";
import { StickyRail } from "@modonty/shared/components/sticky-rail/StickyRail";
import { PartnerInviteCard } from "@/components/shared/partner-invite-card/PartnerInviteCard";
import { cn } from "@/lib/utils";
import { messages } from "@/lib/i18n/messages";

interface LeftSidebarProps {
  /** The session card, created outside the cached page and passed through untouched. */
  userCard: ReactNode;
  className?: string;
}

// Rendered LAST in the row, so in RTL it is the visually LEFT rail — identical to the
// homepage account rail (account · احجز · تسوّق), plus the one card this page adds: the
// invitation to become a partner, which used to be a gradient banner under the list.
export function LeftSidebar({ userCard, className }: LeftSidebarProps) {
  return (
    <StickyRail
      label={messages.clients.sidebars.accountRailAriaLabel}
      className={cn("hidden w-[300px] shrink-0 self-start lg:sticky lg:block", className)}
    >
      <div className="space-y-4">
        {/* Reads the session, so it streams in. Fallback matches its height so the
            rail does not jump when the card lands. */}
        <Suspense fallback={<div className="h-[190px] rounded-lg bg-card ring-1 ring-primary/20 skeleton-shimmer" aria-hidden />}>
          {userCard}
        </Suspense>
        <CommerceActions />
        <PartnerInviteCard source="Clients Rail" />
      </div>
    </StickyRail>
  );
}
