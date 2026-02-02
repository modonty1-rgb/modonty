import { redirect } from "next/navigation";
import { getCategoryById, getCategories } from "../../actions/categories-actions";
import { PageHeader } from "@/components/shared/page-header";
import { CategoryForm } from "../../components/category-form";
import { DeleteCategoryButton } from "../components/delete-category-button";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [category, categories] = await Promise.all([getCategoryById(id), getCategories()]);

  if (!category) {
    redirect("/categories");
  }

  return (
    <div className="container mx-auto max-w-[1128px]">
      <PageHeader title="Edit Category" description="Update category information" />
      <div className="mb-6">
        <DeleteCategoryButton categoryId={id} />
      </div>
      <CategoryForm
        initialData={category}
        categories={categories}
        categoryId={id}
      />
    </div>
  );
}
