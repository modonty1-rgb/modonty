import { getCategories } from "../actions/categories-actions";
import { PageHeader } from "@/components/shared/page-header";
import { CategoryForm } from "../components/category-form";

export default async function NewCategoryPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader title="Create Category" description="Add a new category to the system" />
      <CategoryForm categories={categories} />
    </div>
  );
}
