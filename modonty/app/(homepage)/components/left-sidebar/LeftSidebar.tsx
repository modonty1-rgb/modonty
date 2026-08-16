import { Suspense } from "react";
import type { ReactNode } from "react";
import { ModontyCard } from "@/app/(homepage)/components/modonty-card/ModontyCard";
import { StickyRail } from "@/app/(homepage)/components/shared/StickyRail";
import { cn } from "@/lib/utils";
import type { FeedPost } from "@/lib/types";

interface LeftSidebarProps {
  className?: string;
  articles: FeedPost[];
  brandLogoUrl: string | null;
  /** The session card, created outside the cached page and passed through untouched. */
  userCard: ReactNode;
}

// In RTL this is the visually right-hand rail — the first one the eye lands on. It holds
// «you and us»: the visitor's account, then modonty's own articles (LinkedIn keeps the
// profile card in the first rail too). Discovery lives in the far rail (Khalid, 2026-08-15).
export function LeftSidebar({ className, articles, brandLogoUrl, userCard }: LeftSidebarProps) {
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
        <ModontyCard articles={articles} brandLogoUrl={brandLogoUrl} />
      </div>
    </StickyRail>
  );
}
