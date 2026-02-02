import { getCategories } from "../actions/categories-actions";
import { PageHeader } from "@/components/shared/page-header";
import { CategoryForm } from "../components/category-form";

export default async function NewCategoryPage() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto max-w-[1128px]">
      <PageHeader title="Create Category" description="Add a new category to the system" />
      <CategoryForm categories={categories} />
    </div>
  );
}
