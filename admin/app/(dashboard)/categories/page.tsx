import { getCategories, getCategoriesStats } from "./actions/categories-actions";
import { CategoriesStats } from "./components/categories-stats";
import { CategoriesPageClient } from "./components/categories-page-client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { RevalidateAllSEOButton } from "./components/revalidate-all-seo-button";

export default async function CategoriesPage() {
  const [categories, stats] = await Promise.all([getCategories(), getCategoriesStats()]);

  return (
    <div className="container mx-auto max-w-[1128px] space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">Categories</h1>
          <p className="text-muted-foreground mt-1">Manage all categories in the system</p>
        </div>
        <div className="flex items-center gap-2">
          <RevalidateAllSEOButton />
          <Link href="/categories/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Category
            </Button>
          </Link>
        </div>
      </div>
      <CategoriesStats
        stats={stats}
        missingSeoCount={categories.filter((c: any) => !c.jsonLdLastGenerated).length}
      />
      <CategoriesPageClient categories={categories} />
    </div>
  );
}
