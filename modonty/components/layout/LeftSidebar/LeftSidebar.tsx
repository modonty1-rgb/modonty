import { ModoPrompt } from "@/components/feed/ModoPrompt";
import { HomeUserProfileCard } from "@/components/feed/HomeUserProfileCard";
import { ReelsPreviewCard } from "@/components/feed/ReelsPreviewCard";
import { cn } from "@/lib/utils";
import type { ReelPreviewItem } from "@/components/feed/ReelsPreviewCard";

interface LeftSidebarProps {
  className?: string;
  reels: ReelPreviewItem[];
}

// In RTL this is the visually right-hand rail. Discovery belongs to the main rail.
export function LeftSidebar({ className, reels }: LeftSidebarProps) {
  return (
    <aside
      aria-label="مساعدة Modo"
      className={cn("hidden w-[300px] shrink-0 self-start lg:sticky lg:top-20 lg:block", className)}
    >
      <div className="space-y-4">
        <HomeUserProfileCard />
        <ModoPrompt />
        <ReelsPreviewCard items={reels} layout="sidebar" />
      </div>
    </aside>
  );
}
