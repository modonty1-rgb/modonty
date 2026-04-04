import { redirect } from "next/navigation";
import { getCategoryById, getCategories } from "../../actions/categories-actions";
import { CategoryForm } from "../../components/category-form";
import { DeleteCategoryButton } from "../components/delete-category-button";
import { RevalidateSEOButton } from "../components/revalidate-seo-button";
import { SeoCachePreview } from "@/components/shared/seo-cache-preview";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [category, categories] = await Promise.all([getCategoryById(id), getCategories()]);

  if (!category) {
    redirect("/categories");
  }

  return (
    <div className="container mx-auto max-w-[1128px]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">Edit Category</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Update category information</p>
        </div>
        <div className="flex items-center gap-2">
          <RevalidateSEOButton categoryId={id} />
          <DeleteCategoryButton categoryId={id} />
        </div>
      </div>
      <SeoCachePreview
        jsonLd={category.jsonLdStructuredData}
        metaTags={category.nextjsMetadata}
        lastGenerated={category.jsonLdLastGenerated}
      />
      <CategoryForm
        initialData={category as any}
        categories={categories}
        categoryId={id}
      />
    </div>
  );
}
