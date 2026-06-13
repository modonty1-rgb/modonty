import { getCategoriesWithCounts } from "@/app/api/helpers/category-queries";
import { getIndustriesWithCounts } from "@/app/api/helpers/industry-queries";
import { getTagsWithCounts } from "@/app/api/helpers/tag-queries";
import { getClientHeroSlides } from "@/app/api/helpers/client-queries";
import { cn } from "@/lib/utils";
import { HeroSlider } from "@/components/layout/RightSidebar/HeroSlider";
import { DiscoveryCard } from "./DiscoveryCard";

interface LeftSidebarProps {
  className?: string;
}

export async function LeftSidebar({ className }: LeftSidebarProps) {
  const [categories, industries, tags, heroSlides] = await Promise.all([
    getCategoriesWithCounts(),
    getIndustriesWithCounts(),
    getTagsWithCounts(),
    getClientHeroSlides(),
  ]);

  const totalArticlesAll = categories.reduce((sum, c) => sum + c.articleCount, 0);

  return (
    <aside
      aria-label="الشريط الجانبي الأيسر"
      className={cn(
        "hidden lg:flex flex-col w-[300px] sticky top-[3.5rem] self-start h-[calc(100dvh-5rem)] overflow-hidden gap-4",
        className
      )}
    >
      {/* Partner showcase slider (pure-CSS, zero client JS) — server-rendered so it
          paints instantly on desktop; was previously gated behind the right-sidebar
          client mount, which delayed its appearance. */}
      <HeroSlider slides={heroSlides} />
      <DiscoveryCard
        categories={categories}
        totalArticlesAll={totalArticlesAll}
        industries={industries}
        tags={tags}
      />
    </aside>
  );
}
