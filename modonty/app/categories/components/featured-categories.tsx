import { EnhancedCategoryCard } from "./enhanced-category-card";
import type { CategoryResponse } from "@/lib/types";

interface FeaturedCategoriesProps {
  categories: CategoryResponse[];
}

export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">الفئات المميزة</h2>
        <p className="text-muted-foreground">الفئات الأكثر نشاطًا ومحتوى</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.slice(0, 4).map((category, index) => (
          <EnhancedCategoryCard 
            key={category.id} 
            category={category}
            priority={index < 2}
          />
        ))}
      </div>
    </div>
  );
}
