import { getCategoriesWithCounts, getCategoryAnalytics, getOverallCategoryAnalytics } from "@/app/api/helpers/category-queries";
import type { CategoryAnalytics } from "@/lib/types";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { isMobileRequest } from "../is-mobile-request";
import { AnalyticsCard } from "./AnalyticsCard";
import { CategoriesCard } from "./CategoriesCard";

interface LeftSidebarProps {
  currentCategorySlug?: string;
  className?: string;
}

export async function LeftSidebar({ currentCategorySlug, className }: LeftSidebarProps) {
  if (await isMobileRequest()) {
    return null;
  }

  const categories = await getCategoriesWithCounts();

  let stats: CategoryAnalytics = {
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
  if (currentCategorySlug) {
    const category = await db.category.findUnique({
      where: { slug: currentCategorySlug },
      select: { id: true },
    });
    if (category) {
      stats = await getCategoryAnalytics(category.id);
    }
  } else {
    stats = await getOverallCategoryAnalytics();
  }

  const totalArticlesAll = categories.reduce((sum, c) => sum + c.articleCount, 0);

  return (
    <aside
      className={cn(
        "hidden lg:block w-[240px] sticky top-[3.5rem] self-start h-[calc(100vh-4rem)]",
        className
      )}
    >
      <div className="flex h-full flex-col space-y-4">
        <AnalyticsCard stats={stats} />
        <CategoriesCard
          categories={categories}
          currentCategorySlug={currentCategorySlug}
          totalArticlesAll={totalArticlesAll}
        />
      </div>
    </aside>
  );
}
