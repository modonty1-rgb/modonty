import { getCategories } from "./actions/categories-actions";
import { CategoriesPageClient } from "./components/categories-page-client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { RevalidateAllSEOButton } from "./components/revalidate-all-seo-button";

export default async function CategoriesPage() {
  const categories = await getCategories();
  const missingSeo = categories.filter((c) => !c.jsonLdLastGenerated).length;

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold">Categories</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage all categories in the system</p>
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

      {/* Content — KPI cards (filters) + table */}
      <CategoriesPageClient categories={categories} missingSeoCount={missingSeo} />
    </div>
  );
}
