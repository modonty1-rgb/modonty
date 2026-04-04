import { getCategories, getCategoriesStats } from "./actions/categories-actions";
import { CategoriesPageClient } from "./components/categories-page-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FolderTree, FileText } from "lucide-react";
import Link from "next/link";
import { RevalidateAllSEOButton } from "./components/revalidate-all-seo-button";

export default async function CategoriesPage() {
  const [categories, stats] = await Promise.all([getCategories(), getCategoriesStats()]);
  const missingSeo = categories.filter((c: any) => !c.jsonLdLastGenerated).length;

  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold">Categories</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Manage all categories in the system</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1.5 font-normal">
              <FolderTree className="h-3 w-3 text-primary" />
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
          <Link href="/categories/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Category
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <CategoriesPageClient categories={categories} missingSeoCount={missingSeo} />
    </div>
  );
}
