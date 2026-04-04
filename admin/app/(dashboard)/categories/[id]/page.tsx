import { redirect } from "next/navigation";
import { getCategoryById, getCategoryArticles } from "../actions/categories-actions";
import { CategoryView } from "./components/category-view";
import { CategoryArticles } from "./components/category-articles";
import { DeleteCategoryButton } from "./components/delete-category-button";
import { RevalidateSEOButton } from "./components/revalidate-seo-button";

export default async function CategoryViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [category, articles] = await Promise.all([
    getCategoryById(id),
    getCategoryArticles(id),
  ]);

  if (!category) {
    redirect("/categories");
  }

  return (
    <div className="container mx-auto max-w-[1128px]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">Category Details</h1>
          <p className="text-sm text-muted-foreground mt-0.5">View category information and articles</p>
        </div>
        <div className="flex items-center gap-2">
          <RevalidateSEOButton categoryId={id} />
          <DeleteCategoryButton categoryId={id} />
        </div>
      </div>
      <div className="space-y-6">
        <CategoryView category={category as any} />
        <CategoryArticles articles={articles} categoryId={id} />
      </div>
    </div>
  );
}
