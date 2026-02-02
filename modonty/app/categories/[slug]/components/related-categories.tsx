import { getCategoriesEnhanced } from "@/app/api/helpers/category-queries";
import { EnhancedCategoryCard } from "../../components/enhanced-category-card";

interface RelatedCategoriesProps {
  currentCategoryId: string;
  currentCategoryName: string;
}

export async function RelatedCategories({ currentCategoryId, currentCategoryName }: RelatedCategoriesProps) {
  const allCategories = await getCategoriesEnhanced({});
  
  const relatedCategories = allCategories
    .filter(cat => cat.id !== currentCategoryId)
    .slice(0, 4);

  if (relatedCategories.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">فئات ذات صلة</h2>
        <p className="text-muted-foreground">استكشف فئات أخرى قد تهمك</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedCategories.map((category) => (
          <EnhancedCategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
