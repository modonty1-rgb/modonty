import { Suspense } from "react";
import { AskModo } from "@/app/(homepage)/components/ask-modo/AskModo";
import { UserCard } from "@/app/(homepage)/components/user-card/UserCard";
import { ReelsCard } from "@/app/(homepage)/components/reels-card/ReelsCard";
import { cn } from "@/lib/utils";
import type { ReelItem } from "@/app/(homepage)/components/reels-card/ReelsCard";

interface LeftSidebarProps {
  className?: string;
  reels: ReelItem[];
}

// In RTL this is the visually right-hand rail. Discovery belongs to the main rail.
export function LeftSidebar({ className, reels }: LeftSidebarProps) {
  return (
    <aside
      aria-label="مساعدة Modo"
      className={cn("hidden w-[300px] shrink-0 self-start lg:sticky lg:top-20 lg:block", className)}
    >
      <div className="space-y-4">
        {/* Reads the session, so it streams in. Fallback matches its height so the
            rail does not jump when the card lands. */}
        <Suspense fallback={<div className="h-[220px] rounded-[1.35rem] border border-primary/20 bg-card skeleton-shimmer" aria-hidden />}>
          <UserCard />
        </Suspense>
        <AskModo />
        <ReelsCard items={reels} layout="sidebar" />
      </div>
    </aside>
  );
}
