import { Card, CardContent } from "@/components/ui/card";
import Link from "@/components/link";
import { cn } from "@/lib/utils";
import { CategoryLink } from "./CategoryLink";
import type { CategoryResponse } from "@/lib/types";

interface CategoriesCardProps {
  categories: CategoryResponse[];
  currentCategorySlug?: string;
  totalArticlesAll: number;
}

export function CategoriesCard({ categories, currentCategorySlug, totalArticlesAll }: CategoriesCardProps) {
  return (
    <Card className="flex-1 min-h-0">
      <CardContent className="p-4 flex h-full flex-col">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase">
            الفئات
          </h2>
          <Link
            href="/"
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] border transition-colors",
              !currentCategorySlug
                ? "bg-muted text-primary border-border"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            جميع الفئات
            <span className="text-[10px] text-muted-foreground">{totalArticlesAll}</span>
          </Link>
        </div>
        <div className=" flex-1 min-h-0 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {categories.map((category) => (
            <CategoryLink
              key={category.id}
              label={category.name}
              count={category.articleCount}
              slug={category.slug}
              isActive={currentCategorySlug === category.slug}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
