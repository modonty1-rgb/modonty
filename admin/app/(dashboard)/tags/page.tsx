import { getTags, TagFilters } from "./actions/tags-actions";
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
    hasArticles: params.hasArticles === "yes" ? true : params.hasArticles === "no" ? false : undefined,
    createdFrom: params.createdFrom ? new Date(params.createdFrom) : undefined,
    createdTo: params.createdTo ? new Date(params.createdTo) : undefined,
    minArticleCount: params.minArticleCount ? parseInt(params.minArticleCount) : undefined,
    maxArticleCount: params.maxArticleCount ? parseInt(params.maxArticleCount) : undefined,
  };

  const tags = await getTags(filters);
  const missingSeo = tags.filter((t) => !t.jsonLdLastGenerated).length;

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold">Tags</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage all tags in the system</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/tags/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Tag
            </Button>
          </Link>
        </div>
      </div>

      {/* Content — KPI cards (filters) + table */}
      <TagsPageClient tags={tags} missingSeoCount={missingSeo} />
    </div>
  );
}
