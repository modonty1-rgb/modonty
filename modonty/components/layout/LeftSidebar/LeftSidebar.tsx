import { getCategoriesWithCounts, getOverallCategoryAnalytics } from "@/app/api/helpers/category-queries";
import { getIndustriesWithCounts } from "@/app/api/helpers/industry-queries";
import { getTagsWithCounts } from "@/app/api/helpers/tag-queries";
import { cn } from "@/lib/utils";
import { AnalyticsCard } from "./AnalyticsCard";
import { DiscoveryCard } from "./DiscoveryCard";

interface LeftSidebarProps {
  className?: string;
}

export async function LeftSidebar({ className }: LeftSidebarProps) {
  const [categories, industries, tags, stats] = await Promise.all([
    getCategoriesWithCounts(),
    getIndustriesWithCounts(),
    getTagsWithCounts(),
    getOverallCategoryAnalytics(),
  ]);

  const totalArticlesAll = categories.reduce((sum, c) => sum + c.articleCount, 0);

  return (
    <aside
      aria-label="الشريط الجانبي الأيسر"
      className={cn(
        "hidden lg:block w-[300px] sticky top-[3.5rem] self-start h-[calc(100dvh-5rem)] overflow-hidden",
        className
      )}
    >
      <div className="flex flex-col gap-4">
        <AnalyticsCard stats={stats} />
        <DiscoveryCard
          categories={categories}
          totalArticlesAll={totalArticlesAll}
          industries={industries}
          tags={tags}
        />
      </div>
    </aside>
  );
}
