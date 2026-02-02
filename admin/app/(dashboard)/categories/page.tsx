import { getCategories, getCategoriesStats, CategoryFilters } from "./actions/categories-actions";
import { CategoriesStats } from "./components/categories-stats";
import { CategoriesFilters } from "./components/categories-filters";
import { CategoriesPageClient } from "./components/categories-page-client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{
    hasArticles?: string;
    createdFrom?: string;
    createdTo?: string;
    minArticleCount?: string;
    maxArticleCount?: string;
  }>;
}) {
  const params = await searchParams;
  const filters: CategoryFilters = {
    hasArticles:
      params.hasArticles === "yes"
        ? true
        : params.hasArticles === "no"
          ? false
          : undefined,
    createdFrom: params.createdFrom ? new Date(params.createdFrom) : undefined,
    createdTo: params.createdTo ? new Date(params.createdTo) : undefined,
    minArticleCount: params.minArticleCount ? parseInt(params.minArticleCount) : undefined,
    maxArticleCount: params.maxArticleCount ? parseInt(params.maxArticleCount) : undefined,
  };

  const [categories, stats] = await Promise.all([getCategories(filters), getCategoriesStats()]);

  const getDescription = () => {
    if (filters.hasArticles === true) return "Viewing categories with articles";
    if (filters.hasArticles === false) return "Viewing categories without articles";
    if (filters.createdFrom || filters.createdTo) return "Viewing categories by date range";
    if (filters.minArticleCount !== undefined || filters.maxArticleCount !== undefined)
      return "Viewing categories by article count";
    return "Manage all categories in the system";
  };

  return (
    <div className="container mx-auto max-w-[1128px] space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">Categories</h1>
          <p className="text-muted-foreground mt-1">{getDescription()}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/categories/tree">
            <Button variant="outline" size="sm">
              Tree View
            </Button>
          </Link>
          <Link href="/categories/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Category
            </Button>
          </Link>
        </div>
      </div>
      <CategoriesStats stats={stats} />
      <CategoriesFilters />
      <CategoriesPageClient categories={categories} />
    </div>
  );
}
