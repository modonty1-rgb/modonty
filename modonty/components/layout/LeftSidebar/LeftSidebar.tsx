import { getCategoriesWithCounts, getCategoryAnalytics, getOverallCategoryAnalytics, getCategoryIdBySlug } from "@/app/api/helpers/category-queries";
import { getIndustriesWithCounts } from "@/app/api/helpers/industry-queries";
import { getTagsWithCounts } from "@/app/api/helpers/tag-queries";
import type { CategoryAnalytics } from "@/lib/types";
import { cn } from "@/lib/utils";
import { isMobileRequest } from "../is-mobile-request";
import { AnalyticsCard } from "./AnalyticsCard";
import { DiscoveryCard } from "./DiscoveryCard";

interface LeftSidebarProps {
  currentCategorySlug?: string;
  className?: string;
}

export async function LeftSidebar({ currentCategorySlug, className }: LeftSidebarProps) {
  if (await isMobileRequest()) {
    return null;
  }

  const defaultStats: CategoryAnalytics = {
    totalBlogs: 0,
    totalReactions: 0,
    averageEngagement: 0,
    totalLikes: 0,
    totalComments: 0,
    totalDislikes: 0,
    totalFavorites: 0,
    totalViews: 0,
    averageCommentsPerBlog: 0,
    engagedBlogs: 0,
  };

  const [categories, industries, tags, stats] = await Promise.all([
    getCategoriesWithCounts(),
    getIndustriesWithCounts(),
    getTagsWithCounts(),
    (async (): Promise<CategoryAnalytics> => {
      if (currentCategorySlug) {
        const categoryId = await getCategoryIdBySlug(currentCategorySlug);
        if (categoryId) return getCategoryAnalytics(categoryId);
        return defaultStats;
      }
      return getOverallCategoryAnalytics();
    })(),
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
          currentCategorySlug={currentCategorySlug}
          totalArticlesAll={totalArticlesAll}
          industries={industries}
          tags={tags}
        />
      </div>
    </aside>
  );
}
