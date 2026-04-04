import { getTags, getTagsStats, TagFilters } from "./actions/tags-actions";
import { TagsPageClient } from "./components/tags-page-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Hash, FileText } from "lucide-react";
import Link from "next/link";
import { RevalidateAllSEOButton } from "./components/revalidate-all-seo-button";

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

  const [tags, stats] = await Promise.all([getTags(filters), getTagsStats()]);
  const missingSeo = tags.filter((t: any) => !t.jsonLdLastGenerated).length;

  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold">Tags</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Manage all tags in the system</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1.5 font-normal">
              <Hash className="h-3 w-3 text-primary" />
              {stats.total} total
            </Badge>
            <Badge variant="secondary" className="gap-1.5 font-normal">
              <FileText className="h-3 w-3 text-emerald-500" />
              {stats.withArticles} with articles
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RevalidateAllSEOButton />
          <Link href="/tags/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Tag
            </Button>
          </Link>
        </div>
      </div>
      <TagsPageClient tags={tags} missingSeoCount={missingSeo} />
    </div>
  );
}
