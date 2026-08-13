import { cn } from "@/lib/utils";
import { ModontyPublisherCard } from "./ModontyPublisherCard";
import { ClientServiceCards } from "@/components/feed/ClientServiceCards";
import { ClientTrustCard } from "@/components/feed/ClientTrustCard";
import type { FeedPost } from "@/lib/types";

interface RightSidebarProps {
  className?: string;
  articles: FeedPost[];
  brandLogoUrl: string | null;
  clientServices: Array<{ id: string; label: string; visual: "booking" | "shop" }>;
}

// Partners list — server-rendered directly (the slider moved to the left sidebar).
// `hidden xl:block` keeps the article rail readable on narrower desktops; the mobile
// partner list lives in the bottom-bar sheet instead.
export function RightSidebar({ articles, brandLogoUrl, clientServices, className }: RightSidebarProps) {
  // Load ALL active partners (safety cap 500) so the industry filter shows EVERY
  // sector that has partners — not only the industries present in the first 20.
  return (
    <aside
      aria-label="الشريط الجانبي الأيمن"
      className={cn(
        "hidden h-[calc(100dvh-5rem)] w-[300px] self-start overflow-visible xl:sticky xl:top-20 xl:block",
        className
      )}
    >
      <div className="space-y-4">
        <ModontyPublisherCard articles={articles} brandLogoUrl={brandLogoUrl} />
        <ClientServiceCards services={clientServices} />
        <ClientTrustCard />
      </div>
    </aside>
  );
}
