import { redirect } from "next/navigation";
import { getCategoryById, getCategories } from "../../actions/categories-actions";
import { PageHeader } from "@/components/shared/page-header";
import { CategoryForm } from "../../components/category-form";
import { DeleteCategoryButton } from "../components/delete-category-button";
import { RevalidateSEOButton } from "../components/revalidate-seo-button";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [category, categories] = await Promise.all([getCategoryById(id), getCategories()]);

  if (!category) {
    redirect("/categories");
  }

  return (
    <div className="container mx-auto max-w-[1128px]">
      <PageHeader title="Edit Category" description="Update category information" />
      <div className="mb-6 flex items-center gap-3">
        <DeleteCategoryButton categoryId={id} />
        <RevalidateSEOButton categoryId={id} />
      </div>
      {category.jsonLdStructuredData && (
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-green-600">✅ SEO Cache</span>
            {category.jsonLdLastGenerated && (
              <span className="text-xs text-muted-foreground">
                Last generated: {new Date(category.jsonLdLastGenerated).toLocaleDateString("en-GB")}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1 font-medium">JSON-LD</p>
              <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-48 whitespace-pre-wrap">
                {String(JSON.stringify(JSON.parse(category.jsonLdStructuredData), null, 2))}
              </pre>
            </div>
            {category.nextjsMetadata && (
              <div>
                <p className="text-xs text-muted-foreground mb-1 font-medium">Meta Tags</p>
                <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-48 whitespace-pre-wrap">
                  {String(JSON.stringify(category.nextjsMetadata, null, 2))}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
      <CategoryForm
        initialData={category as any}
        categories={categories}
        categoryId={id}
      />
    </div>
  );
}
