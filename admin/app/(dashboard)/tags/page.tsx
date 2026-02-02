import { getTags, getTagsStats, TagFilters } from "./actions/tags-actions";
import { TagsStats } from "./components/tags-stats";
import { TagsFilters } from "./components/tags-filters";
import { TagsPageClient } from "./components/tags-page-client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function TagsPage({
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
  const filters: TagFilters = {
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

  const [tags, stats] = await Promise.all([getTags(filters), getTagsStats()]);

  const getDescription = () => {
    if (filters.hasArticles === true) return "Viewing tags with articles";
    if (filters.hasArticles === false) return "Viewing tags without articles";
    if (filters.createdFrom || filters.createdTo) return "Viewing tags by date range";
    if (filters.minArticleCount !== undefined || filters.maxArticleCount !== undefined)
      return "Viewing tags by article count";
    return "Manage all tags in the system";
  };

  return (
    <div className="container mx-auto max-w-[1128px] space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">Tags</h1>
          <p className="text-muted-foreground mt-1">{getDescription()}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/tags/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Tag
            </Button>
          </Link>
        </div>
      </div>
      <TagsStats stats={stats} />
      <TagsFilters />
      <TagsPageClient tags={tags} />
    </div>
  );
}
