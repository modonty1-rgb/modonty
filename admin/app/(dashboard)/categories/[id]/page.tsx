import { redirect } from "next/navigation";
import { getCategoryById, getCategoryArticles } from "../actions/categories-actions";
import { PageHeader } from "@/components/shared/page-header";
import { CategoryView } from "./components/category-view";
import { CategoryArticles } from "./components/category-articles";
import { DeleteCategoryButton } from "./components/delete-category-button";

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
      <PageHeader
        title="Category Details"
        description="View category information and articles"
      />
      <div className="mb-6">
        <DeleteCategoryButton categoryId={id} />
      </div>
      <div className="space-y-6">
        <CategoryView category={category} />
        <CategoryArticles articles={articles} categoryId={id} />
      </div>
    </div>
  );
}
